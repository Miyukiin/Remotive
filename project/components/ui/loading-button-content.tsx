import { Loader2Icon } from "lucide-react";

interface LoadingButtonContentProps {
  isLoading: boolean;
  displayText: string;
  loaderSize?: string;
}

export function LoadingButtonContent({ isLoading, displayText, loaderSize }: LoadingButtonContentProps) {
  return (
    <>
      {isLoading ? (
        <div className="flex gap-2 items-center">
          <Loader2Icon className={`animate-spin ${loaderSize ? `h-${loaderSize} w-${loaderSize}` : ""} `} /> Loading
        </div>
      ) : (
        displayText
      )}
    </>
  );
}
