import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../api/client';

type RootResponse = {
  readonly name: string;
  readonly version: string;
};

type HealthResponse = {
  readonly status: string;
};

export function HomePage() {
  const [root, setRoot] = useState<RootResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const [r, h] = await Promise.all([
          fetchJson<RootResponse>('/api/v1'),
          fetchJson<HealthResponse>('/api/v1/health'),
        ]);
        if (!cancelled) {
          setRoot(r);
          setHealth(h);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page">
      <header className="header">
        <h1>Moda</h1>
        <p className="tagline">Fashion app — frontend + API smoke check</p>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>

      <section className="panel">
        <h2>API</h2>
        {loading ? <p>Loading…</p> : null}
        {error ? <p className="error">Could not reach API: {error}</p> : null}
        {!loading && !error ? (
          <ul className="facts">
            <li>
              <strong>Service</strong> {root?.name} <span className="muted">v{root?.version}</span>
            </li>
            <li>
              <strong>Health</strong> {health?.status}
            </li>
          </ul>
        ) : null}
        <p className="hint">
          Start backend: <code>npm run dev:backend</code> · DB: <code>docker compose up -d</code>
        </p>
      </section>
    </main>
  );
}
