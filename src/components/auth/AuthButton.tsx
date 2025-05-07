"use client";

import { useSession, SessionType } from "@lens-protocol/react-web";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserIcon } from "lucide-react";

interface AuthButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AuthButton({ variant = "default", size = "default" }: AuthButtonProps): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();
  const { authenticated } = usePrivy();

  const handleClick = () => {
    router.push("/auth");
  };

  // If authenticated with Lens, show profile handle or ID
  if (session && session.type === SessionType.WithProfile) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleClick}
        className="flex items-center gap-2"
      >
        <UserIcon className="h-4 w-4" />
        <span>
          {session.profile.handle?.localName ?? session.profile.id.substring(0, 6)}
        </span>
      </Button>
    );
  }

  // If authenticated with Privy but not with Lens
  if (authenticated) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleClick}
      >
        Connect Lens
      </Button>
    );
  }

  // Not authenticated
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
    >
      Sign In
    </Button>
  );
}
