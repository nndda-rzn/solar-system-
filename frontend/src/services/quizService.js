import api from './api';

export const quizService = {
  getQuestions: () => api.get('/questions'),
  submitQuiz: (data) => api.post('/quiz/submit', data),
  getHistory: () => api.get('/quiz/history')
};
