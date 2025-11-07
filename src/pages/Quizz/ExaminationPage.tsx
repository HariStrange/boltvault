import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Target, BookOpen, ArrowRight } from "lucide-react";
import GuidelinesCard from "@/pages/Quizz/examination/GuidelinesCard";
import ResultCarousel from "@/pages/Quizz/examination/ResultCarousels";

type Attempt = {
  attempt_number: number;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  created_at: string;
};

type AssignedSet = {
  id: number;
  question_set_id: number;
  set_name: string;
  category: string;
};

type SetStatus = {
  attempts_count: number;
  attempts_left: number;
  best_score: number;
  best_percent: number;
  can_attempt: boolean;
  status?: string;
};

type ExamCardData = {
  set: AssignedSet;
  status: SetStatus;
  attempts: Attempt[];
};

export default function ExaminationPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/quizz/user/assigned-sets");
        const assignedSets: AssignedSet[] = res.data.assigned || [];

        if (assignedSets.length === 0) {
          setExams([]);
          setLoading(false);
          return;
        }

        const examsData: ExamCardData[] = [];

        for (const set of assignedSets) {
          try {
            const statusRes = await api.get(
              `/api/attempt/status/${set.question_set_id}`
            );
            const historyRes = await api.get(
              `/api/attempt/history/${set.question_set_id}`
            );

            examsData.push({
              set,
              status: statusRes.data,
              attempts: historyRes.data.attempts || [],
            });
          } catch (err) {
            console.error(`Failed to fetch data for set ${set.question_set_id}:`, err);
          }
        }

        setExams(examsData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast.error(err?.response?.data?.error || "Failed to load examinations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64" />
        <Separator />
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Card>
                <CardHeader className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <Card className="w-full text-center p-8 border-dashed">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No Examinations Assigned</CardTitle>
            <CardDescription className="pt-2">
              Contact your administrator if you believe this is a mistake.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-4">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Examinations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {exams.length} examination{exams.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="space-y-12">
        {exams.map((examData, index) => {
          const { set, status, attempts } = examData;
          const isFirstAttempt = status.attempts_count === 0;
          const hasPassed = (status.best_percent ?? 0) >= 70;
          const canAttempt = status.can_attempt;

          return (
            <div key={set.question_set_id} className=" space-y-4 animate-in slide-in-from-bottom" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
              <Card className={`border-l-4 transition-all duration-300 ${
                hasPassed
                  ? "border-l-green-500 shadow-lg"
                  : canAttempt
                  ? "border-l-blue-500 shadow-md"
                  : "border-l-gray-400"
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                        <CardTitle className="text-xl sm:text-2xl">
                          {set.set_name}
                        </CardTitle>
                        {hasPassed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 animate-in zoom-in" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline" className="text-xs font-medium">
                          {set.category}
                        </Badge>
                        {isFirstAttempt ? (
                          <Badge variant="secondary" className="text-xs">
                            First Attempt
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Attempt {status.attempts_count}/3
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Best Score</p>
                        <p className="text-2xl font-bold">
                          {status.best_percent}%
                        </p>
                      </div>
                      {hasPassed && (
                        <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ✓ Passed
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isFirstAttempt && canAttempt && (
                  <CardContent className="pb-0">
                    <Separator className="mb-4" />
                    <GuidelinesCard />
                  </CardContent>
                )}

                {!isFirstAttempt && attempts.length > 0 && (
                  <CardContent className="pb-6">
                    <ResultCarousel attempts={attempts} />
                  </CardContent>
                )}

                <CardFooter className="flex flex-col gap-3 bg-muted/20">
                  {canAttempt ? (
                    <>
                      <Button
                        className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        size="lg"
                        onClick={() => navigate(`/dashboard/quizz/attend/${set.question_set_id}`)}
                      >
                        {isFirstAttempt ? "Start Examination" : "Take Another Attempt"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {!isFirstAttempt && status.attempts_left > 0 && (
                        <p className="text-xs text-muted-foreground text-center">
                          {status.attempts_left} attempt{status.attempts_left !== 1 ? "s" : ""} remaining
                        </p>
                      )}
                    </>
                  ) : hasPassed ? (
                    <div className="w-full p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-300 dark:border-green-700 text-center">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        ✓ Examination Passed
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        No further attempts needed
                      </p>
                    </div>
                  ) : (
                    <div className="w-full p-4 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-300 dark:border-red-700 text-center">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        ✗ No Attempts Left
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Contact admin for assistance
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
