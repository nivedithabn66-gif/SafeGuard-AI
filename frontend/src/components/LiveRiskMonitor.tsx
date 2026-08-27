import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { AlertTriangle, ShieldCheck, ShieldAlert, TrendingUp, Info, HelpCircle, Activity } from 'lucide-react';
import { type TurnAnalysis } from '../services/api';

interface LiveRiskMonitorProps {
  turns: TurnAnalysis[];
  latestTurn: TurnAnalysis | null;
}

export const LiveRiskMonitor: React.FC<LiveRiskMonitorProps> = ({ turns, latestTurn }) => {
  const currentScore = latestTurn ? latestTurn.dynamic_risk_score : 0.0;
  const currentLevel = latestTurn ? latestTurn.risk_level : 'LOW';
  const isEscalating = latestTurn ? latestTurn.escalating : false;
  const interventionText = latestTurn
    ? latestTurn.intervention
    : 'Conversation appears normal. Continue practicing safe online habits.';

  // Build chart dataset from turn history
  const chartData = turns.map((t) => ({
    turn: `Turn ${t.turn_number}`,
    turnNum: t.turn_number,
    score: t.dynamic_risk_score,
    signalScore: t.combined_signal_score,
    level: t.risk_level,
  }));

  if (chartData.length === 0) {
    chartData.push({ turn: 'Turn 0', turnNum: 0, score: 0, signalScore: 0, level: 'LOW' });
  }

  // Get color token for level
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'MEDIUM':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'rgba(239, 68, 68, 0.15)';
      case 'HIGH':
        return 'rgba(249, 115, 22, 0.15)';
      case 'MEDIUM':
        return 'rgba(245, 158, 11, 0.15)';
      default:
        return 'rgba(16, 185, 129, 0.15)';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Bar: Risk Gauge & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="var(--accent-cyan)" /> Live Dynamic Risk Visualizer
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: getLevelColor(currentLevel) }}>
              {currentScore.toFixed(1)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>/ 100 Risk Index</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{
            padding: '8px 18px',
            borderRadius: '20px',
            background: getLevelBg(currentLevel),
            border: `1px solid ${getLevelColor(currentLevel)}`,
            color: getLevelColor(currentLevel),
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {currentLevel === 'CRITICAL' && <AlertTriangle size={18} />}
            {currentLevel === 'HIGH' && <ShieldAlert size={18} />}
            {currentLevel === 'MEDIUM' && <Info size={18} />}
            {currentLevel === 'LOW' && <ShieldCheck size={18} />}
            <span>{currentLevel} RISK</span>
          </div>

          {isEscalating && (
            <div style={{ fontSize: '0.75rem', color: 'var(--risk-high)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> Escalating Pattern Detected
            </div>
          )}
        </div>
      </div>

      {/* Recharts Progression Line Chart */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {"Dynamic Exponential Risk Progression (R_t) over Turns"}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {"Formula: R_t = 0.7 * R_{t-1} + 0.3 * S_t"}
          </div>
        </div>

        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="turn" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'MED (30)', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={60} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'HIGH (60)', fill: '#f97316', fontSize: 10 }} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRIT (80)', fill: '#ef4444', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="score"
                name="Dynamic Risk (R_t)"
                stroke={getLevelColor(currentLevel)}
                strokeWidth={3}
                dot={{ r: 5, fill: getLevelColor(currentLevel) }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contextual Proportional Safety Intervention Banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '12px',
        background: getLevelBg(currentLevel),
        borderLeft: `4px solid ${getLevelColor(currentLevel)}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <div style={{ marginTop: '2px' }}>
          {currentLevel === 'CRITICAL' ? (
            <ShieldAlert size={22} color="var(--risk-crit)" />
          ) : currentLevel === 'HIGH' ? (
            <AlertTriangle size={22} color="var(--risk-high)" />
          ) : currentLevel === 'MEDIUM' ? (
            <Info size={22} color="var(--risk-med)" />
          ) : (
            <ShieldCheck size={22} color="var(--risk-low)" />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff', marginBottom: '4px' }}>
            Recommended Safety Action ({currentLevel})
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {interventionText}
          </div>
        </div>
      </div>

      {/* Explainable AI Breakdown & Detected Signals */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={14} /> Detected Behavioral Signals & Concrete Reasons
        </div>

        {latestTurn && latestTurn.signals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {latestTurn.signals.map((sig, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                    {sig.name.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {sig.explanation}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>
                  Score: {sig.score.toFixed(2)}
                </div>
              </div>
            ))}

            {latestTurn.reasons.map((reason, idx) => (
              <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '6px' }}>
                • {reason}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            No elevated risk behavioral signals detected in recent turns.
          </div>
        )}
      </div>

    </div>
  );
};
