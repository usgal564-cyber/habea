import axios from 'axios';

   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Хүсэлт явуулах бүрт JWT Token залгах middleware
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;