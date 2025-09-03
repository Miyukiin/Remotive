import LoadingUI from "@/components/ui/loading-ui";
import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <ClerkLoading>
        <LoadingUI />
      </ClerkLoading>

      <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
    </div>
  );
}
