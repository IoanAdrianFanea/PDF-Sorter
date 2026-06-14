import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../api/auth';

/**
 * VerifyEmail page — loaded when a user clicks the link in their verification email.
 *
 * URL: /verify-email?token=<raw-token>
 *
 * useEffect fires once on mount and calls the backend to consume the token.
 * Three render states: loading → success → error.
 */
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link. Please use the link from your email.');
      return;
    }

    // Call backend once on mount — no deps needed (token comes from URL, not React state)
    authService
      .verifyEmail(token)
      .then((res) => {
        setMessage(res.message);
        setStatus('success');
      })
      .catch((err: unknown) => {
        setMessage(
          err instanceof Error
            ? err.message
            : 'Email verification failed. The link may have already been used or has expired.',
        );
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl shadow-lg p-8 text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant">Verifying your email address…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-on-surface">Email verified!</h1>
            <p className="text-on-surface-variant text-sm">{message}</p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go to sign in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-on-surface">Verification failed</h1>
            <p className="text-on-surface-variant text-sm">{message}</p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
