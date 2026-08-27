import React from 'react';
import { X, Lock, Clock, EyeOff, AlertTriangle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '32px', position: 'relative', border: '1px solid var(--accent-cyan)' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Lock size={24} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>SafeGuard AI Privacy by Design Architecture</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Core Technical Guarantees for Child Online Safety
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-cyan)" /> 1. Ephemeral In-Memory State & TTL Auto-Expiration
            </div>
            Short-term conversation memory lives exclusively in volatile RAM and expires automatically after a configurable 15-minute TTL window.
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#10b981" /> 2. Zero Raw-Chat Persistence
            </div>
            Full chat transcripts are never saved to databases, disk, or logs. Only non-reversible behavioral risk indicators (R_t) and signal categories are processed.
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOff size={16} color="var(--risk-med)" /> 3. Anonymized Trusted-Adult Dashboard
            </div>
            Moderator feeds display anonymous event IDs (e.g. <code>ANON-8F32A9</code>) and risk metadata. Parents/moderators cannot inspect raw private user text.
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontWeight: 700, color: 'var(--risk-med)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> 4. Prototype Disclaimer & Ethical Guidelines
            </div>
            SafeGuard AI is a hackathon MVP decision-support tool, not a replacement for human moderation, emergency services, or parental guidance. Risk scores are indicators, not legal judgments.
          </div>

        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-primary">
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
