import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Clock,
  Target,
  Shield,
  Zap,
} from "lucide-react";

export default function GuidelinesCard() {
  return (
    <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 mb-6">
      <Clock className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-900 dark:text-blue-100 text-lg">
        Examination Guidelines
      </AlertTitle>
      <AlertDescription className="space-y-3 text-sm text-blue-800 dark:text-blue-200 mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">3 Attempts Available</p>
              <p className="text-xs opacity-90">Complete within 3 tries</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">70% to Pass</p>
              <p className="text-xs opacity-90">Minimum passing score</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">All Questions Required</p>
              <p className="text-xs opacity-90">Answer everything before submitting</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold">No Time Limit</p>
              <p className="text-xs opacity-90">Work at your own pace</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Best of Luck!
          </p>
          <p className="text-xs opacity-90">
            Read carefully, answer thoughtfully, and submit when ready. You've got this!
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
