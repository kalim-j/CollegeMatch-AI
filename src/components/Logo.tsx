'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  theme?: 'dark' | 'light';
}

export default function Logo({
  size = 'md',
  showTagline = false,
  theme = 'dark',
}: LogoProps) {
  const sizes = {
    sm: { box: 36, emoji: '20px', name: '14px', tag: '10px' },
    md: { box: 52, emoji: '28px', name: '17px', tag: '11px' },
    lg: { box: 72, emoji: '36px', name: '22px', tag: '12px' },
  };
  const s = sizes[size] || sizes.md;
  const textColor = theme === 'dark'
    ? 'rgba(255,255,255,0.95)'
    : '#1a1340';
  const mutedColor = theme === 'dark'
    ? 'rgba(255,255,255,0.5)'
    : '#7a7399';

  return (
    <div style={{
      display: 'flex',
      flexDirection: size === 'lg' ? 'column' : 'row',
      alignItems: 'center',
      gap: '10px',
    }}>
      <div style={{
        width: s.box,
        height: s.box,
        borderRadius: s.box * 0.27,
        background: 'linear-gradient(135deg, #7F77DD, #1D9E75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.emoji,
        boxShadow: '0 4px 20px rgba(127,119,221,0.3)',
        flexShrink: 0,
      }}>
        🎓
      </div>
      <div style={{
        textAlign: size === 'lg' ? 'center' : 'left',
      }}>
        <p style={{
          fontSize: s.name,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #a89ef8, #5DCAA5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          CollegeMatch-AI
        </p>
        <p style={{
          fontSize: s.tag,
          color: mutedColor,
          letterSpacing: '0.04em',
          marginTop: '2px',
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
        }}>
          India's smartest college advisor
        </p>
        {showTagline && (
          <p style={{
            fontSize: '10px',
            color: mutedColor,
            opacity: 0.7,
            marginTop: '1px',
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
          }}>
            AI-powered · Free · Trusted by students
          </p>
        )}
      </div>
    </div>
  );
}
