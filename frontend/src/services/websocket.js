class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
  }

  connect(token) {
    const wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.connectionHandlers.forEach((handler) =>
        handler({ type: "connected" })
      );
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageHandlers.forEach((handler) => handler(data));
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.connectionHandlers.forEach((handler) =>
        handler({ type: "disconnected" })
      );
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.connectionHandlers.forEach((handler) =>
        handler({ type: "error", error })
      );
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(receiverId, content) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "chat_message",
          receiver_id: receiverId,
          content: content,
        })
      );
    }
  }

  sendTyping(receiverId, isTyping) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "typing",
          receiver_id: receiverId,
          is_typing: isTyping,
        })
      );
    }
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  onConnection(handler) {
    this.connectionHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  removeConnectionHandler(handler) {
    this.connectionHandlers = this.connectionHandlers.filter(
      (h) => h !== handler
    );
  }
}

export default new WebSocketService();
