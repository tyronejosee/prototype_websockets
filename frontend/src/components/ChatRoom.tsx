import { useEffect, useState } from 'react';

interface ChatRoomProps {
  roomName: string;
}

interface Message {
  id: number;
  content: string;
}

const ChatRoom = ({ roomName }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);
    setSocket(ws);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      console.log('WebSocket closed.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    return () => {
      ws.close();
    };
  }, [roomName]);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ message: input }));
      setInput('');
    }
  };

  return (
    <section>
      <h1>Chat Room: {roomName}</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg.content}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write your message..."
      />
      <button onClick={sendMessage}>Send Message</button>
    </section>
  );
};

export default ChatRoom;
