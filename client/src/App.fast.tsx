import { useState } from "react";

export default function FastApp() {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f9ff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🦷</div>
          <h1 style={{ color: '#0d9488', margin: '0 0 20px 0' }}>DentConnect</h1>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>
            {selected === 'emergency' && '🚨 Emergency Selected'}
            {selected === 'urgent' && '⚡ Urgent Selected'}
            {selected === 'routine' && '✅ Routine Selected'}
            {selected === 'cosmetic' && '✨ Cosmetic Selected'}
          </div>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            This is a demo. Redirecting to early access...
          </p>
          <button
            onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
            style={{
              background: '#0d9488',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Get Early Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #e0f2f1 0%, #e1f5fe 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🦷</div>
        <h1 style={{ color: '#0d9488', fontSize: '2.5rem', margin: '0 0 16px 0', fontWeight: '700' }}>
          DentConnect
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: '0 0 32px 0' }}>
          Find available dental appointments near you
        </p>
        
        <h2 style={{ color: '#374151', fontSize: '1.25rem', marginBottom: '20px' }}>
          What type of treatment do you need?
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setSelected('emergency')}
            style={{
              padding: '20px',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
              🚨 Emergency
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Immediate dental care needed
            </div>
          </button>
          
          <button
            onClick={() => setSelected('urgent')}
            style={{
              padding: '20px',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
              ⚡ Urgent
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Pain relief and urgent care
            </div>
          </button>
          
          <button
            onClick={() => setSelected('routine')}
            style={{
              padding: '20px',
              border: '2px solid #10b981',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
              ✅ Routine
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Regular check-up and cleaning
            </div>
          </button>
          
          <button
            onClick={() => setSelected('cosmetic')}
            style={{
              padding: '20px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '8px' }}>
              ✨ Cosmetic
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Aesthetic dental treatments
            </div>
          </button>
        </div>
        
        <div style={{
          padding: '20px',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
            🚀 Ultra-Fast Loading
          </div>
          <div style={{ color: '#0369a1', fontSize: '0.9rem' }}>
            No heavy dependencies - instant loading on all devices
          </div>
        </div>
      </div>
    </div>
  );
}