import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Put this file at: src/components/LoginScreen.tsx

const BG = '#F1F1E9';
const INK = '#252525';
const MUTED = '#8C8C84';
const NAVY = '#1E2A3A';
const ERROR = '#B4412F';
const OK = '#2F7A4F';

const SHADOW_DARK = 'rgba(184,184,168,0.55)';
const SHADOW_LIGHT = 'rgba(255,255,255,0.95)';
const CARD = `14px 14px 34px ${SHADOW_DARK}, -14px -14px 34px ${SHADOW_LIGHT}`;
const RAISED_SM = `5px 5px 11px ${SHADOW_DARK}, -5px -5px 11px ${SHADOW_LIGHT}`;
const INSET = `inset 4px 4px 9px rgba(184,184,168,0.5), inset -4px -4px 9px ${SHADOW_LIGHT}`;
const INSET_BIG = `inset 10px 10px 22px rgba(184,184,168,0.38), inset -10px -10px 22px ${SHADOW_LIGHT}`;

// The Google button only appears when you set VITE_GOOGLE_AUTH=true on Vercel
const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_AUTH === 'true';

const FONT = "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif";
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');";

type Mode = 'signin' | 'signup' | 'forgot';

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="min-h-screen w-full flex items-center justify-center p-4"
    style={{ background: BG, fontFamily: FONT, color: INK }}
  >
    <style>{FONT_IMPORT}</style>
    {children}
  </div>
);

const Field: React.FC<{
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}> = ({ type = 'text', placeholder, value, onChange, autoComplete }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    autoComplete={autoComplete}
    required
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-5 py-3.5 text-[13px] rounded-xl outline-none"
    style={{ background: BG, boxShadow: INSET, color: INK, border: 'none' }}
  />
);

export const FullScreenMessage: React.FC<{ text: string }> = ({ text }) => (
  <Page>
    <div className="px-8 py-6 rounded-2xl text-sm font-semibold" style={{ background: BG, boxShadow: RAISED_SM, color: MUTED }}>
      {text}
    </div>
  </Page>
);

