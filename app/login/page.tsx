const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LoginPage() {
  const loginUrl = backendUrl ? `${backendUrl}/auth/login` : null;

  return (
    <div className="page-shell">
      <div className="card stack">
        <div className="stack" style={{ gap: '0.5rem' }}>
          <p className="muted" style={{ letterSpacing: '0.08em' }}>
            MUSIC ART LAB
          </p>
          <h1 style={{ fontSize: '2rem' }}>Blend your album art</h1>
          <p className="muted">
            Sign in with Spotify to generate a blended artwork from your
            listening. Share it publicly and download a square crop ready for
            Instagram.
          </p>
        </div>
        {loginUrl ? (
          <a className="btn" href={loginUrl}>
            Login with Spotify
          </a>
        ) : (
          <div className="stack">
            <p className="error">
              Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in
              .env.local to enable login.
            </p>
            <p className="muted">
              You can still explore the UI, but API calls will be skipped.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
