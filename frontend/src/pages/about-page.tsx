import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <main className="page">
      <header className="header">
        <h1>About</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <section className="panel">
        <p>
          Stack: React + Vite SPA, NestJS REST API, MariaDB/MySQL via TypeORM. See repository README
          for setup.
        </p>
      </section>
    </main>
  );
}