export const NoAccessScreen: React.FC<{ email: string; onSignOut: () => void }> = ({ email, onSignOut }) => (
  <Page>
    <div
      className="w-full max-w-[460px] rounded-[28px] p-10 flex flex-col items-center text-center gap-4"
      style={{ background: BG, boxShadow: CARD }}
    >
      <h1 className="text-2xl font-extrabold">No salon linked</h1>
      <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>
        The account <strong style={{ color: INK }}>{email}</strong> is not linked to any salon yet. Ask the salon owner
        to invite this email, then sign out and sign in again.
      </p>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-2 px-10 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] text-white"
        style={{ background: NAVY, boxShadow: '0 10px 20px rgba(30,42,58,0.3)' }}
      >
        Sign out
      </button>
    </div>
  </Page>
);

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, sendPasswordReset, updatePassword, signInWithGoogle, isRecovery } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Opened from a "reset password" email: show the new-password form
  const view: Mode | 'recovery' = isRecovery ? 'recovery' : mode;

  const go = (next: Mode) => {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
    setConfirm('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');

    if (view === 'signup' || view === 'recovery') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (view === 'signin') {
        const err = await signIn(email, password);
        if (err) setError(err);
      } else if (view === 'signup') {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else if (result.needsConfirmation) {
          setMode('signin');
          setPassword('');
          setConfirm('');
          setNotice('Account created. Check your email and click the confirmation link, then sign in.');
        }
      } else if (view === 'forgot') {
        const err = await sendPasswordReset(email);
        if (err) setError(err);
        else setNotice('If this email has an account, a reset link is on its way.');
      } else {
        const err = await updatePassword(password);
        if (err) setError(err);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    const err = await signInWithGoogle();
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  const title =
    view === 'signin'
      ? 'Sign in to FadeCraft'
      : view === 'signup'
        ? 'Create Account'
        : view === 'forgot'
          ? 'Reset Password'
          : 'New Password';

  const subtitle =
    view === 'signup'
      ? 'Use the email your salon owner invited.'
      : view === 'forgot'
        ? 'Enter your email and we will send you a reset link.'
        : view === 'recovery'
          ? 'Choose a new password for your account.'
          : '';

  const submitLabel =
    view === 'signin'
      ? 'Sign in'
      : view === 'signup'
        ? 'Sign up'
        : view === 'forgot'
          ? 'Send reset link'
          : 'Save password';

  const showEmail = view !== 'recovery';
  const showPassword = view === 'signin' || view === 'signup' || view === 'recovery';
  const showConfirm = view === 'signup' || view === 'recovery';
  const showGoogle = GOOGLE_ENABLED && (view === 'signin' || view === 'signup');

  return (
    <Page>
      <div
        className="relative w-full max-w-[980px] rounded-[28px] grid md:grid-cols-2 overflow-hidden"
        style={{ background: BG, boxShadow: CARD }}
      >
        {/* LEFT: the form */}
        <div className="px-6 py-10 sm:px-12 sm:py-14 flex flex-col items-center justify-center min-h-[540px]">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-center leading-tight">{title}</h1>

          {subtitle && (
            <p className="mt-3 text-[12px] text-center max-w-[300px] leading-relaxed" style={{ color: MUTED }}>
              {subtitle}
            </p>
          )}

          {showGoogle && (
            <>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogle}
                  aria-label="Continue with Google"
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-extrabold"
                  style={{ background: BG, boxShadow: RAISED_SM, color: INK }}
                >
                  G
                </button>
              </div>
              <span className="mt-5 text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: MUTED }}>
                or use your email account
              </span>
            </>
          )}

          <form onSubmit={submit} className="mt-6 w-full max-w-[340px] flex flex-col gap-4">
            {showEmail && (
              <Field
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
            )}
            {showPassword && (
              <Field
                type="password"
                placeholder={view === 'recovery' ? 'New password' : 'Password'}
                value={password}
                onChange={setPassword}
                autoComplete={view === 'signin' ? 'current-password' : 'new-password'}
              />
            )}
            {showConfirm && (
              <Field
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
              />
            )}

            {view === 'signin' && (
              <button
                type="button"
                onClick={() => go('forgot')}
                className="self-center text-[12px] pb-0.5"
                style={{ color: INK, borderBottom: `1px solid ${MUTED}` }}
              >
                Forgot your password?
              </button>
            )}

            {view === 'forgot' && (
              <button
                type="button"
                onClick={() => go('signin')}
                className="self-center text-[12px] pb-0.5"
                style={{ color: INK, borderBottom: `1px solid ${MUTED}` }}
              >
                Back to sign in
              </button>
            )}

            {error && (
              <p className="text-[12px] font-semibold text-center" style={{ color: ERROR }} role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="text-[12px] font-semibold text-center" style={{ color: OK }}>
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 self-center px-12 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
              style={{ background: NAVY, boxShadow: '0 10px 20px rgba(30,42,58,0.32)' }}
            >
              {busy ? 'Please wait...' : submitLabel}
            </button>
          </form>

          {/* Small screens have no right panel, so offer the switch here */}
          {!isRecovery && view !== 'forgot' && (
            <button
              type="button"
              onClick={() => go(view === 'signin' ? 'signup' : 'signin')}
              className="md:hidden mt-8 text-[12px] font-semibold"
              style={{ color: MUTED }}
            >
              {view === 'signin' ? 'Invited by your salon? Create account' : 'Already registered? Sign in'}
            </button>
          )}
        </div>

        {/* RIGHT: the welcome panel (hidden on small screens) */}
        <div className="hidden md:flex relative items-center justify-center overflow-hidden min-h-[540px]">
          <div
            className="absolute rounded-full"
            style={{ width: 340, height: 340, top: -190, left: '18%', boxShadow: INSET_BIG }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: 440, height: 440, bottom: -250, right: -90, boxShadow: INSET_BIG }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-14">
            {isRecovery ? (
              <>
                <h2 className="text-[28px] font-extrabold leading-tight">Almost there</h2>
                <p className="mt-4 text-[13px] leading-relaxed max-w-[260px]" style={{ color: INK }}>
                  Pick a new password and you will be signed in.
                </p>
              </>
            ) : view === 'signup' ? (
              <>
                <h2 className="text-[28px] font-extrabold leading-tight">Welcome Back!</h2>
                <p className="mt-4 text-[13px] leading-relaxed max-w-[260px]" style={{ color: INK }}>
                  Already have an account? Sign in to continue.
                </p>
                <button
                  type="button"
                  onClick={() => go('signin')}
                  className="mt-8 px-12 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: BG, boxShadow: RAISED_SM, color: INK }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <h2 className="text-[28px] font-extrabold leading-tight">Hello Friend!</h2>
                <p className="mt-4 text-[13px] leading-relaxed max-w-[260px]" style={{ color: INK }}>
                  Invited by your salon owner? Create your account and start working with us.
                </p>
                <button
                  type="button"
                  onClick={() => go('signup')}
                  className="mt-8 px-12 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: BG, boxShadow: RAISED_SM, color: INK }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};
