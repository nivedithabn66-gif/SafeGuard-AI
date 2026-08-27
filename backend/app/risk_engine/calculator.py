from typing import List, Dict, Tuple
from app.models.schemas import SignalResult, RiskLevel, SignalCategory

class DynamicRiskEngine:
    """
    Calculates dynamic risk progression over conversation turns using exponential weighting:
    R_t = lambda * R_{t-1} + (1 - lambda) * S_t
    """

    def __init__(self, lambda_factor: float = 0.7):
        self.lambda_factor = lambda_factor
        
        # Signal weights contributing to current combined turn signal score S_t (sums to 100 max potential base)
        self.weights = {
            SignalCategory.PII_REQUEST: 25.0,
            SignalCategory.SECRECY: 25.0,
            SignalCategory.ISOLATION: 20.0,
            SignalCategory.COERCION: 20.0,
            SignalCategory.TOXICITY: 10.0,
            SignalCategory.TARGETED_BEHAVIOR: 15.0,
        }

    def compute_turn_risk(
        self,
        previous_risk: float,
        signals: List[SignalResult],
        turn_number: int,
        history_signal_names: List[str]
    ) -> Tuple[float, float, RiskLevel, bool, str, List[str]]:
        """
        Computes current turn combined signal score S_t and updated dynamic risk R_t.
        Returns: (S_t, R_t, risk_level, is_escalating, intervention_text, reasons)
        """
        raw_signal_sum = 0.0
        reasons = []

        # 1. Compute weighted S_t
        for sig in signals:
            weight = self.weights.get(sig.name, 15.0)
            contribution = sig.score * weight
            raw_signal_sum += contribution
            reasons.append(f"{sig.name.value.replace('_', ' ').title()}: {sig.explanation}")

        # Multi-signal synergy bonus (combining e.g. secrecy + PII request is extra dangerous)
        distinct_categories = {sig.name for sig in signals}
        if len(distinct_categories) >= 2:
            synergy_bonus = 15.0 * (len(distinct_categories) - 1)
            raw_signal_sum += synergy_bonus
            reasons.append("Multi-pattern synergy: Multiple distinct risk behaviors detected simultaneously.")

        # Multi-turn escalation bonus: check if signals occurred in recent previous turns
        recent_repeated_signals = set(history_signal_names[-4:]) & distinct_categories
        if recent_repeated_signals:
            escalation_bonus = 12.0 * len(recent_repeated_signals)
            raw_signal_sum += escalation_bonus
            reasons.append("Multi-turn pattern escalation: Suspicious behavioral patterns repeated across turns.")

        # Cap S_t between 0 and 100
        S_t = min(100.0, max(0.0, raw_signal_sum))

        # 2. Compute Exponential Dynamic Risk R_t = lambda * R_{t-1} + (1 - lambda) * S_t
        R_t = (self.lambda_factor * previous_risk) + ((1.0 - self.lambda_factor) * S_t)
        
        # If strong S_t present, reflect immediate risk elevation
        if S_t >= 40.0:
            elevated = S_t * 0.85
            if elevated > R_t:
                R_t = elevated

        R_t = round(min(100.0, max(0.0, R_t)), 1)
        is_escalating = R_t > previous_risk and (R_t - previous_risk) >= 5.0

        # 3. Classify Risk Level
        if R_t >= 80.0:
            risk_level = RiskLevel.CRITICAL
            intervention = "High-risk interaction detected. Consider ending the conversation and reporting the interaction. If you feel unsafe, contact a trusted adult."
        elif R_t >= 60.0:
            risk_level = RiskLevel.HIGH
            intervention = "Potential safety concern detected. Consider pausing this interaction and speaking with a trusted adult."
        elif R_t >= 30.0:
            risk_level = RiskLevel.MEDIUM
            intervention = "Safety reminder: avoid sharing personal information, passwords, or meeting strangers offline."
        else:
            risk_level = RiskLevel.LOW
            intervention = "Conversation appears normal. Continue practicing safe online habits."

        if not reasons:
            reasons.append("No adverse behavioral safety patterns detected in this turn.")

        return S_t, R_t, risk_level, is_escalating, intervention, reasons
