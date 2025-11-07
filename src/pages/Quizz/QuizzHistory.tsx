import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle } from "lucide-react";

type Attempt = {
  attempt_number: number;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  created_at: string;
  set_name?: string; // For aggregated view
};

interface QuizHistoryProps {
  setId?: number; // Optional: for single-set history
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ setId }) => {
  const [attemptsHistory, setAttemptsHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endpoint = setId ? `/api/attempt/history/${setId}` : "/api/attempt/history"; // Adjust for aggregated if API supports
        const res = await api.get(endpoint);
        setAttemptsHistory(res.data.attempts || []);
      } catch (err: any) {
        console.error("History fetch error:", err);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [setId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attempt History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Skeleton placeholder */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between p-3 bg-muted rounded">
                <span className="w-20 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                <span className="w-16 h-4 bg-muted-foreground/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attemptsHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Attempt History</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">No attempts yet. Start a quiz!</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <CardTitle>Attempt History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Attempt</TableHead>
                {setId ? null : <TableHead>Set</TableHead>}
                <TableHead>Score</TableHead>
                <TableHead>Percent</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attemptsHistory.map((attempt) => (
                <TableRow key={attempt.attempt_number} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{attempt.attempt_number}</TableCell>
                  {!setId && <TableCell>{attempt.set_name}</TableCell>}
                  <TableCell>{attempt.score}/{attempt.total_questions}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.passed ? "default" : "secondary"}>
                      {attempt.percent}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" role="img" aria-label={attempt.passed ? "Passed" : "Failed"}>
                      {attempt.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-semibold">Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 font-semibold">Failed</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(attempt.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizHistory;