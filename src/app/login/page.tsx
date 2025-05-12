"use client";

import Onboarding from "@/components/onboarding/Onboarding";

const Login = ({ onboardUser }: { onboardUser: () => Promise<void> }) => {
  return <Onboarding onboardUser={onboardUser} />;
};

export default Login;
