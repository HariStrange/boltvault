import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Attempt = {
  attempt_number: number;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  created_at: string;
};

type ResultCarouselProps = {
  attempts: Attempt[];
};

export default function ResultCarousel({ attempts }: ResultCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Previous Attempts
      </h3>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onLoad={checkScroll}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {attempts.map((attempt) => {
            const circumference = 2 * Math.PI * 35;
            const offset = circumference - (attempt.percent / 100) * circumference;

            return (
              <div
                key={attempt.attempt_number}
                className="flex-shrink-0 w-72"
              >
                <Card
                  className={`h-full border-2 transition-all duration-300 ${
                    attempt.passed
                      ? "border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
                      : "border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950"
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={attempt.passed ? "default" : "secondary"}
                        className={`${
                          attempt.passed
                            ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
                        }`}
                      >
                        Attempt {attempt.attempt_number}
                      </Badge>
                      {attempt.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>

                    <div className="flex justify-center">
                      <div className="relative w-28 h-28">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="50%"
                            cy="50%"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className={attempt.passed ? "text-green-200 dark:text-green-800" : "text-orange-200 dark:text-orange-800"}
                          />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className={attempt.passed ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-foreground">
                            {attempt.percent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-lg font-bold text-foreground">
                          {attempt.score}/{attempt.total_questions}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(attempt.created_at).toLocaleDateString()} at{" "}
                        {new Date(attempt.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div
                      className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
                        attempt.passed
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                          : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200"
                      }`}
                    >
                      {attempt.passed ? "✓ Passed" : "✗ Failed"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-background border shadow-sm hover:bg-muted"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-background border shadow-sm hover:bg-muted"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
