import LoadingUINoHeader from "@/components/ui/loading-ui-no-header";
import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <ClerkLoading>
        <LoadingUINoHeader />
      </ClerkLoading>

      <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
    </div>
  );
}
