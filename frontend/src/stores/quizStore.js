import { create } from 'zustand';

const useQuizStore = create((set, get) => ({
  currentQuestion: 0,
  score: 0,
  answers: [],
  isFinished: false,
  questions: [],

  setQuestions: (questions) => set({ questions }),

  answerQuestion: (selectedIndex) => {
    const { questions, currentQuestion, score } = get();
    const question = questions[currentQuestion];
    const isCorrect = selectedIndex === question.correctIndex;

    set({
      score: isCorrect ? score + 1 : score,
      answers: [...get().answers, { questionId: question.id, selectedIndex, isCorrect }]
    });
  },

  nextQuestion: () => {
    const { currentQuestion, questions } = get();
    if (currentQuestion < questions.length - 1) {
      set({ currentQuestion: currentQuestion + 1 });
    } else {
      set({ isFinished: true });
    }
  },

  resetQuiz: () => set({ currentQuestion: 0, score: 0, answers: [], isFinished: false }),

  getPercentage: () => {
    const { score, questions } = get();
    return questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  }
}));

export default useQuizStore;
