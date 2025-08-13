import { User, Circle } from "lucide-react";

export default function UserList({ users, selectedUser, onUserSelect }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Users ({users.length})
        </h2>
        <div className="space-y-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserSelect(user)}
              className={`w-full p-3 rounded-lg text-left transition duration-200 flex items-center space-x-3 ${
                selectedUser?.id === user.id
                  ? "bg-blue-100 border-2 border-blue-200"
                  : "hover:bg-gray-50 border-2 border-transparent"
              }`}
            >
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <Circle
                    className={`w-4 h-4 ${
                      user.is_online
                        ? "text-green-500 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user.is_online ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No other users available</p>
          </div>
        )}
      </div>
    </div>
  );
}
