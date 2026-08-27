import React from 'react';
import { Shield, Eye, Lock, Zap, ArrowRight, Activity, Cpu, AlertTriangle } from 'lucide-react';

interface LandingHeroProps {
  onStartMonitor: () => void;
  onOpenDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartMonitor, onOpenDemo }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      {/* Hero Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Zap size={14} /> Next-Generation Child Safety Architecture
        </div>
      </div>

      {/* Hero Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Proactive Child Online Safety & <br />
          <span style={{
            background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Digital Trust Layer
          </span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '780px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Detect escalating behavioral risk patterns in online conversations before harm occurs.
          Unlike context-blind keyword filters, SafeGuard AI evaluates <strong style={{ color: '#ffffff' }}>multi-turn context + behavioral signals + risk progression</strong> while guaranteeing privacy.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '2rem' }}>
          <button onClick={onStartMonitor} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Launch Safety Monitor</span>
            <ArrowRight size={18} />
          </button>
          
          <button onClick={onOpenDemo} className="btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem' }}>
            <Activity size={18} color="var(--accent-cyan)" />
            <span>Run Hackathon Scenarios</span>
          </button>
        </div>
      </div>

      {/* Core Innovation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '3.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Activity size={24} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Multi-Turn Context & Dynamic Risk Score</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Uses an exponentially weighted risk model <span style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{"R_t = λ * R_{t-1} + (1-λ) * S_t"}</span> to track escalating patterns over time rather than judging isolated messages.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Eye size={24} color="var(--risk-med)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Explainable Safety Signals</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Detects explicit behavioral categories: Secrecy demands, PII solicitation, Isolation attempts, and Coercion pressure with human-readable reasoning.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Lock size={24} color="var(--risk-low)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Privacy by Design & Ephemeral Memory</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Zero permanent raw-chat transcripts stored. State expires automatically via a 15-minute TTL window, and moderator alerts are 100% anonymized.
          </p>
        </div>

      </div>

      {/* Keyword vs SafeGuard Comparison Card */}
      <div className="glass-panel" style={{ marginTop: '3rem', padding: '32px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={22} color="var(--accent-cyan)" /> Why Traditional Keyword Blocker Moderation Fails
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--risk-crit)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Traditional Moderation (Reactive & Blind)
            </div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '18px' }}>
              <li>Message 1: "Hi there!" → Passed</li>
              <li>Message 2: "Where do you go to school?" → Passed (No bad word)</li>
              <li>Message 3: "Don't tell your mom." → Passed (No bad word)</li>
              <li>Result: <strong>Fails to detect escalating danger</strong></li>
            </ul>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--risk-low)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} /> SafeGuard AI (Context-Aware Pattern Engine)
            </div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '18px' }}>
              <li>Turn 1: Casual baseline → Risk 12.0 (LOW)</li>
              <li>Turn 2: PII Solicitation → Risk 45.0 (MEDIUM Nudge)</li>
              <li>Turn 3: Secrecy + Coercion → Risk 88.5 (CRITICAL Intervention & Alert)</li>
              <li>Result: <strong>Proactive intervention before harm occurs</strong></li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
