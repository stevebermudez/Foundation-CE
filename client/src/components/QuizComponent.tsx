import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Timer,
  TimerOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  Download,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  courseTitle: string;
  questions: Question[];
  isTimed: boolean;
  timeLimit?: number;
  passingScore: number;
  onComplete: (score: number, passed: boolean) => void;
  onDownloadCertificate: () => void;
}

export default function QuizComponent({
  courseTitle,
  questions,
  isTimed,
  timeLimit = 60,
  passingScore,
  onComplete,
  onDownloadCertificate,
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [quizStarted, setQuizStarted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  useEffect(() => {
    if (!isTimed || !quizStarted || showResults) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimed, quizStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const passed = score >= passingScore;
    setShowResults(true);
    onComplete(score, passed);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setTimeRemaining(timeLimit * 60);
    setQuizStarted(false);
  };

  const score = calculateScore();
  const passed = score >= passingScore;

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Assessment</h2>
          <p className="text-muted-foreground">{courseTitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{questions.length}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{passingScore}%</p>
              <p className="text-sm text-muted-foreground">Passing Score</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            {isTimed ? (
              <>
                <Timer className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Timed Exam: {timeLimit} minutes</span>
              </>
            ) : (
              <>
                <TimerOff className="h-5 w-5 text-green-500" />
                <span className="font-medium">No Time Limit - Work at your own pace</span>
              </>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Before you begin:
                </p>
                <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 space-y-1">
                  <li>Ensure you have a stable internet connection</li>
                  <li>You can review and change answers before submitting</li>
                  <li>Your progress will be saved if you navigate between questions</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setQuizStarted(true)}
            data-testid="button-start-quiz"
          >
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center space-y-6">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              passed ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            {passed ? (
              <Award className="h-10 w-10 text-green-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">
              {passed ? "Congratulations!" : "Almost There!"}
            </h2>
            <p className="text-muted-foreground">
              {passed
                ? "You have successfully passed the assessment."
                : "You didn't pass this time, but you can try again."}
            </p>
          </div>

          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{score}%</p>
              <p className="text-sm text-muted-foreground">Your Score</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{passingScore}%</p>
              <p className="text-sm text-muted-foreground">Required</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {passed ? (
              <Button
                size="lg"
                className="gap-2"
                onClick={onDownloadCertificate}
                data-testid="button-download-certificate"
              >
                <Download className="h-4 w-4" />
                Download Certificate
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2"
                onClick={handleRetake}
                data-testid="button-retake-quiz"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Assessment
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowExplanation(true)}
              data-testid="button-review-answers"
            >
              Review Answers
            </Button>
          </div>
        </CardContent>

        <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Answer Review</DialogTitle>
              <DialogDescription>
                Review your answers and explanations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div key={q.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-1 text-sm mb-3">
                          {q.options.map((option, optIdx) => (
                            <p
                              key={optIdx}
                              className={
                                optIdx === q.correctAnswer
                                  ? "text-green-600 font-medium"
                                  : optIdx === userAnswer
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {String.fromCharCode(65 + optIdx)}. {option}
                              {optIdx === q.correctAnswer && " (Correct)"}
                              {optIdx === userAnswer && optIdx !== q.correctAnswer && " (Your answer)"}
                            </p>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground bg-background p-3 rounded">
                          <span className="font-medium">Explanation: </span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="sticky top-16 z-40 bg-background py-4 mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="font-medium" data-testid="text-question-counter">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <Badge variant="outline">
              {answeredCount} answered
            </Badge>
          </div>

          {isTimed && (
            <Badge
              variant={timeRemaining < 300 ? "destructive" : "secondary"}
              className="gap-1 text-base px-3 py-1"
            >
              <Timer className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </Badge>
          )}

          {!isTimed && (
            <Badge variant="secondary" className="gap-1">
              <TimerOff className="h-4 w-4" />
              No Timer
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-6" data-testid="text-question">
            {currentQuestion.question}
          </h3>

          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ""}
            onValueChange={(value) =>
              setAnswers({ ...answers, [currentQuestion.id]: parseInt(value) })
            }
            className="space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                  answers[currentQuestion.id] === idx
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >
                <RadioGroupItem
                  value={idx.toString()}
                  id={`option-${idx}`}
                  data-testid={`radio-option-${idx}`}
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          disabled={currentQuestionIndex === 0}
          className="gap-2"
          data-testid="button-previous-question"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="gap-2"
              data-testid="button-next-question"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="gap-2"
              data-testid="button-submit-quiz"
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              idx === currentQuestionIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id] !== undefined
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-muted hover:bg-muted/80"
            }`}
            data-testid={`button-question-nav-${idx}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
