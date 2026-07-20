export default function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#05071a',
      gap: 16,
    }}>
      {/* Animated logo */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg,#7F77DD,#1D9E75)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 28,
        animation: 'loaderPulse 1.5s ease-in-out infinite',
        boxShadow: '0 0 30px rgba(127,119,221,0.4)',
      }}>
        🎓
      </div>
      {/* Spinner */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid rgba(127,119,221,0.2)',
        borderTop: '3px solid #7F77DD',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <p style={{
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.04em',
      }}>
        CollegeMatch-AI
      </p>
      <style>{`
        @keyframes spin {
          from{transform:rotate(0)} to{transform:rotate(360deg)}
        }
        @keyframes loaderPulse {
          0%,100%{transform:scale(1);opacity:1}
          50%{transform:scale(1.08);opacity:0.8}
        }
      `}</style>
    </div>
  );
}
