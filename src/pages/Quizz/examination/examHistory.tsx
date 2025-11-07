import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, FileText } from "lucide-react";

type Attempt = {
  attempt_number: number;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  created_at: string;
};

type ExamHistoryProps = {
  attempts: Attempt[];
};

export default function ExamHistory({ attempts }: ExamHistoryProps) {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <Card className="animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <CardTitle>Attempt History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Attempt</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percent</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt.attempt_number} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{attempt.attempt_number}</TableCell>
                  <TableCell>{attempt.score}/{attempt.total_questions}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.passed ? "default" : "secondary"}>
                      {attempt.percent}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
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
}
