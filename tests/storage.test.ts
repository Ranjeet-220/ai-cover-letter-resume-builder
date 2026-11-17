import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Load the real storage module with an isolated cloud client; no network or real user data.
function fixture(cloud = false) {
  const values = new Map<string, string>();
  let writeFails = false;
  let cloudFails = false;
  let rows: Record<string, unknown>[] = [];
  let writes = 0;
  const browserStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (writeFails) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
  };
  const client = {
    from: () => ({
      select: () => ({ order: async () => ({ data: rows, error: cloudFails ? new Error('offline') : null }) }),
      upsert: async () => { writes++; return { error: cloudFails ? new Error('write rejected') : null }; },
      delete: () => ({ eq: async () => ({ error: cloudFails ? new Error('delete rejected') : null }) }),
    }),
  };
  const source = readFileSync(new URL('../src/lib/storage.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const storageModule = { exports: {} };
  const require = createRequire(import.meta.url);
  new Function('require', 'module', 'exports', 'window', 'localStorage', 'console', compiled)(
    (name: string) => name === './supabase.ts'
      ? { supabase: cloud ? client : null, isSupabaseConfigured: () => cloud }
      : require(name),
    storageModule, storageModule.exports, {}, browserStorage, { warn() {} },
  );
  return {
    api: storageModule.exports as typeof import('../src/lib/storage.ts'), values,
    failWrites: () => { writeFails = true; },
    failCloud: (fail: boolean) => { cloudFails = fail; },
    cloudRows: (data: Record<string, unknown>[]) => { rows = data; },
    cloudWrites: () => writes,
  };
}
const lettersKey = 'ai_cover_letters_v1';
const profilesKey = 'ai_resume_profiles_v1';

test('corrupt JSON, nonarrays, and invalid entries cannot crash document reads', async () => {
  const f = fixture();
  for (const raw of ['{', 'null', '{}', '42', '[null,42,{}, {"id":"broken"}]']) {
    f.values.set(lettersKey, raw);
    f.values.set(profilesKey, raw);
    assert.deepEqual(await f.api.getCoverLetters(), []);
    assert.equal(await f.api.getCoverLetterById('missing'), null);
    assert.deepEqual(await f.api.getResumeProfiles(), []);
    assert.equal(f.values.get(lettersKey), raw, 'reading must not destroy the damaged original');
  }
});

test('salvages usable records and normalizes unsafe fields', async () => {
  const f = fixture();
  f.values.set(profilesKey, JSON.stringify([null, { id: 'p', fullName: 'Ada', skills: [null, 42, 'React'], name: {}, isDefault: 'yes' }]));
  const profiles = await f.api.getResumeProfiles();
  assert.equal(profiles.length, 1);
  assert.deepEqual(profiles[0].skills, ['React']);
  assert.equal(profiles[0].name, '');
  assert.equal(profiles[0].isDefault, false);
  f.values.set(lettersKey, JSON.stringify([{ id: 'l', content: 'Draft', status: 'interview', matchScore: 'bad' }]));
  assert.equal((await f.api.getCoverLetters())[0].status, 'Interviewing');
  assert.equal((await f.api.getCoverLetters())[0].matchScore, 0);
});

test('quota failures reject saves, status changes, and deletion instead of reporting success', async () => {
  const f = fixture();
  const letter = await f.api.saveCoverLetter({ title: 'Draft', content: 'Keep this text' });
  const before = f.values.get(lettersKey);
  f.failWrites();
  await assert.rejects(f.api.saveCoverLetter({ ...letter, content: 'Changed' }), /Could not save/);
  await assert.rejects(f.api.saveResumeProfile({ name: 'Primary', fullName: 'Ada' }), /Could not save/);
  await assert.rejects(f.api.updateCoverLetterStatus(letter.id, 'Applied'), /Could not save/);
  await assert.rejects(f.api.deleteCoverLetter(letter.id), /Could not save/);
  assert.equal(f.values.get(lettersKey), before);
});

test('rejected cloud saves remain visible after empty or stale successful cloud reads', async () => {
  const f = fixture(true);
  f.failCloud(true);
  const saved = await f.api.saveCoverLetter({ title: 'Offline letter', content: 'Local work' });
  const profile = await f.api.saveResumeProfile({ name: 'Offline profile', fullName: 'Ada' });
  f.failCloud(false);
  assert.equal((await f.api.getCoverLetters())[0].content, 'Local work');
  assert.equal((await f.api.getResumeProfiles())[0].fullName, 'Ada');
  f.cloudRows([{ id: saved.id, title: 'Cloud', content: 'Older content', updated_at: '2099-01-01T00:00:00Z' }]);
  assert.equal((await f.api.getCoverLetters())[0].content, 'Local work', 'pending edits win even with clock skew');
  f.cloudRows([{ id: profile.id, full_name: 'Old name', updated_at: '2099-01-01T00:00:00Z' }]);
  assert.equal((await f.api.getResumeProfiles())[0].fullName, 'Ada');
});

test('successful cloud sync permits newer remote edits while preserving local-only records', async () => {
  const f = fixture(true);
  const saved = await f.api.saveCoverLetter({ title: 'Letter', content: 'Original' });
  assert.equal(f.cloudWrites(), 1);
  f.cloudRows([{ id: saved.id, content: 'Edited on another device', updated_at: '2099-01-01T00:00:00Z' }, { id: 'remote-only', content: 'Remote letter' }]);
  const letters = await f.api.getCoverLetters();
  assert.equal(letters.length, 2);
  assert.equal(letters.find((l) => l.id === saved.id)?.content, 'Edited on another device');
  assert.equal((await f.api.updateCoverLetterStatus('remote-only', 'Applied'))?.status, 'Applied');
});

test('profile defaults work for cloud-only records and a single remaining profile', async () => {
  const f = fixture(true);
  f.cloudRows([{ id: 'remote-profile', full_name: 'Ada', name: 'Primary', is_default: false }]);
  assert.equal((await f.api.setDefaultResumeProfile('remote-profile'))?.isDefault, true);
  const saved = await f.api.saveResumeProfile({ id: 'remote-profile', name: 'Primary', fullName: 'Ada', isDefault: false });
  assert.equal(saved.isDefault, true);
  assert.equal(await f.api.setDefaultResumeProfile('missing'), null);
});

test('failed cloud deletion keeps the durable local document', async () => {
  const f = fixture(true);
  const saved = await f.api.saveCoverLetter({ title: 'Keep', content: 'Text' });
  f.failCloud(true);
  await assert.rejects(f.api.deleteCoverLetter(saved.id), /Could not delete/);
  assert.equal((await f.api.getCoverLetterById(saved.id))?.content, 'Text');
});
