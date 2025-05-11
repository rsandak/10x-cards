import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  "data-test-id"?: string;
}

export function LoadingIndicator({ className, "data-test-id": dataTestId }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex justify-center items-center py-4", className)} data-test-id={dataTestId}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
