import { Loader2Icon } from "lucide-react";

interface LoadingButtonContentProps {
  isLoading: boolean;
  displayText: string;
  loaderSize?: number;
}

export function LoadingButtonContent({ isLoading, displayText, loaderSize }: LoadingButtonContentProps) {
  return (
    <>
      {isLoading ? (
        <div className="flex gap-2 items-center">
          <Loader2Icon className={`animate-spin`} style={{width: loaderSize, height: loaderSize}} /> Loading
        </div>
      ) : (
        displayText
      )}
    </>
  );
}
