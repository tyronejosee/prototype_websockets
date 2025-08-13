import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login/", { email, password }),

  register: (username, email, password, password_confirm) =>
    api.post("/auth/register/", {
      username,
      email,
      password,
      password_confirm,
    }),

  logout: () => api.post("/auth/logout/"),

  getUsers: () => api.get("/auth/users/"),
};

// Chat API
export const chatAPI = {
  getMessages: (userId) => api.get(`/chat/messages/${userId}/`),
};
