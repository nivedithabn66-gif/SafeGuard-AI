import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.api.routes import process_chat_message
from app.models.schemas import AnalyzeRequest

app = FastAPI(
    title="SafeGuard AI API",
    description="Proactive Child Online Safety & Digital Trust Layer Backend",
    version="1.0.0"
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "SafeGuard AI",
        "tagline": "Proactive Child Online Safety & Digital Trust Layer",
        "docs": "/docs"
    }

# WebSocket Endpoint for real-time bidirectional safety monitoring
@app.websocket("/ws/chat/{conversation_id}")
async def websocket_chat_endpoint(websocket: WebSocket, conversation_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload_dict = json.loads(data)
            analyze_req = AnalyzeRequest(
                conversation_id=conversation_id,
                sender=payload_dict.get("sender", "other"),
                message=payload_dict.get("message", "")
            )
            result = process_chat_message(analyze_req)
            await websocket.send_json(result.model_dump())
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
