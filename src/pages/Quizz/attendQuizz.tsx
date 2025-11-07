import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  AlertCircle,
} from "lucide-react";
import CircularStats from "@/pages/Quizz/examination/circularStats";
import ExamHistory from "@/pages/Quizz/examination/examHistory";

type Option = {
  id: number;
  option_text: string;
  is_correct?: boolean;
};

type Question = {
  id: number;
  question_text?: string;
  question_image_url?: string;
  question_type: string;
  options: Option[];
};

type Attempt = {
  attempt_number: number;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  created_at: string;
};

type Status = {
  attempts_count: number;
  attempts_left: number;
  best_score: number;
  best_percent: number;
  can_attempt: boolean;
  status?: string;
};

export default function AttendQuiz() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [attemptsHistory, setAttemptsHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const [showResultDialog, setShowResultDialog] = useState<boolean>(false);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!setId) {
      toast.error("Invalid set ID");
      navigate("/dashboard/quizz/examination");
      return;
    }

    const load = async () => {
      try {
        const stRes = await api.get(`/api/attempt/status/${setId}`);
        setStatus(stRes.data);

        const qRes = await api.get(`/api/quizz/set/${setId}/questions`);
        setQuestions(qRes.data.questions);

        const histRes = await api.get(`/api/attempt/history/${setId}`);
        setAttemptsHistory(histRes.data.attempts);

        const map: Record<number, number | null> = {};
        qRes.data.questions.forEach((q: Question) => {
          map[q.id] = null;
        });
        setAnswers(map);
      } catch (err: any) {
        console.error("Load error:", err);
        toast.error(err?.response?.data?.error || "Failed to load quiz");
        navigate("/dashboard/quizz/examination");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setId, navigate]);

  const selectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    const unanswered = Object.values(answers).some((a) => a === null);
    if (unanswered) {
      toast.error("Please answer all questions before submitting!");
      return;
    }

    if (!status?.can_attempt) {
      toast.error("No attempts left!");
      return;
    }

    try {
      const payload = {
        question_set_id: Number(setId),
        answers: Object.entries(answers)
          .filter(([_, oid]) => oid !== null)
          .map(([qid, oid]) => ({
            question_id: Number(qid),
            selected_option_id: oid as number,
          })),
      };

      const resp = await api.post("/api/attempt/submit", payload);
      setResult(resp.data.attempt);
      setSubmitted(true);
      setJustSubmitted(true);
      setShowSubmitDialog(false);

      const histRes = await api.get(`/api/attempt/history/${setId}`);
      setAttemptsHistory(histRes.data.attempts);

      const stRes = await api.get(`/api/attempt/status/${setId}`);
      setStatus(stRes.data);

      if (resp.data.attempt.passed) {
        setShowResultDialog(true);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err?.response?.data?.error || "Failed to submit quiz");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const answeredCount = Object.values(answers).filter((a) => a !== null).length;
  const progressPercent = (answeredCount / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentQuestionAnswered = currentQuestion && answers[currentQuestion.id] !== null;

  const hasPassed = (status?.best_percent ?? 0) >= 70;
  const isFirstAttempt = status?.attempts_count === 0;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-3 w-full" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <Card className="text-center p-8">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>Unable to load examination data.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/dashboard/quizz/examination")}>
              Back to Examinations
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (hasPassed && !status.can_attempt) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Examination Completed</h1>
            <p className="text-sm text-muted-foreground mt-1">Set #{setId}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/quizz/examination")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <CircularStats
          score={status.best_score}
          totalQuestions={attemptsHistory[0]?.total_questions || 0}
          percent={status.best_percent}
        />

        <ExamHistory attempts={attemptsHistory} />
      </div>
    );
  }

  if (!status.can_attempt && !submitted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Examination Status</h1>
            <p className="text-sm text-muted-foreground mt-1">Set #{setId}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/quizz/examination")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900 dark:text-red-100">No Attempts Left</CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  You have exhausted all attempts for this examination
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Best Score:</span> {status.best_score} ({status.best_percent}%)
            </p>
            <p>
              <span className="font-semibold">Status:</span> {status.status || "Completed"}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/quizz/examination")} className="w-full">
              Back to Examinations
            </Button>
          </CardFooter>
        </Card>

        <ExamHistory attempts={attemptsHistory} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Examination?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                  Warning: {questions.length - answeredCount} question(s) remain unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Review
            </Button>
            <Button onClick={submitQuiz}>Confirm Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-in zoom-in duration-500 bg-gradient-to-br from-green-400 to-emerald-500">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-base space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result?.score}/{result?.total_questions}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result?.percent.toFixed(1)}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Great job! You've passed this examination. Contact admin for next steps.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowResultDialog(false);
                navigate("/dashboard/quizz/examination");
              }}
              className="w-full"
            >
              Back to Examinations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Examination</h1>
          <p className="text-sm text-muted-foreground mt-1">Set #{setId}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/quizz/examination")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {isFirstAttempt && (
        <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Examination Guidelines</AlertTitle>
          <AlertDescription className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>You have <strong>3 attempts</strong> for this examination</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Passing requires <strong>70%</strong> or higher</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Answer all questions before submitting</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>No time limit - work at your own pace</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isFirstAttempt && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Examination Status</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Attempts</p>
                <p className="text-lg font-semibold">{status.attempts_count}/3</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold">{status.attempts_left}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Best Score</p>
                <p className="text-lg font-semibold">{status.best_score} ({status.best_percent}%)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">{status.status || "In Progress"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!submitted && questions.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Progress</CardTitle>
                  <span className="text-sm font-semibold">
                    {answeredCount}/{questions.length} answered
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl leading-relaxed">
                    {currentQuestion.question_text || "Image-based question"}
                  </CardTitle>
                </div>
                {currentQuestionAnswered && (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 animate-in zoom-in" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.question_image_url && (
                <div className="relative rounded-lg overflow-hidden border-2 bg-muted/30 p-4">
                  <img
                    src={`http://localhost:3000/uploads/quizzes/${currentQuestion.question_image_url}`}
                    alt="Question"
                    className="max-w-full max-h-96 mx-auto rounded-lg object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        className="mt-1 w-4 h-4 text-primary accent-primary"
                        checked={isSelected}
                        onChange={() => selectOption(currentQuestion.id, option.id)}
                      />
                      <span className="flex-1 text-sm sm:text-base">
                        <span className="font-medium mr-2 text-muted-foreground">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {option.option_text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-3 bg-muted/30">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={isFirstQuestion}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={isLastQuestion ? () => setShowSubmitDialog(true) : handleNextQuestion}
                disabled={!currentQuestionAnswered && isLastQuestion}
              >
                {isLastQuestion ? "Submit" : "Next"}
                {!isLastQuestion && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
