import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PassportUploadForm from "@/components/forms/passport";

const PassportUploadPage: React.FC = () => {
  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle>Upload Passport Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PassportUploadForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportUploadPage;
