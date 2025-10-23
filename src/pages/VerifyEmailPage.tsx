import { useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      await verifyEmail(code);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 p-4 rounded-full bg-emerald-500/10">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Verify Email
            </h1>
            <p className="text-muted-foreground text-center">
              Please enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-14 w-12 text-xl" />
                  <InputOTPSlot index={1} className="h-14 w-12 text-xl" />
                  <InputOTPSlot index={2} className="h-14 w-12 text-xl" />
                  <InputOTPSlot index={3} className="h-14 w-12 text-xl" />
                  <InputOTPSlot index={4} className="h-14 w-12 text-xl" />
                  <InputOTPSlot index={5} className="h-14 w-12 text-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <button className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors">
                  Resend Code
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
