"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useCallback, useState } from "react";
import { Shield, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function VerificationOptions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = useCallback();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Verified
          </CardTitle>
          <CardDescription>
            Quick verification using your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>• Basic identity verification</p>
            <p>• +15 points per lesson</p>
            <p>• Instant verification</p>
          </div>
          <Button
            className="w-full"
            onClick={() => handleVerify(VerificationLevel.Device)}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify with Device"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Orb Verified
          </CardTitle>
          <CardDescription>
            Advanced verification using World ID Orb
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>• Enhanced identity verification</p>
            <p>• +25 points per lesson</p>
            <p>• Priority in search results</p>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleVerify(VerificationLevel.Orb)}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify with Orb"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
