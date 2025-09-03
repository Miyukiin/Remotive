import { DefaultHeader } from "@/components/default-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <DefaultHeader />
      <main className="flex-1 grid place-items-center px-4">
        {children}
      </main>
    </div>
  );
}
