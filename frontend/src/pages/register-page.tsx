import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import '../App.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Create account</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Sign in</Link>
        </nav>
      </header>

      <section className="panel">
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
            />
          </label>
          <p className="hint">
            Password rules: at least 12 characters, uppercase, lowercase, digit, and symbol (
            <code>!@#$…</code>).
          </p>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}
