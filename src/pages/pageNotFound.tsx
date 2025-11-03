// src/pages/NotFoundPage.tsx
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}
