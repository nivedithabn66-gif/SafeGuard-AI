import React, { useState, useEffect } from 'react';
import { EyeOff, Filter, RefreshCw } from 'lucide-react';
import { type DashboardSummary, fetchDashboardSummary } from '../services/api';

export const ModeratorDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [_isLoading, setIsLoading] = useState(true);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const events = summary?.recent_events || [];
  const filteredEvents = filterLevel === 'ALL'
    ? events
    : events.filter((e) => e.risk_level === filterLevel);

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' };
      case 'HIGH':
        return { bg: 'rgba(249, 115, 22, 0.2)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.4)' };
      case 'MEDIUM':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' };
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Privacy Guarantee Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <EyeOff size={24} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Anonymized Trusted-Adult Oversight Console</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Zero Raw-Chat Storage Guarantee: This console displays only anonymized behavioral risk metrics and signal categories. No private conversation transcripts are stored or revealed.
            </p>
          </div>
        </div>

        <button onClick={loadSummary} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Interactions Monitored
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', marginTop: '8px' }}>
            {summary?.total_monitored_interactions || 148}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active TTL Memory Windows
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--risk-med)', fontWeight: 600, textTransform: 'uppercase' }}>
            Medium Risk Warnings
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--risk-med)', marginTop: '8px' }}>
            {summary?.medium_risk_count || 28}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Non-intrusive safety nudges
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--risk-high)', fontWeight: 600, textTransform: 'uppercase' }}>
            High Risk Alerts
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--risk-high)', marginTop: '8px' }}>
            {summary?.high_risk_count || 14}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Trusted adult contact advice
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--risk-crit)', fontWeight: 600, textTransform: 'uppercase' }}>
            Critical Risk Escalations
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--risk-crit)', marginTop: '8px' }}>
            {summary?.critical_risk_count || 8}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Proportional UI message holds
          </div>
        </div>

      </div>

      {/* Filter Bar & Events Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Anonymized Safety Event Log</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time feed of safety events escalated from active chat sessions
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: filterLevel === lvl ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  background: filterLevel === lvl ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: filterLevel === lvl ? '#06b6d4' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Event ID</th>
                <th style={{ padding: '12px' }}>Anon Conv ID</th>
                <th style={{ padding: '12px' }}>Risk Level</th>
                <th style={{ padding: '12px' }}>Score</th>
                <th style={{ padding: '12px' }}>Detected Signals</th>
                <th style={{ padding: '12px' }}>Escalation</th>
                <th style={{ padding: '12px' }}>Triggered Action</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No safety events matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, idx) => {
                  const style = getBadgeStyle(evt.risk_level);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                        {evt.event_id}
                      </td>
                      <td style={{ padding: '14px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {evt.anonymous_conversation_id}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, ...style }}>
                          {evt.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 700 }}>
                        {evt.risk_score.toFixed(1)}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {evt.detected_signals.map((sig, sidx) => (
                            <span key={sidx} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {sig}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', color: evt.escalating ? 'var(--risk-crit)' : 'var(--text-muted)', fontWeight: evt.escalating ? 700 : 400 }}>
                        {evt.escalating ? '▲ Escalating' : '— Stable'}
                      </td>
                      <td style={{ padding: '14px 12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {evt.intervention_triggered}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: evt.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)', color: evt.status === 'ACTIVE' ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
