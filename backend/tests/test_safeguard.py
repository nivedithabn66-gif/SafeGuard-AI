import pytest
import time
from app.signal_detection.detectors import SignalDetector
from app.risk_engine.calculator import DynamicRiskEngine
from app.models.schemas import SignalCategory, RiskLevel, AnalyzeRequest
from app.privacy.anonymizer import PrivacyGuard
from app.services.session_service import EphemeralSessionManager
from app.services.moderator_service import ModeratorDashboardService

def test_pii_detection():
    detector = SignalDetector()
    res = detector.analyze_message("What's your phone number so I can call you?", sender="other")
    sig_names = [s.name for s in res]
    assert SignalCategory.PII_REQUEST in sig_names

def test_secrecy_detection():
    detector = SignalDetector()
    res = detector.analyze_message("Don't tell your parents about this, keep it our secret.", sender="other")
    sig_names = [s.name for s in res]
    assert SignalCategory.SECRECY in sig_names

def test_coercion_detection():
    detector = SignalDetector()
    res = detector.analyze_message("If you don't do what I say right now, you'll be sorry!", sender="other")
    sig_names = [s.name for s in res]
    assert SignalCategory.COERCION in sig_names

def test_normal_conversation():
    detector = SignalDetector()
    res = detector.analyze_message("Hey, do you want to play Minecraft later?", sender="other")
    assert len(res) == 0

def test_risk_calculation_and_escalation():
    engine = DynamicRiskEngine(lambda_factor=0.7)
    detector = SignalDetector()
    
    # Turn 1: Normal
    signals1 = detector.analyze_message("Hey there")
    s1, r1, level1, esc1, _, _ = engine.compute_turn_risk(0.0, signals1, 1, [])
    assert r1 < 30.0
    assert level1 == RiskLevel.LOW
    
    # Turn 2: Secrecy
    signals2 = detector.analyze_message("Don't tell your mom or dad about this chat")
    s2, r2, level2, esc2, _, _ = engine.compute_turn_risk(r1, signals2, 2, [])
    assert r2 > r1
    
    # Turn 3: Coercion & PII & Secrecy Escalation
    signals3 = detector.analyze_message("Give me your home address right now or else bad things happen! Keep it our secret.")
    s3, r3, level3, esc3, _, _ = engine.compute_turn_risk(r2, signals3, 3, ["SECRECY"])
    assert r3 >= 60.0
    assert level3 in [RiskLevel.HIGH, RiskLevel.CRITICAL]

def test_privacy_guard():
    masked = PrivacyGuard.mask_pii("Call me at 555-123-4567 or email john@example.com")
    assert "555-123-4567" not in masked
    assert "john@example.com" not in masked
    assert "[PHONE_NUMBER_PROTECTED]" in masked

def test_ttl_session_expiration():
    sm = EphemeralSessionManager(ttl_seconds=1)  # 1 second TTL for test
    sess = sm.get_or_create_session("test_conv_123")
    assert sess.conversation_id == "test_conv_123"
    
    time.sleep(1.2)
    # Session should now expire
    sm._cleanup_expired()
    assert "test_conv_123" not in sm.sessions

def test_moderator_service():
    ms = ModeratorDashboardService()
    ms.record_risk_event(
        conversation_id="conv_test_99",
        risk_level=RiskLevel.HIGH,
        risk_score=75.0,
        signals=["SECRECY", "PII_REQUEST"],
        escalating=True,
        intervention="PAUSE_RECOMMENDED"
    )
    summary = ms.get_dashboard_summary()
    assert summary.high_risk_count >= 1
    assert len(summary.recent_events) > 0
