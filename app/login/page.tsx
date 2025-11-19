const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  throw new Error(
    'NEXT_PUBLIC_BACKEND_URL is missing. Set it to enable authentication.'
  );
}

export default function LoginPage() {
  const loginUrl = `${backendUrl}/auth/login`;

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
        <a className="btn" href={loginUrl}>
          Login with Spotify
        </a>
      </div>
    </div>
  );
}
