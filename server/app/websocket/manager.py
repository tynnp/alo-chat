from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            tasks = []
            for connection in self.active_connections[user_id]:
                try:
                    tasks.append(connection.send_json(message))
                except:
                    pass
            
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
    
    async def broadcast_to_users(self, message: dict, user_ids: List[str]):
        tasks = []
        for user_id in user_ids:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    tasks.append(connection.send_json(message))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

manager = ConnectionManager()