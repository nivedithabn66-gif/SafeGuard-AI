from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
import time

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class SignalCategory(str, Enum):
    TOXICITY = "TOXICITY"
    SECRECY = "SECRECY"
    ISOLATION = "ISOLATION"
    PII_REQUEST = "PII_REQUEST"
    COERCION = "COERCION"
    ESCALATION = "ESCALATION"
    REPETITION = "REPETITION"
    TARGETED_BEHAVIOR = "TARGETED_BEHAVIOR"

class SignalResult(BaseModel):
    name: SignalCategory
    score: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    explanation: str
    detected_indicators: List[str] = []

class AnalyzeRequest(BaseModel):
    conversation_id: Optional[str] = None
    sender: str = "other"  # "user" (child) or "other" (participant)
    message: str
    timestamp: float = Field(default_factory=time.time)

class TurnAnalysis(BaseModel):
    turn_number: int
    sender: str
    message_masked: str  # PII-masked message
    signals: List[SignalResult]
    combined_signal_score: float  # S_t (0 to 100)
    dynamic_risk_score: float  # R_t (0 to 100)
    risk_level: RiskLevel
    escalating: bool
    intervention: str
    reasons: List[str]
    timestamp: float

class ConversationState(BaseModel):
    conversation_id: str
    current_risk: float = 0.0
    previous_risk: float = 0.0
    lambda_factor: float = 0.7
    turn_count: int = 0
    signals_detected: List[str] = []
    escalating: bool = False
    last_updated: float = Field(default_factory=time.time)
    created_at: float = Field(default_factory=time.time)

class ModeratorEvent(BaseModel):
    event_id: str
    anonymous_conversation_id: str
    risk_level: RiskLevel
    risk_score: float
    detected_signals: List[str]
    escalating: bool
    timestamp: float
    status: str = "ACTIVE"
    intervention_triggered: str

class DashboardSummary(BaseModel):
    total_monitored_interactions: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    critical_risk_count: int
    escalating_count: int
    signal_frequencies: Dict[str, int]
    recent_events: List[ModeratorEvent]

class DemoScenario(BaseModel):
    id: str
    title: str
    description: str
    expected_level: RiskLevel
    messages: List[Dict[str, str]]

class ModelEvaluationMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    labels: List[str]
    sample_count: int
    last_trained: str
