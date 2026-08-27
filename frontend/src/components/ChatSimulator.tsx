import React, { useState } from 'react';
import { Send, Bot, RefreshCw, ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';
import { type TurnAnalysis, sendChatMessage } from '../services/api';

interface ChatSimulatorProps {
  conversationId: string;
  onTurnProcessed: (turn: TurnAnalysis) => void;
  turns: TurnAnalysis[];
  currentRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  onResetSession: () => void;
  onSelectPresetScenario: (scenarioId: string) => void;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({
  conversationId,
  onTurnProcessed,
  turns,
  currentRiskLevel: _currentRiskLevel,
  onResetSession,
  onSelectPresetScenario,
}) => {
  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'other' | 'user'>('other');
  const [isSending, setIsSending] = useState(false);
  const [unblurMessages, setUnblurMessages] = useState<Record<number, boolean>>({});

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const turn = await sendChatMessage(conversationId, messageToSend, senderRole);
      onTurnProcessed(turn);
    } catch (err) {
      console.error('Error processing turn:', err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleUnblur = (idx: number) => {
    setUnblurMessages((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '650px', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#fff'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Simulated Child Chat Room</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Session ID: <code style={{ color: 'var(--accent-cyan)' }}>{conversationId}</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onResetSession}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Reset conversation state"
          >
            <RefreshCw size={14} /> Reset Session
          </button>
        </div>
      </div>

      {/* Quick Demo Scenario Bar */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        fontSize: '0.78rem'
      }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Demo Presets:</span>
        <button onClick={() => onSelectPresetScenario('scenario_a')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
          A: Normal
        </button>
        <button onClick={() => onSelectPresetScenario('scenario_b')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--risk-med-border)' }}>
          B: PII Request
        </button>
        <button onClick={() => onSelectPresetScenario('scenario_c')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--risk-high-border)' }}>
          C: Secrecy
        </button>
        <button onClick={() => onSelectPresetScenario('scenario_d')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--risk-crit-border)' }}>
          D: Coercion
        </button>
      </div>

      {/* Message Feed */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'rgba(0, 0, 0, 0.15)'
      }}>
        {turns.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '300px' }}>
            <Lock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.88rem' }}>No messages sent yet in this session.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Type a message below or select a demo scenario preset above.</p>
          </div>
        ) : (
          turns.map((turn, idx) => {
            const isUser = turn.sender === 'user';
            const isCriticalMsg = turn.risk_level === 'CRITICAL' && !isUser;
            const isBlurred = isCriticalMsg && !unblurMessages[idx];

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isUser ? 'Child (User)' : 'Participant (Other)'} • Turn #{turn.turn_number}
                  {turn.signals.length > 0 && (
                    <span style={{
                      background: turn.risk_level === 'CRITICAL' ? 'var(--risk-crit-bg)' : turn.risk_level === 'HIGH' ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
                      color: turn.risk_level === 'CRITICAL' ? 'var(--risk-crit)' : turn.risk_level === 'HIGH' ? 'var(--risk-high)' : 'var(--risk-med)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700
                    }}>
                      {turn.signals.map(s => s.name).join(', ')}
                    </span>
                  )}
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: isUser ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'rgba(30, 41, 59, 0.9)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  color: '#ffffff',
                  position: 'relative',
                  filter: isBlurred ? 'blur(6px)' : 'none',
                  transition: 'filter 0.3s ease',
                  lineHeight: 1.4,
                  fontSize: '0.92rem'
                }}>
                  {turn.message_masked}
                </div>

                {/* Critical Blur Safety Hold Controls */}
                {isCriticalMsg && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--risk-crit)' }}>
                    <ShieldAlert size={14} />
                    <span>Suspicious content held by SafeGuard UI</span>
                    <button
                      onClick={() => toggleUnblur(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                    >
                      {isBlurred ? <Eye size={12} /> : <EyeOff size={12} />}
                      {isBlurred ? 'Reveal' : 'Hide'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSendMessage} style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Simulate Sender:</span>
            <button
              type="button"
              onClick={() => setSenderRole('other')}
              style={{
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: senderRole === 'other' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: senderRole === 'other' ? '#06b6d4' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Participant ("Other")
            </button>
            <button
              type="button"
              onClick={() => setSenderRole('user')}
              style={{
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: senderRole === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: senderRole === 'user' ? '#3b82f6' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Child ("User")
            </button>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--risk-low)' }}>
            <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
            PII Guardrails Enabled
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="glass-input"
            style={{ flex: 1 }}
            placeholder={senderRole === 'other' ? "Type simulated participant message..." : "Type child response..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
          />
          <button type="submit" className="btn-primary" disabled={isSending || !inputText.trim()}>
            <span>Send</span>
            <Send size={16} />
          </button>
        </div>
      </form>

    </div>
  );
};
