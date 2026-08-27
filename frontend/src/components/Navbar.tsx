import React from 'react';
import { Shield, LayoutDashboard, MessageSquare, BarChart2, PlayCircle, Lock } from 'lucide-react';

interface NavbarProps {
  activeTab: 'monitor' | 'dashboard' | 'analytics' | 'scenarios' | 'overview';
  setActiveTab: (tab: 'monitor' | 'dashboard' | 'analytics' | 'scenarios' | 'overview') => void;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenPrivacy }) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SafeGuard AI
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Proactive Digital Trust Layer
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: activeTab === 'overview' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <Shield size={16} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: activeTab === 'monitor' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'monitor' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'monitor' ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
            }}
          >
            <MessageSquare size={16} /> Safety Monitor
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <LayoutDashboard size={16} /> Moderator Dashboard
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: activeTab === 'analytics' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <BarChart2 size={16} /> Analytics & ML
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              background: activeTab === 'scenarios' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: activeTab === 'scenarios' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <PlayCircle size={16} /> Demo Runner
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenPrivacy}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Lock size={14} color="#10b981" />
            <span>Zero Raw Chat Stored</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            LIVE ML ACTIVE
          </div>
        </div>

      </div>
    </header>
  );
};
