import { useState } from "react";

const treatments = [
  { id: 'emergency', name: 'Emergency', emoji: '🚨', color: '#dc2626', desc: 'Immediate dental care needed' },
  { id: 'urgent', name: 'Urgent', emoji: '⚡', color: '#f59e0b', desc: 'Pain relief and urgent care' },
  { id: 'routine', name: 'Routine', emoji: '✅', color: '#10b981', desc: 'Regular check-up and cleaning' },
  { id: 'cosmetic', name: 'Cosmetic', emoji: '✨', color: '#8b5cf6', desc: 'Aesthetic dental treatments' }
];

export default function MinimalApp() {
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);

  const handleTreatmentSelect = (treatmentId: string) => {
    setSelectedTreatment(treatmentId);
    setTimeout(() => {
      window.open('https://dentconnect.replit.app/', '_blank');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #e0f2f1 0%, #e1f5fe 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
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
        <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0 0 32px 0' }}>
          Find available dental appointments near you
        </p>

        {selectedTreatment ? (
          <div style={{
            padding: '20px',
            background: '#f0f9ff',
            borderRadius: '12px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>
              {treatments.find(t => t.id === selectedTreatment)?.emoji} Loading...
            </div>
            <div style={{ color: '#0369a1' }}>
              Redirecting to early access signup...
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ color: '#374151', fontSize: '1.25rem', marginBottom: '20px' }}>
              What type of treatment do you need?
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              margin: '24px 0'
            }}>
              {treatments.map(treatment => (
                <button
                  key={treatment.id}
                  onClick={() => handleTreatmentSelect(treatment.id)}
                  style={{
                    padding: '20px',
                    border: `2px solid ${treatment.color}`,
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontWeight: '600',
                    color: treatment.color,
                    marginBottom: '8px'
                  }}>
                    {treatment.emoji} {treatment.name}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    {treatment.desc}
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              margin: '32px 0',
              padding: '20px',
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '12px'
            }}>
              <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
                🚀 Fast Loading Demo
              </div>
              <div style={{ color: '#0369a1', fontSize: '0.9rem' }}>
                Optimized for quick loading on all devices
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}