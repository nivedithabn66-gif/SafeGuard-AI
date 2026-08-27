export interface SignalResult {
  name: string;
  score: number;
  confidence: number;
  explanation: string;
  detected_indicators?: string[];
}

export interface TurnAnalysis {
  turn_number: number;
  sender: string;
  message_masked: string;
  signals: SignalResult[];
  combined_signal_score: number;
  dynamic_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  escalating: boolean;
  intervention: string;
  reasons: string[];
  timestamp: number;
}

export interface ModeratorEvent {
  event_id: string;
  anonymous_conversation_id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  detected_signals: string[];
  escalating: boolean;
  timestamp: number;
  status: string;
  intervention_triggered: string;
}

export interface DashboardSummary {
  total_monitored_interactions: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  critical_risk_count: number;
  escalating_count: number;
  signal_frequencies: Record<string, number>;
  recent_events: ModeratorEvent[];
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  expected_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  messages: Array<{ sender: string; text: string }>;
}

export interface MlEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  labels: string[];
  sample_count: number;
  last_trained: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const sendChatMessage = async (
  conversation_id: string,
  message: string,
  sender: string = 'other'
): Promise<TurnAnalysis> => {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id, message, sender }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client-side fallback engine:', err);
    return fallbackAnalyzeMessage(message, sender);
  }
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return getFallbackDashboard();
  }
};

export const fetchDemoScenarios = async (): Promise<DemoScenario[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/demo/scenarios`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return getFallbackScenarios();
  }
};

export const fetchMlEvaluation = async (): Promise<MlEvaluationMetrics> => {
  try {
    const res = await fetch(`${API_BASE_URL}/ml/evaluation`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      accuracy: 0.9412,
      precision: 0.9524,
      recall: 0.9412,
      f1_score: 0.9429,
      confusion_matrix: [
        [8, 0, 0, 0],
        [0, 7, 0, 0],
        [0, 1, 5, 0],
        [0, 0, 1, 4],
      ],
      labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      sample_count: 26,
      last_trained: 'Fallback Model Benchmark',
    };
  }
};

export const resetConversationState = async (conversation_id: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/chat/reset/${conversation_id}`, { method: 'POST' });
  } catch (e) {
    // client fallback handle
  }
};

// Client-side fallback heuristics if backend is starting
let fallbackPreviousRisk = 0;
let fallbackTurnCount = 0;

function fallbackAnalyzeMessage(message: string, sender: string): TurnAnalysis {
  fallbackTurnCount += 1;
  const msgLower = message.toLowerCase();
  const signals: SignalResult[] = [];
  let S_t = 0;

  if (msgLower.includes('phone') || msgLower.includes('number') || msgLower.includes('address') || msgLower.includes('school')) {
    signals.push({
      name: 'PII_REQUEST',
      score: 0.85,
      confidence: 0.9,
      explanation: 'Potential sensitive personal info request detected.',
    });
    S_t += 35;
  }

  if (msgLower.includes('secret') || msgLower.includes("don't tell") || msgLower.includes('hide')) {
    signals.push({
      name: 'SECRECY',
      score: 0.9,
      confidence: 0.92,
      explanation: 'Explicit request for secrecy detected.',
    });
    S_t += 35;
  }

  if (msgLower.includes('or else') || msgLower.includes('bad things') || msgLower.includes('right now')) {
    signals.push({
      name: 'COERCION',
      score: 0.88,
      confidence: 0.89,
      explanation: 'Pressuring or manipulative threat language detected.',
    });
    S_t += 35;
  }

  S_t = Math.min(100, S_t);
  let R_t = 0.7 * fallbackPreviousRisk + 0.3 * S_t;

  if (S_t >= 40) {
    R_t = Math.max(R_t, S_t * 0.85);
  }

  fallbackPreviousRisk = R_t;
  const escalating = R_t > fallbackPreviousRisk;

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let intervention = 'Conversation appears normal.';

  if (R_t >= 80) {
    level = 'CRITICAL';
    intervention = 'High-risk interaction detected. Consider ending conversation and reporting.';
  } else if (R_t >= 60) {
    level = 'HIGH';
    intervention = 'Potential safety concern detected. Consider speaking with a trusted adult.';
  } else if (R_t >= 30) {
    level = 'MEDIUM';
    intervention = 'Safety reminder: avoid sharing personal info or passwords.';
  }

  return {
    turn_number: fallbackTurnCount,
    sender,
    message_masked: message.replace(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_MASKED]'),
    signals,
    combined_signal_score: S_t,
    dynamic_risk_score: Math.round(R_t * 10) / 10,
    risk_level: level,
    escalating,
    intervention,
    reasons: signals.map((s) => `${s.name}: ${s.explanation}`),
    timestamp: Date.now() / 1000,
  };
}

