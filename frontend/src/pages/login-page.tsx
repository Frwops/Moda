import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import '../App.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogleIdToken, bootstrapping } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const raw = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (typeof raw !== 'string' || raw.length === 0 || !googleBtnRef.current) {
      return;
    }
    const clientId = raw;
    const el = googleBtnRef.current;
    let cancelled = false;

    function schedule(): void {
      if (cancelled) {
        return;
      }
      if (window.google?.accounts?.id) {
        el.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setError(null);
              setSubmitting(true);
              await loginWithGoogleIdToken(response.credential);
              navigate('/');
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Google sign-in failed');
            } finally {
              setSubmitting(false);
            }
          },
        });
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 280,
        });
        return;
      }
      requestAnimationFrame(schedule);
    }

    schedule();
    return () => {
      cancelled = true;
      el.innerHTML = '';
    };
  }, [googleClientId, loginWithGoogleIdToken, navigate]);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Sign in</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="panel">
        {bootstrapping ? <p>Checking session…</p> : null}
        <form className="auth-form" onSubmit={(e) => void onSubmit(e)}>
          <label className="field">
            <span>Email (@gmail.com / @googlemail.com)</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="primary" disabled={submitting || bootstrapping}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {googleClientId ? (
          <div className="google-wrap">
            <p className="hint">Or continue with Google (consumer Gmail only)</p>
            <div ref={googleBtnRef} className="google-btn-host" />
          </div>
        ) : (
          <p className="hint">
            Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env.local</code> to enable
            Google sign-in.
          </p>
        )}
      </section>
    </main>
  );
}
