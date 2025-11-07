import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Trophy, Target } from "lucide-react";

type CircularStatsProps = {
  score: number;
  totalQuestions: number;
  percent: number;
};

export default function CircularStats({
  score,
  totalQuestions,
  percent,
}: CircularStatsProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <Card className="overflow-hidden border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          {/* Circle Section with Trophy on Right */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-6 relative">
            <div className="relative">
              <svg className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="text-green-600 dark:text-green-500 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              {/* Percentage in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">
                  {percent.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex flex-col gap-3 sm:gap-4 text-center lg:text-left w-full lg:w-auto">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Questions Answered
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                    {totalQuestions}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Correct Answers
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                    {score}
                  </p>
                </div>
              </div>

              <div className="mt-2 p-2 sm:p-3 rounded-lg bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 self-center lg:self-auto">
                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 text-center">
                  ✓ Examination Passed
                </p>
              </div>
            </div>

            {/* Big Trophy on Right */}
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-24 lg:h-28 text-yellow-600 hidden sm:block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
