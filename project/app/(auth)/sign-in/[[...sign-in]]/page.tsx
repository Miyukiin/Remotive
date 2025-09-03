import LoadingUI from "@/components/ui/loading-ui";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <ClerkLoading>
        <LoadingUI />
      </ClerkLoading>

      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </div>
  );
}
