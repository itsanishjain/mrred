"use client";

import { AuthPage } from "@/components/auth/AuthPage";
import { useRouter } from "next/navigation";

export default function AuthenticationPage() {
  const router = useRouter();
  
  const handleAuthSuccess = () => {
    // Redirect to home page after successful authentication
    router.push("/");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Lens Protocol Authentication</h1>
        <AuthPage onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
}
