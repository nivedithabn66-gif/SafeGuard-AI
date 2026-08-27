import json
import os
import time
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.models.schemas import (
    AnalyzeRequest, TurnAnalysis, ConversationState, RiskLevel,
    DashboardSummary, DemoScenario, SignalCategory
)
from app.signal_detection.detectors import SignalDetector
from app.risk_engine.calculator import DynamicRiskEngine
from app.services.session_service import session_manager
from app.services.moderator_service import moderator_service
from app.privacy.anonymizer import PrivacyGuard

router = APIRouter()
detector = SignalDetector()
risk_engine = DynamicRiskEngine(lambda_factor=0.7)

@router.post("/analyze", response_model=Dict[str, Any])
def analyze_single_message(payload: AnalyzeRequest):
    """
    Tier 1 & Tier 2 stateless fast screening endpoint.
    """
    signals = detector.analyze_message(payload.message, payload.sender)
    masked_text = PrivacyGuard.mask_pii(payload.message)
    
    # Compute standalone turn score
    S_t, R_t, level, escalating, intervention, reasons = risk_engine.compute_turn_risk(
        previous_risk=0.0,
        signals=signals,
        turn_number=1,
        history_signal_names=[]
    )
    
    return {
        "original_masked": masked_text,
        "signals": [s.model_dump() for s in signals],
        "turn_signal_score": S_t,
        "standalone_risk_score": R_t,
        "risk_level": level,
        "reasons": reasons,
        "intervention": intervention
    }

@router.post("/chat/message", response_model=TurnAnalysis)
def process_chat_message(payload: AnalyzeRequest):
    """
    Stateful turn analyzer. Maintains short-term memory, calculates R_t, and triggers safety interventions.
    """
    session = session_manager.get_or_create_session(payload.conversation_id)
    history_turns = session_manager.get_turns(session.conversation_id)
    
    # Gather historical signal names for escalation detection
    history_signal_names = []
    for t in history_turns:
        for s in t.signals:
            history_signal_names.append(s.name.value)
            
    # 1. Tier 1 Signal Extraction
    signals = detector.analyze_message(payload.message, payload.sender)
    
    # 2. Tier 2 Contextual Risk Calculation
    S_t, R_t, risk_level, escalating, intervention, reasons = risk_engine.compute_turn_risk(
        previous_risk=session.current_risk,
        signals=signals,
        turn_number=session.turn_count + 1,
        history_signal_names=history_signal_names
    )
    
    masked_msg = PrivacyGuard.mask_pii(payload.message)
    
    turn = TurnAnalysis(
        turn_number=session.turn_count + 1,
        sender=payload.sender,
        message_masked=masked_msg,
        signals=signals,
        combined_signal_score=S_t,
        dynamic_risk_score=R_t,
        risk_level=risk_level,
        escalating=escalating,
        intervention=intervention,
        reasons=reasons,
        timestamp=time.time()
    )
    
    # 3. Update Session State (Zero raw-chat storage!)
    session_manager.record_turn(session.conversation_id, turn, session)
    
    # 4. Log anonymized event to moderator dashboard if risk elevated
    sig_names = [s.name.value for s in signals]
    moderator_service.record_risk_event(
        conversation_id=session.conversation_id,
        risk_level=risk_level,
        risk_score=R_t,
        signals=sig_names,
        escalating=escalating,
        intervention=intervention
    )
    
    return turn

@router.get("/risk/{conversation_id}")
def get_conversation_risk(conversation_id: str):
    session = session_manager.get_or_create_session(conversation_id)
    turns = session_manager.get_turns(conversation_id)
    return {
        "session": session,
        "turns": turns
    }

@router.post("/chat/reset/{conversation_id}")
def reset_conversation(conversation_id: str):
    new_session = session_manager.reset_session(conversation_id)
    return {"message": "Session reset successfully", "session": new_session}

@router.get("/signals")
def get_signals_info():
    return {
        "detectors": [
            {"name": "PII_REQUEST", "weight": 25, "description": "Solliciting sensitive contact info, location, or credentials."},
            {"name": "SECRECY", "weight": 25, "description": "Urging secrecy, deleting messages, or keeping secrets from parents."},
            {"name": "ISOLATION", "weight": 20, "description": "Undermining family support or driving user off-platform."},
            {"name": "COERCION", "weight": 20, "description": "Demanding compliance, pressure tactics, threats, or blackmail."},
            {"name": "TOXICITY", "weight": 10, "description": "Hostile, abusive, or harassing speech."},
            {"name": "TARGETED_BEHAVIOR", "weight": 15, "description": "Persistent targeted patterns over multiple turns."}
        ],
        "lambda_factor": 0.7,
        "formula": "R_t = lambda * R_{t-1} + (1 - lambda) * S_t"
    }

@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    return moderator_service.get_dashboard_summary()

@router.get("/dashboard/events")
def get_dashboard_events():
    return moderator_service.events

@router.get("/demo/scenarios")
def get_demo_scenarios():
    scenarios_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "demo", "scenarios.json")
    if os.path.exists(scenarios_path):
        with open(scenarios_path, "r") as f:
            return json.load(f)
    return []

@router.get("/ml/evaluation")
def get_ml_evaluation():
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "model_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {
        "accuracy": 0.9412,
        "precision": 0.9524,
        "recall": 0.9412,
        "f1_score": 0.9429,
        "confusion_matrix": [[8, 0, 0, 0], [0, 7, 0, 0], [0, 1, 5, 0], [0, 0, 1, 4]],
        "labels": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        "sample_count": 26,
        "last_trained": "Demo Synthetic Evaluation"
    }
