import { Link } from "react-router-dom";
import { Home, ArrowLeft, FileSearch } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <FileSearch className="w-10 h-10 text-primary" />
        </div>

        {/* Error Code */}
        <h1 className="font-heading text-7xl font-bold text-primary mb-2">404</h1>

        {/* Message */}
        <h2 className="font-heading text-headline-md font-semibold text-on-surface mb-3">
          Page Not Found
        </h2>
        <p className="font-body text-body-md text-on-surface-variant mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-heading text-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-outline text-on-surface font-heading text-sm transition-all duration-300 hover:border-primary hover:text-primary hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;