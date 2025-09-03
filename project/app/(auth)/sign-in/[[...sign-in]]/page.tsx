import LoadingUINoHeader from "@/components/ui/loading-ui-no-header";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <ClerkLoading>
        <LoadingUINoHeader />
      </ClerkLoading>

      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </div>
  );
}
