import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { chatAPI } from "../services/api";
import websocketService from "../services/websocket";

export default function ChatWindow({ currentUser, selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    const handleMessage = (data) => {
      if (data.type === "chat_message") {
        // Only add message if it's between current user and selected user
        if (
          (data.sender_id === selectedUser.id &&
            data.receiver_id === currentUser.id) ||
          (data.sender_id === currentUser.id &&
            data.receiver_id === selectedUser.id)
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.message_id,
              sender: { id: data.sender_id, username: data.sender_username },
              receiver: { id: data.receiver_id },
              content: data.content,
              timestamp: data.timestamp,
            },
          ]);
        }
      } else if (data.type === "message_sent") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id,
            sender: { id: data.sender_id, username: data.sender_username },
            receiver: { id: data.receiver_id },
            content: data.content,
            timestamp: data.timestamp,
          },
        ]);
      } else if (data.type === "typing") {
        if (data.sender_id === selectedUser.id) {
          setTyping(data.is_typing);
          if (data.is_typing) {
            setTimeout(() => setTyping(false), 3000);
          }
        }
      }
    };

    websocketService.onMessage(handleMessage);

    return () => {
      websocketService.removeMessageHandler(handleMessage);
    };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(selectedUser.id);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    websocketService.sendMessage(selectedUser.id, newMessage.trim());
    setNewMessage("");

    // Stop typing indicator
    websocketService.sendTyping(selectedUser.id, false);
    clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    websocketService.sendTyping(selectedUser.id, true);

    // Clear existing timeout
    clearTimeout(typingTimeoutRef.current);

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(selectedUser.id, false);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {selectedUser.username}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedUser.is_online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender.id === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 border"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message ${selectedUser.username}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
