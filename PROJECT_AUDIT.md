# Project audit — 2026-11-16

Scope: local source review, lint, existing tests, TypeScript, production Webpack build, and isolated runtime probes. Application source was not changed during this audit. This is a list of identified issues, not a guarantee that every possible defect has been discovered.

## Fixes applied after the audit

The five requested data-loss issues (items 3–7) have been addressed: recovery no longer clears storage; local persistence failures reject; stored records are validated; visited document tools retain their state while switching; and cloud reads merge local records while preserving pending edits. Seven storage regression tests cover corrupt records, quota failures, cloud failure/recovery, and profile defaults. Unsaved draft retention is limited to the current page session; reload persistence is not added.

## Checks

- `npm run lint`: passes with 8 warnings (3 internal-navigation warnings in error pages; 5 image warnings in ResumeBuilder).
- `npm test`: passes (runner reports 4 test files).
- `node node_modules/typescript/bin/tsc --noEmit`: passes.
- `npm run build -- --webpack`: passes, including all 13 generated pages.
- Default Turbopack build previously failed here because creating a local port was prohibited. This is an environment limitation, not evidence of an application CSS bug.
- Isolated runtime probes: all 8 POST handlers return HTTP 500 for malformed JSON and JSON `null`; stored letters set to JSON `null` crash `getCoverLetterById`; a simulated quota error still makes `saveCoverLetter` resolve successfully.

## High priority

1. **Paid checkout sessions can be redeemed repeatedly.** `src/app/page.tsx:43` grants 15 credits whenever a verified pack session appears in the URL. `src/app/api/stripe/verify/route.ts:4` has no redemption record or authenticated ownership check. Revisiting a previously paid session URL grants another pack; sharing it allows another browser to receive the same entitlement. Fix with authenticated, durable, idempotent fulfillment. Confirmed by source review; no real payment was made.

2. **Paid access and generation limits have no server enforcement.** `src/lib/usage.ts:72` trusts a browser localStorage boolean for Pro access, while generation endpoints do not authenticate or enforce quotas. Browser flags/counters can be changed and direct API requests bypass the UI limits. Pro is also never revalidated when a subscription expires or is canceled. Enforce entitlements and usage on the server, tied to a user account. The absence of enforcement is confirmed in source; Stripe account configuration was not inspected.

3. **Crash recovery deletes user documents and purchased access.** `src/app/error.tsx:20` clears all localStorage and sessionStorage, preserving only API keys and theme preferences. The “Reset Corrupt Session State” action therefore deletes saved letters, profiles, the saved photo, credits, Pro state, and possibly authentication state. Preserve durable user data; reset only a specifically identified invalid cache entry, with an explicit destructive-data warning if deletion is actually needed.

4. **Failed writes report successful saves.** `src/lib/storage.ts:176` catches storage write failures without propagating them. Saving a letter/profile then returns normally, so the UI displays success even if storage is full or blocked. Runtime probe confirmed a letter save resolves successfully without persisting anything. Return a failure when no persistence destination succeeds and have the UI display it.

5. **Valid JSON with an invalid shape crashes storage consumers.** `src/lib/storage.ts:169` blindly casts parsed JSON to the requested type. For example, `ai_cover_letters_v1 = "null"` makes `getCoverLetterById` fail at `.find`; objects and malformed array entries can similarly break lists and profile editors. Validate container and record shapes before using persisted data. Runtime-confirmed for null letters.

6. **Cloud reads can hide locally saved documents.** `src/lib/storage.ts:186` and `:320` always prefer a successful Supabase read, including an empty list. Writes save locally first but ignore returned Supabase `{ error }` values (`:253`, `:412`). If a write is rejected by RLS/schema/connectivity and a subsequent read succeeds, the locally saved document disappears from the UI. Track and surface failed synchronization; reconcile pending local records instead of silently discarding them from reads. Source-confirmed control flow; live database policies were not tested.

7. **Resume/CV edits and generated letters are lost on navigation.** `src/components/ResumeBuilder.tsx:1035`, `src/components/CvBuilder.tsx:141`, and `src/components/MVPGenerator.tsx:40` keep document contents only in component state. `src/app/page.tsx:167` conditionally mounts the active tool, so switching sidebar tools unmounts it. Returning resets documents to samples or an empty generated letter. Persist drafts or lift document state above the tool-switching boundary.

## Medium priority

8. **Cloud-only cover letters cannot change status.** `src/lib/storage.ts:274` first loads a letter through the cloud-capable lookup, then requires the same ID to exist in localStorage (`:285`). A letter fetched on a new device returns null before any Supabase update. Update the authoritative record and populate the local cache rather than requiring a preexisting local copy.

