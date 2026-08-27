import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ChatSimulator } from './components/ChatSimulator';
import { LiveRiskMonitor } from './components/LiveRiskMonitor';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { ScenarioRunner } from './components/ScenarioRunner';
import { PrivacyModal } from './components/PrivacyModal';
import { resetConversationState, type TurnAnalysis } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitor' | 'dashboard' | 'analytics' | 'scenarios'>('overview');
  const [conversationId, setConversationId] = useState<string>(() => `CONV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [turns, setTurns] = useState<TurnAnalysis[]>([]);
  const [latestTurn, setLatestTurn] = useState<TurnAnalysis | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [presetScenarioId, setPresetScenarioId] = useState<string | undefined>(undefined);

  const handleTurnProcessed = (turn: TurnAnalysis) => {
    setTurns((prev) => [...prev, turn]);
    setLatestTurn(turn);
  };

  const handleResetSession = () => {
    resetConversationState(conversationId);
    setTurns([]);
    setLatestTurn(null);
    setConversationId(`CONV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  };

  const handleSelectPresetScenario = (scenarioId: string) => {
    setPresetScenarioId(scenarioId);
    setActiveTab('scenarios');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'overview' && (
          <LandingHero
            onStartMonitor={() => setActiveTab('monitor')}
            onOpenDemo={() => setActiveTab('scenarios')}
          />
        )}

        {activeTab === 'monitor' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
              <ChatSimulator
                conversationId={conversationId}
                onTurnProcessed={handleTurnProcessed}
                turns={turns}
                currentRiskLevel={latestTurn ? latestTurn.risk_level : 'LOW'}
                onResetSession={handleResetSession}
                onSelectPresetScenario={handleSelectPresetScenario}
              />

              <LiveRiskMonitor
                turns={turns}
                latestTurn={latestTurn}
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <ModeratorDashboard />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'scenarios' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ScenarioRunner
              onTurnProcessed={handleTurnProcessed}
              onResetSession={handleResetSession}
              conversationId={conversationId}
              selectedScenarioId={presetScenarioId}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
              <ChatSimulator
                conversationId={conversationId}
                onTurnProcessed={handleTurnProcessed}
                turns={turns}
                currentRiskLevel={latestTurn ? latestTurn.risk_level : 'LOW'}
                onResetSession={handleResetSession}
                onSelectPresetScenario={handleSelectPresetScenario}
              />

              <LiveRiskMonitor
                turns={turns}
                latestTurn={latestTurn}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        background: 'rgba(11, 15, 25, 0.9)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            SafeGuard AI — Proactive Child Online Safety & Digital Trust Layer • Hackathon MVP
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => setIsPrivacyOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
              Privacy & Ephemeral Memory Guarantees
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Architecture Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

    </div>
  );
}

export default App;
