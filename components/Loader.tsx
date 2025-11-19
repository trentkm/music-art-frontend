type LoaderProps = {
  label?: string;
};

export default function Loader({ label }: LoaderProps) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: '0.75rem' }}>
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '6px solid rgba(245,245,247,0.2)',
          borderTopColor: '#1db954',
          animation: 'spin 1s linear infinite'
        }}
      />
      {label ? (
        <p style={{ color: 'rgba(245,245,247,0.75)', fontSize: '0.95rem' }}>
          {label}
        </p>
      ) : null}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