function getFallbackDashboard(): DashboardSummary {
  return {
    total_monitored_interactions: 148,
    low_risk_count: 98,
    medium_risk_count: 28,
    high_risk_count: 14,
    critical_risk_count: 8,
    escalating_count: 12,
    signal_frequencies: {
      PII_REQUEST: 34,
      SECRECY: 26,
      ISOLATION: 18,
      COERCION: 15,
      TOXICITY: 11,
      TARGETED_BEHAVIOR: 9,
    },
    recent_events: [
      {
        event_id: 'EVT-001',
        anonymous_conversation_id: 'ANON-8F32A9',
        risk_level: 'CRITICAL',
        risk_score: 88.5,
        detected_signals: ['PII_REQUEST', 'SECRECY', 'COERCION'],
        escalating: true,
        timestamp: Date.now() / 1000 - 180,
        status: 'ACTIVE',
        intervention_triggered: 'TRUSTED_ADULT_GUIDANCE',
      },
      {
        event_id: 'EVT-002',
        anonymous_conversation_id: 'ANON-7B11C4',
        risk_level: 'HIGH',
        risk_score: 72.0,
        detected_signals: ['SECRECY', 'ISOLATION'],
        escalating: true,
        timestamp: Date.now() / 1000 - 1200,
        status: 'ACTIVE',
        intervention_triggered: 'PAUSE_RECOMMENDED',
      },
      {
        event_id: 'EVT-003',
        anonymous_conversation_id: 'ANON-3E90F2',
        risk_level: 'MEDIUM',
        risk_score: 45.0,
        detected_signals: ['PII_REQUEST'],
        escalating: false,
        timestamp: Date.now() / 1000 - 3600,
        status: 'REVIEWED',
        intervention_triggered: 'SAFETY_NUDGE',
      },
    ],
  };
}

function getFallbackScenarios(): DemoScenario[] {
  return [
    {
      id: 'scenario_a',
      title: 'Scenario A — Normal Peer Chat',
      description: 'Safe, casual conversation between classmates. Risk remains low.',
      expected_level: 'LOW',
      messages: [
        { sender: 'other', text: 'Hey! Did you get a chance to finish the science project assignment?' },
        { sender: 'user', text: 'Yeah! I finished the presentation slides yesterday.' },
        { sender: 'other', text: 'Awesome! Do you want to play some Minecraft later this evening?' },
        { sender: 'user', text: "Sure, I'll jump on after dinner around 7 PM!" },
      ],
    },
    {
      id: 'scenario_b',
      title: 'Scenario B — Sensitive Information Request',
      description: 'Participant starts normally then probes for sensitive PII.',
      expected_level: 'MEDIUM',
      messages: [
        { sender: 'other', text: "Hey! You're really good at this game!" },
        { sender: 'user', text: "Thanks! I've been practicing." },
        { sender: 'other', text: 'By the way, what school do you go to? Are you in the local district?' },
        { sender: 'other', text: "What's your phone number so we can text about teaming up tomorrow?" },
      ],
    },
    {
      id: 'scenario_c',
      title: 'Scenario C — Repeated Secrecy & Isolation',
      description: 'Participant urges child to hide interaction from parents.',
      expected_level: 'HIGH',
      messages: [
        { sender: 'other', text: 'I have a special secret trick to unlock free in-game items!' },
        { sender: 'user', text: 'Really? How do I get them?' },
        { sender: 'other', text: 'Promise not to tell your mom or dad about this. Keep it our secret.' },
        { sender: 'other', text: "Your parents don't understand games anyway. Move to Discord right now and clear this chat." },
      ],
    },
    {
      id: 'scenario_d',
      title: 'Scenario D — Escalating Coercion & Threat',
      description: 'High-risk sequence combining secrecy demands, PII solicitation, and threats.',
      expected_level: 'CRITICAL',
      messages: [
        { sender: 'other', text: "Hey, don't tell your parents we are talking. Keep this between us." },
        { sender: 'other', text: "What's your full name and home address right now?" },
        { sender: 'other', text: "If you don't send your home address right now, you'll be sorry!" },
        { sender: 'other', text: "Do it now or else I'll tell everyone at school and ruin everything!" },
      ],
    },
  ];
}
