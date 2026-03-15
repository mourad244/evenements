"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/lib/constants/routes";
import { getToken } from "@/lib/auth/get-token";
import { hasSessionExpired } from "@/features/auth/utils/auth-storage";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const token = getToken();
  const targetRoute = hasSessionExpired() ? ROUTES.sessionExpired : ROUTES.login;

  useEffect(() => {
    if (!token) {
      router.replace(targetRoute);
    }
  }, [router, targetRoute, token]);

  if (!token) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
