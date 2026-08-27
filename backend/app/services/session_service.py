import time
import uuid
from typing import Dict, Optional, List
from app.models.schemas import ConversationState, TurnAnalysis

class EphemeralSessionManager:
    """
    In-memory state manager with automatic TTL (15-minute default) expiration.
    Ensures zero permanent raw-chat persistence.
    """

    def __init__(self, ttl_seconds: int = 900):  # 15 minutes TTL
        self.ttl_seconds = ttl_seconds
        self.sessions: Dict[str, ConversationState] = {}
        self.session_turns: Dict[str, List[TurnAnalysis]] = {}

    def get_or_create_session(self, conversation_id: Optional[str] = None) -> ConversationState:
        self._cleanup_expired()
        
        if not conversation_id or conversation_id not in self.sessions:
            new_id = conversation_id or f"CONV-{uuid.uuid4().hex[:8].upper()}"
            session = ConversationState(
                conversation_id=new_id,
                current_risk=0.0,
                previous_risk=0.0,
                lambda_factor=0.7,
                turn_count=0,
                signals_detected=[],
                escalating=False,
                last_updated=time.time(),
                created_at=time.time()
            )
            self.sessions[new_id] = session
            self.session_turns[new_id] = []
            return session

        session = self.sessions[conversation_id]
        session.last_updated = time.time()
        return session

    def record_turn(self, conversation_id: str, turn: TurnAnalysis, session: ConversationState):
        session.previous_risk = session.current_risk
        session.current_risk = turn.dynamic_risk_score
        session.turn_count += 1
        session.escalating = turn.escalating
        session.last_updated = time.time()

        for sig in turn.signals:
            if sig.name.value not in session.signals_detected:
                session.signals_detected.append(sig.name.value)

        if conversation_id not in self.session_turns:
            self.session_turns[conversation_id] = []
        
        self.session_turns[conversation_id].append(turn)

    def get_turns(self, conversation_id: str) -> List[TurnAnalysis]:
        self._cleanup_expired()
        return self.session_turns.get(conversation_id, [])

    def reset_session(self, conversation_id: str) -> ConversationState:
        if conversation_id in self.sessions:
            del self.sessions[conversation_id]
        if conversation_id in self.session_turns:
            del self.session_turns[conversation_id]
        return self.get_or_create_session(conversation_id)

    def _cleanup_expired(self):
        now = time.time()
        expired_ids = [
            cid for cid, s in self.sessions.items()
            if now - s.last_updated > self.ttl_seconds
        ]
        for cid in expired_ids:
            del self.sessions[cid]
            if cid in self.session_turns:
                del self.session_turns[cid]

session_manager = EphemeralSessionManager()
