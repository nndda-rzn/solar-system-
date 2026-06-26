import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import { QUESTIONS } from '../data/questions';

const Quiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);

    const question = QUESTIONS[currentQ];
    const isCorrect = index === question.correctIndex;
    if (isCorrect) setScore(score + 1);

    setAnswers([...answers, { questionId: question.id, selectedIndex: index, isCorrect }]);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setIsFinished(false);
    setSelected(null);
    setAnswered(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <GlassPanel className="max-w-md text-center">
          <h2 className="font-heading text-3xl mb-4">Hasil Kuis</h2>
          <div className="text-6xl font-bold mb-2">{score}/{QUESTIONS.length}</div>
          <div className="text-2xl text-white/70 mb-4">{percentage}%</div>
          <div className={`text-xl mb-6 ${percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {percentage >= 80 ? 'Luar Biasa!' : percentage >= 60 ? 'Bagus!' : 'Perlu Belajar Lagi'}
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={resetQuiz}>Coba Lagi</Button>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Kembali
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const question = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="font-heading text-4xl text-center mb-8">Kuis Tata Surya</h1>
        
        <div className="mb-4 text-white/50">
          Soal {currentQ + 1} dari {QUESTIONS.length}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <GlassPanel>
          <h3 className="text-xl mb-6">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let bgColor = 'bg-white/5 hover:bg-white/10';
              if (answered) {
                if (index === question.correctIndex) bgColor = 'bg-green-500/30 border border-green-500';
                else if (index === selected) bgColor = 'bg-red-500/30 border border-red-500';
              }

              return (
                <motion.button
                  key={index}
                  className={`w-full p-4 text-left rounded-lg transition-colors ${bgColor}`}
                  whileHover={!answered ? { scale: 1.02 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </motion.button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg ${
                selected === question.correctIndex
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {selected === question.correctIndex ? 'Benar!' : 'Salah!'}
              <p className="text-sm text-white/70 mt-2">{question.explanation}</p>
            </motion.div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default Quiz;
