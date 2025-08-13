import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import { authAPI } from "../services/api";
import websocketService from "../services/websocket";

export default function Chat() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect(token);

    // Load users
    loadUsers();

    return () => {
      websocketService.disconnect();
    };
  }, [token]);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Chat</h1>
              <p className="text-sm text-blue-100">Welcome, {user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        <UserList
          users={users}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </div>

      <div className="flex-1">
        {selectedUser ? (
          <ChatWindow currentUser={user} selectedUser={selectedUser} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
              <p>Select a user from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
