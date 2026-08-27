import re
from typing import List, Dict, Tuple
from app.models.schemas import SignalResult, SignalCategory

class SignalDetector:
    """
    Modular Signal Extraction Engine.
    Combines NLP heuristics, regex pattern matching, and semantic intent rules.
    """

    def __init__(self):
        # 1. PII Solicitation Patterns
        self.pii_patterns = [
            (r'\b(?:what(?:\'?s| is) your|tell me your|give me your|send me your|where is your)\s+(?:\w+\s+)*(?:phone|number|cell|mobile|whatsapp|snapchat|insta|ig|address|location|school|house|street)\b', 0.85, "Direct request for contact or location details."),
            (r'\b(?:where do you|which city do you|what neighborhood|what grade|what school)\s+(?:live|go|study|attend)\b', 0.80, "Solicitation of personal location or school context."),
            (r'\b(?:send|share)\s+(?:a photo|a picture|your pic|selfie|your face)\b', 0.75, "Request for personal visual content."),
            (r'\b(?:what(?:\'?s| is) your)\s+(?:\w+\s+)*(?:password|pin|social security|ssn|credit card|address|email)\b', 0.95, "Solicitation of critical credentials or identity identifiers."),
            (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', 0.70, "Detected phone number string pattern."),
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 0.70, "Detected email address pattern.")
        ]

        # 2. Secrecy Patterns
        self.secrecy_patterns = [
            (r'\b(?:don\'?t tell|keep (?:this|it) (?:a )?secret|between us|promise not to tell|hide this|delete (?:this|the) (?:chat|message))\b', 0.90, "Explicit instruction to maintain secrecy from others."),
            (r'\b(?:our secret|just for us|nobody else needs to know|shh+|keep it quiet|don\'?t mention this)\b', 0.85, "Encouragement of private or secret relationship bond."),
            (r'\b(?:delete after reading|clear the history|erase this)\b', 0.88, "Instruction to destroy communication trail.")
        ]

        # 3. Isolation Patterns
        self.isolation_patterns = [
            (r'\b(?:your parents (?:don\'?t|won\'?t) understand|they don\'?t care|they don\'?t love you|you can only trust me)\b', 0.90, "Attempt to undermine trust in parents or guardians."),
            (r'\b(?:don\'?t talk to your friends|ignore them|they aren\'?t real friends|only I understand you)\b', 0.85, "Attempt to alienate from peer support network."),
            (r'\b(?:don\'?t ask anyone|don\'?t check with your mom|don\'?t check with your dad)\b', 0.88, "Attempt to block seeking guidance from trusted adults.")
        ]

        # 4. Coercion & Manipulation Patterns
        self.coercion_patterns = [
            (r'\b(?:if you don\'?t|or else|you have to|you must|do it now|right now|don\'?t disappoint me|bad things|you\'?ll be sorry)\b', 0.85, "Pressuring or demanding compliance under threat/urgency."),
            (r'\b(?:if you really liked me|if you were my friend|prove it|you owe me)\b', 0.82, "Emotional coercion or guilt-based manipulation."),
            (r'\b(?:I will tell|I\'?ll share|I will post|or I\'?ll get angry)\b', 0.92, "Coercive leverage or blackmail indicator.")
        ]

        # 5. Toxicity Patterns
        self.toxicity_patterns = [
            (r'\b(?:shut up|stupid|idiot|loser|ugly|freak|hate you|worthless|nobody likes you|kill yourself|die)\b', 0.85, "Hostile, harassing, or abusive language detected."),
            (r'\b(?:disgusting|pathetic|dump|gross|fool)\b', 0.65, "Mild hostility or insulting terminology.")
        ]

        # 6. Off-Platform Transition Patterns
        self.offplatform_patterns = [
            (r'\b(?:move to|chat on|add me on|hit me up on)\s+(?:whatsapp|telegram|discord|snap|snapchat|kik|instagram|signal|private chat)\b', 0.80, "Attempt to transition conversation to unmonitored platform.")
        ]

    def analyze_message(self, text: str, sender: str = "other") -> List[SignalResult]:
        """
        Extracts all signal categories for a single message turn.
        """
        results: List[SignalResult] = []
        text_lower = text.lower()

        # If sender is user (child), we monitor self-disclosure or compliance pressure,
        # but risk signals primarily focus on incoming threats from "other".
        
        # 1. PII Solicitation / Sharing
        pii_score, pii_matches, pii_exp = self._evaluate_patterns(text_lower, self.pii_patterns)
        if pii_score > 0.3:
            results.append(SignalResult(
                name=SignalCategory.PII_REQUEST,
                score=round(pii_score, 2),
                confidence=0.88,
                explanation=pii_exp or "Potential sensitive personal information request detected.",
                detected_indicators=pii_matches
            ))

        # 2. Secrecy
        sec_score, sec_matches, sec_exp = self._evaluate_patterns(text_lower, self.secrecy_patterns)
        if sec_score > 0.3:
            results.append(SignalResult(
                name=SignalCategory.SECRECY,
                score=round(sec_score, 2),
                confidence=0.90,
                explanation=sec_exp or "Repeated or explicit secrecy requests detected.",
                detected_indicators=sec_matches
            ))

        # 3. Isolation
        iso_score, iso_matches, iso_exp = self._evaluate_patterns(text_lower, self.isolation_patterns)

        # Include off-platform moves into isolation/secrecy context
        off_score, off_matches, off_exp = self._evaluate_patterns(text_lower, self.offplatform_patterns)
        if off_score > 0.3:
            iso_score = max(iso_score, off_score)
            iso_matches.extend(off_matches)
            iso_exp = off_exp

        if iso_score > 0.3:
            results.append(SignalResult(
                name=SignalCategory.ISOLATION,
                score=round(iso_score, 2),
                confidence=0.86,
                explanation=iso_exp or "Attempt to isolate child or move to unmonitored channel.",
                detected_indicators=iso_matches
            ))

        # 4. Coercion
        coe_score, coe_matches, coe_exp = self._evaluate_patterns(text_lower, self.coercion_patterns)
        if coe_score > 0.3:
            results.append(SignalResult(
                name=SignalCategory.COERCION,
                score=round(coe_score, 2),
                confidence=0.87,
                explanation=coe_exp or "Coercive, pressuring, or manipulative language detected.",
                detected_indicators=coe_matches
            ))

        # 5. Toxicity
        tox_score, tox_matches, tox_exp = self._evaluate_patterns(text_lower, self.toxicity_patterns)
        if tox_score > 0.3:
            results.append(SignalResult(
                name=SignalCategory.TOXICITY,
                score=round(tox_score, 2),
                confidence=0.85,
                explanation=tox_exp or "Hostile or abusive content detected.",
                detected_indicators=tox_matches
            ))

        return results

    def _evaluate_patterns(self, text: str, patterns: List[Tuple[str, float, str]]) -> Tuple[float, List[str], str]:
        max_score = 0.0
        matches = []
        best_exp = ""

        for pattern, weight, exp in patterns:
            found = re.findall(pattern, text, flags=re.IGNORECASE)
            if found:
                matches.append(found[0] if isinstance(found[0], str) else found[0][0])
                if weight > max_score:
                    max_score = weight
                    best_exp = exp

        return max_score, matches, best_exp
