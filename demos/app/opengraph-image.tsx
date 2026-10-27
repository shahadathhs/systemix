import { ImageResponse } from 'next/og';

export const alt =
  'Systemix — security packages for Node.js that depend on nothing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#101014',
        border: '2px solid #26262b',
      }}
    >
      {/* Logo mark: frame + package */}
      <div
        style={{
          width: 96,
          height: 96,
          display: 'flex',
          position: 'relative',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 64,
            height: 64,
            border: '6px solid #f2f1ee',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 56,
            height: 56,
            background: '#3ecf8e',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: '#f2f1ee',
        }}
      >
        Systemix
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 30,
          color: '#a1a1aa',
          marginTop: 20,
        }}
      >
        Security packages for Node.js that depend on nothing.
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          marginTop: 44,
        }}
      >
        {['env', 'password', 'hash', 'cipher', 'id', 'rate-limit'].map(
          (name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                padding: '8px 16px',
                border: '1px solid #3f3f46',
                borderRadius: 0,
                color: '#e4e4e7',
                fontSize: 18,
              }}
            >
              @systemix/{name}
            </div>
          ),
        )}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 44,
          fontSize: 20,
          color: '#71717a',
          letterSpacing: '0.15em',
        }}
      >
        ZERO-DEPENDENCY LIBRARIES · NODE 24+ · MIT
      </div>
    </div>,
    size,
  );
}