9. **Default-profile operations use incomplete local data.** `src/lib/storage.ts:439` searches only local profiles. Selecting a cloud-only profile can clear defaults without setting the target locally; it returns null so the UI does not update. `saveResumeProfile` also allows the sole profile to become nondefault when its default checkbox is unchecked (`:385`). Resolve targets from the current profile list and enforce exactly one default whenever profiles remain.

10. **The Studio Editor button opens the generator instead.** `src/app/page.tsx:223` sets `activeLetter` to null, which renders `MVPGenerator` (`:218`). When already in the generator the button does nothing. `MVPGenerator` also has no save/open-editor callback, so its generated output never reaches the tracker or advanced editor. Pass generated content into a draft and open the editor explicitly.

11. **Auth modal remains disabled after a successful login/signup.** `src/components/AuthBillingModal.tsx:97` leaves `loading` true on success. Reopening resets messages and `succeededRef` (`:36`) but does not reset `loading`. The mounted modal's submit/checkout buttons remain disabled. Reset loading when opening/closing and handle outstanding operations consistently.

12. **API inputs lack runtime validation.** Each POST route treats request JSON as a TypeScript interface. Malformed JSON, null bodies, numeric string fields, and arrays with nonstring skills can throw into the generic HTTP 500 handler rather than returning HTTP 400. Runtime probes confirmed malformed JSON and null fail with 500 across generate, improve, match-score, cold-email, job-import, resume/generate, resume/enhance-bullet, and stripe/checkout. Add shared JSON/schema validation and limits before processing input; validate enum values such as improve action.

13. **Blocked browser storage can crash the page.** `src/components/ApiSettingsModal.tsx:19` and `src/components/TopHeader.tsx:47` access localStorage in effects without guards. ApiSettingsModal mounts even when closed, so its effect still executes. Browser storage restrictions can therefore trigger the route error page immediately. The settings submit handler also has unguarded writes. Handle storage denial with usable in-memory defaults and a clear save error.

14. **Improve ignores the user's model/provider selection.** `src/components/CoverLetterEditor.tsx:112` sends model and Anthropic credentials, but `src/app/api/improve/route.ts:7` does not consume either and always attempts Gemini. A user selecting Claude with only a Claude key silently gets rule-based output. Implement the selected provider or accurately limit the UI to supported providers.

15. **Editing can invent candidate qualifications.** `src/lib/atsUtils.ts:191` adds “hands-on experience” with a missing keyword without candidate evidence. `src/app/api/improve/route.ts:176` similarly claims skills extracted only from the job description, and `:142` converts “I tried to” into “I successfully.” These transforms can add false claims despite the generator's grounding rules. Require confirmation of skills and preserve factual outcomes during rewriting.

16. **Remaining-generation count underreports available usage.** `src/lib/usage.ts:40` returns paid credits instead of paid credits plus unused free generations. Probe: with 2 purchased credits and all 5 free generations unused, it reports 2 even though the app permits 7 total generations. Calculate and display the combined allowance, or clearly display the two balances separately.

17. **ATS results remain stale after inputs are cleared.** `src/components/MVPGenerator.tsx:84` recalculates only when the job description and a document are nonempty; it has no branch clearing atsResult. Clearing either input leaves the previous score/keywords visible. Clear the analysis when its required inputs are absent and invalidate it when loading replacement samples.

18. **Invalid app-origin configuration crashes root metadata.** `src/app/layout.tsx:22` calls `new URL(APP_URL)` at module load without validation. An origin such as `jobbeam.vercel.app` (missing scheme) makes the root layout fail during build/render. Validate the environment value and provide an actionable configuration error or fallback.

## Additional risks requiring deployment checks

- Supabase table ownership/RLS cannot be verified from this repository. Storage requests do not insert a user ID explicitly and broad profile-default updates rely on server-side RLS for account isolation. Inspect deployed policies and schema before claiming data isolation is safe or unsafe.
- Job-import DNS validation and fetch perform separate resolutions (`src/app/api/job-import/route.ts:484`), leaving a potential DNS-rebinding gap. Verify destination pinning/network egress protections; no exploit was attempted.
- Live Gemini/Claude responses, Stripe subscription lifecycle, Supabase authentication, browser interactions, and PDF exports were not exercised against real services in this audit.
- README lists checkout as GET even though the implemented handler and UI use POST.

## Suggested order

Fix payment fulfillment/server enforcement and destructive reset first, then persistence and draft retention, then validation and UI state bugs. Add regression tests around the reproduced failure cases: the current passing test suite does not establish correctness of these flows.
