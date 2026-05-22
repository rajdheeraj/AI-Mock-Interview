import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const registerUser   = (data) => API.post('/auth/register', data);
export const loginUser      = (data) => API.post('/auth/login', data);
export const getMe          = ()     => API.get('/auth/me');
export const getInterviews  = ()     => API.get('/interviews');
export const getAttempts    = ()     => API.get('/attempts');
export const saveAttempt    = (data) => API.post('/attempts', data);
export const getAttemptById = (id)   => API.get(`/attempts/${id}`);
export const generateQuestions = (data) => API.post('/ai/generate-questions', data);
export const evaluateAnswers   = (data) => API.post('/ai/evaluate', data);