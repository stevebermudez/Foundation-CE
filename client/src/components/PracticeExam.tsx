import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, BarChart3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ExamQuestion {
  id: string;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  explanation?: string;
  options: string;
  sequence: number;
}

interface PracticeExamProps {
  examId: string;
  userId: string;
}

export default function PracticeExam({ examId, userId }: PracticeExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const { data: examData, isLoading } = useQuery({
    queryKey: ["/api/exams", examId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/exams/${examId}`);
      return response.json();
    },
  });

  const startExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/exams/${examId}/start`, { userId });
      return response.json();
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const question = questions.find((q) => q.id === questionId);
      const response = await apiRequest("POST", `/api/exams/attempts/${attemptId}/answer`, {
        questionId,
        userAnswer: answers[questionId],
        correctAnswer: question?.correctAnswer,
      });
      return response.json();
    },
  });

  const completeExamMutation = useMutation({
    mutationFn: async () => {
      const questions = examData.questions;
      let correctCount = 0;
      questions.forEach((q: ExamQuestion) => {
        if (answers[q.id] === q.correctAnswer) correctCount++;
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const response = await apiRequest("POST", `/api/exams/attempts/${attemptId}/complete`, {
        score,
        correctAnswers: correctCount,
        timeSpent,
      });
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
    },
  });

  if (!attemptId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            {examData?.title || "Practice Exam"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {examData?.description}
          </p>
          <div className="space-y-2 mb-6 text-left max-w-md mx-auto">
            <p className="text-sm">
              <span className="font-semibold">Total Questions:</span> {examData?.totalQuestions}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Passing Score:</span> {examData?.passingScore}%
            </p>
            {examData?.timeLimit && (
              <p className="text-sm">
                <span className="font-semibold">Time Limit:</span> {examData.timeLimit} minutes
              </p>
            )}
          </div>
          <Button
            onClick={() => startExamMutation.mutate()}
            disabled={startExamMutation.isPending}
            data-testid="button-start-exam"
            size="lg"
          >
            Start Exam
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !examData) return <div>Loading exam...</div>;

  const questions: ExamQuestion[] = examData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const options = currentQuestion ? JSON.parse(currentQuestion.options) : [];

  if (showResults) {
    const correctCount = Object.entries(answers).reduce((count, [qId, answer]) => {
      const q = questions.find((q) => q.id === qId);
      return count + (q?.correctAnswer === answer ? 1 : 0);
    }, 0);

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? "PASSED" : "FAILED"}
          </h2>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {score}%
          </p>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            You answered {correctCount} out of {questions.length} questions correctly
          </p>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Answers</h3>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <Card key={q.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {idx + 1}. {q.questionText}
                  </p>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-300">
                    Your answer: <span className="font-semibold">{userAnswer}</span>
                  </p>
                  {!isCorrect && (
                    <p className="text-slate-600 dark:text-slate-300">
                      Correct answer: <span className="font-semibold text-green-600">{q.correctAnswer}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded mt-2">
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Button onClick={() => window.location.reload()} className="w-full" data-testid="button-retake-exam">
          Retake Exam
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {examData?.passingScore}% to pass
          </Badge>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">
          {currentQuestion.questionText}
        </h3>

        <div className="space-y-3">
          {options.map((option: string) => (
            <label
              key={option}
              className="flex items-center p-4 border rounded-lg cursor-pointer hover-elevate transition-colors"
              data-testid={`option-${option}`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={(e) =>
                  setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
                }
                className="w-4 h-4"
              />
              <span className="ml-3 text-slate-900 dark:text-white">{option}</span>
            </label>
          ))}
        </div>
      </Card>

      {answers[currentQuestion.id] && (
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Your answer:</span> {answers[currentQuestion.id]}
          </p>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          data-testid="button-previous-question"
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (isLastQuestion) {
              completeExamMutation.mutate();
            } else {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
          }}
          disabled={!answers[currentQuestion.id]}
          data-testid="button-next-question"
        >
          {isLastQuestion ? "Submit Exam" : "Next"}
        </Button>
      </div>
    </div>
  );
}
