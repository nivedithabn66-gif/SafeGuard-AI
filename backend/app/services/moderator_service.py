import time
from typing import List, Dict
from app.models.schemas import ModeratorEvent, RiskLevel, DashboardSummary
from app.privacy.anonymizer import PrivacyGuard

class ModeratorDashboardService:
    """
    Manages anonymized oversight for parents, trusted adults, and platform moderators.
    Strictly zero raw-chat disclosure.
    """

    def __init__(self):
        self.events: List[ModeratorEvent] = []
        self._seed_demo_events()

    def _seed_demo_events(self):
        """
        Seeds initial synthetic demo events for hackathon demonstration.
        """
        now = time.time()
        demo_data = [
            (RiskLevel.CRITICAL, 88.5, ["PII_REQUEST", "SECRECY", "COERCION"], True, "TRUSTED_ADULT_GUIDANCE", now - 300),
            (RiskLevel.HIGH, 72.0, ["SECRECY", "ISOLATION"], True, "PAUSE_RECOMMENDED", now - 1200),
            (RiskLevel.MEDIUM, 45.0, ["PII_REQUEST"], False, "SAFETY_NUDGE", now - 3600),
            (RiskLevel.LOW, 18.0, ["TOXICITY"], False, "MONITORING", now - 7200),
            (RiskLevel.CRITICAL, 92.0, ["COERCION", "SECRECY", "PII_REQUEST"], True, "MESSAGE_BLUR_APPLIED", now - 14400),
            (RiskLevel.HIGH, 64.5, ["ISOLATION", "TARGETED_BEHAVIOR"], True, "PAUSE_RECOMMENDED", now - 28800)
        ]

        for idx, (risk_level, score, signals, escalating, intervention, ts) in enumerate(demo_data):
            evt_id = f"EVT-00{idx+1}"
            anon_id = PrivacyGuard.anonymize_id(f"demo_session_{idx+1}")
            self.events.append(ModeratorEvent(
                event_id=evt_id,
                anonymous_conversation_id=anon_id,
                risk_level=risk_level,
                risk_score=score,
                detected_signals=signals,
                escalating=escalating,
                timestamp=ts,
                status="ACTIVE" if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL] else "REVIEWED",
                intervention_triggered=intervention
            ))

    def record_risk_event(
        self,
        conversation_id: str,
        risk_level: RiskLevel,
        risk_score: float,
        signals: List[str],
        escalating: bool,
        intervention: str
    ):
        """
        Records an anonymized event when risk level is MEDIUM or higher.
        """
        if risk_level == RiskLevel.LOW:
            return

        anon_id = PrivacyGuard.anonymize_id(conversation_id)
        
        # Check if an active event already exists for this conversation and update it
        existing = next((e for e in self.events if e.anonymous_conversation_id == anon_id), None)
        if existing:
            existing.risk_level = risk_level
            existing.risk_score = risk_score
            for sig in signals:
                if sig not in existing.detected_signals:
                    existing.detected_signals.append(sig)
            existing.escalating = escalating
            existing.timestamp = time.time()
            existing.intervention_triggered = intervention
        else:
            new_evt = ModeratorEvent(
                event_id=PrivacyGuard.generate_event_id(),
                anonymous_conversation_id=anon_id,
                risk_level=risk_level,
                risk_score=risk_score,
                detected_signals=signals,
                escalating=escalating,
                timestamp=time.time(),
                status="ACTIVE",
                intervention_triggered=intervention
            )
            self.events.insert(0, new_evt)

    def get_dashboard_summary(self) -> DashboardSummary:
        total = len(self.events) + 42  # Includes baseline low-risk synthetic count
        low_c = sum(1 for e in self.events if e.risk_level == RiskLevel.LOW) + 35
        med_c = sum(1 for e in self.events if e.risk_level == RiskLevel.MEDIUM)
        high_c = sum(1 for e in self.events if e.risk_level == RiskLevel.HIGH)
        crit_c = sum(1 for e in self.events if e.risk_level == RiskLevel.CRITICAL)
        esc_c = sum(1 for e in self.events if e.escalating)

        freqs: Dict[str, int] = {
            "PII_REQUEST": 0,
            "SECRECY": 0,
            "ISOLATION": 0,
            "COERCION": 0,
            "TOXICITY": 0,
            "TARGETED_BEHAVIOR": 0
        }
        for evt in self.events:
            for sig in evt.detected_signals:
                freqs[sig] = freqs.get(sig, 0) + 1

        return DashboardSummary(
            total_monitored_interactions=total,
            low_risk_count=low_c,
            medium_risk_count=med_c,
            high_risk_count=high_c,
            critical_risk_count=crit_c,
            escalating_count=esc_c,
            signal_frequencies=freqs,
            recent_events=self.events[:15]
        )

moderator_service = ModeratorDashboardService()
