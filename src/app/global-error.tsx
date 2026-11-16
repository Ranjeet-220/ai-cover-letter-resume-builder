'use client';

import React, { useEffect } from 'react';
import { getErrorMessage } from '../lib/errors';

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Global root layout error:', error);
  }, [error]);

  const message = getErrorMessage(error, 'An unexpected runtime error occurred.');

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '24px',
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '24px',
            padding: '36px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '20px',
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em',
            }}
          >
            System Error
          </h1>

          <p
            style={{
              fontSize: '13px',
              color: '#a1a1aa',
              lineHeight: 1.6,
              margin: '0 0 24px 0',
            }}
          >
            A critical error occurred in the root application layout. You can attempt to reload the application.
          </p>

          {message && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#000000',
                border: '1px solid #27272a',
                borderRadius: '12px',
                color: '#fca5a5',
                fontFamily: 'monospace',
                fontSize: '11px',
                textAlign: 'left',
                marginBottom: '24px',
                wordBreak: 'break-word',
              }}
            >
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={retry}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontWeight: 700,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: '#18181b',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '12px',
                border: '1px solid #3f3f46',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
