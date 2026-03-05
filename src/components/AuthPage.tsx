import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type AuthMode = 'login' | 'signup';

type AuthPageProps = {
  onLogin: (input: { email: string; password: string }) => Promise<void>;
  onSignUp: (input: { name: string; email: string; password: string }) => Promise<void>;
};

export default function AuthPage({ onLogin, onSignUp }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add('auth-mode');
    return () => document.body.classList.remove('auth-mode');
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Name is required.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setSubmitting(true);
      if (mode === 'login') {
        await onLogin({ email: email.trim(), password });
      } else {
        await onSignUp({ name: name.trim(), email: email.trim(), password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <aside className="auth-brand">
          <div className="auth-chip">
            <span className="blink-dot" />
            ARCA MEMBERS
          </div>
          <h1 className="auth-title">
            Enter the
            <br />
            Studio of
            <em> Rare</em>
            <br />
            Objects
          </h1>
          <p className="auth-copy">
            Access curated drops, saved selections, and first release windows crafted for ARCA members.
          </p>
          <div className="auth-meta">Private Access • Curated Editions • Studio Notes</div>
        </aside>

        <section className="auth-form-wrap">
          <div className="auth-head">
            <p className="ey">Account Access</p>
            <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' ? (
              <label className="auth-field">
                <span>Full Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hana Karim" />
              </label>
            ) : null}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {mode === 'signup' ? (
              <label className="auth-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
            ) : null}

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="bp auth-submit" type="submit" disabled={submitting}>
              <span>{submitting ? 'Please wait...' : mode === 'login' ? 'Login to ARCA' : 'Create Account'}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
