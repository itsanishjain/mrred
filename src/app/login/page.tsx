"use client";

import Onboarding from "@/components/onboarding/Onboarding";

export default function Login() {
  const handleOnboardUser = async () => {
    // Implement onboarding logic here
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  return <Onboarding onboardUser={handleOnboardUser} />;
}
