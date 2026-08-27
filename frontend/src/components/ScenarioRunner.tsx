import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Sparkles } from 'lucide-react';
import { fetchDemoScenarios, sendChatMessage, type DemoScenario, type TurnAnalysis } from '../services/api';

interface ScenarioRunnerProps {
  onTurnProcessed: (turn: TurnAnalysis) => void;
  onResetSession: () => void;
  conversationId: string;
  selectedScenarioId?: string;
}

export const ScenarioRunner: React.FC<ScenarioRunnerProps> = ({
  onTurnProcessed,
  onResetSession,
  conversationId,
  selectedScenarioId,
}) => {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed] = useState<number>(1800); // 1.8s delay between turns

  useEffect(() => {
    fetchDemoScenarios().then((data) => {
      setScenarios(data);
      if (data.length > 0) {
        const initial = selectedScenarioId
          ? data.find((s) => s.id === selectedScenarioId) || data[0]
          : data[0];
        setActiveScenario(initial);
      }
    }).catch(console.error);
  }, [selectedScenarioId]);

  const selectScenario = (sc: DemoScenario) => {
    setIsPlaying(false);
    setActiveScenario(sc);
    setCurrentStep(0);
    onResetSession();
  };

  const stepForward = async () => {
    if (!activeScenario || currentStep >= activeScenario.messages.length) {
      setIsPlaying(false);
      return;
    }

    const msgObj = activeScenario.messages[currentStep];
    try {
      const turn = await sendChatMessage(conversationId, msgObj.text, msgObj.sender);
      onTurnProcessed(turn);
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-play timer loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && activeScenario) {
      if (currentStep < activeScenario.messages.length) {
        timer = setTimeout(() => {
          stepForward();
        }, speed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, activeScenario]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 600 }}>
            <Sparkles size={16} /> Safe Synthetic Demo Scenarios Player
          </div>
          <h3 style={{ fontSize: '1.25rem', marginTop: '2px' }}>Interactive Hackathon Presentation Runner</h3>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              onResetSession();
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            onClick={stepForward}
            className="btn-secondary"
            disabled={!activeScenario || currentStep >= activeScenario.messages.length}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <FastForward size={14} /> Step Turn
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary"
            disabled={!activeScenario || currentStep >= activeScenario.messages.length}
            style={{ fontSize: '0.85rem', padding: '8px 18px' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Demo'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {scenarios.map((sc) => {
          const isSelected = activeScenario?.id === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => selectScenario(sc)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                {sc.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                {sc.description}
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {sc.messages.length} turns
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: sc.expected_level === 'CRITICAL' ? 'var(--risk-crit-bg)' : sc.expected_level === 'HIGH' ? 'var(--risk-high-bg)' : sc.expected_level === 'MEDIUM' ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)',
                  color: sc.expected_level === 'CRITICAL' ? 'var(--risk-crit)' : sc.expected_level === 'HIGH' ? 'var(--risk-high)' : sc.expected_level === 'MEDIUM' ? 'var(--risk-med)' : 'var(--risk-low)'
                }}>
                  Expected: {sc.expected_level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Turn Progress Tracker */}
      {activeScenario && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            <span>Playback Progress: {currentStep} of {activeScenario.messages.length} turns executed</span>
            <span>{Math.round((currentStep / activeScenario.messages.length) * 100)}% Complete</span>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(currentStep / activeScenario.messages.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

    </div>
  );
};
