"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { ROUTES } from "@/lib/constants/routes";
import { getToken } from "@/lib/auth/get-token";
import { hasSessionExpired } from "@/features/auth/utils/auth-storage";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const token = getToken();
  const { data: user, isLoading, isError } = useCurrentUser();
  const targetRoute = hasSessionExpired() ? ROUTES.sessionExpired : ROUTES.login;

  useEffect(() => {
    if (!token) {
      router.replace(targetRoute);
    }
  }, [router, targetRoute, token]);

  useEffect(() => {
    if (token && !isLoading && (isError || !user)) {
      router.replace(targetRoute);
    }
  }, [isError, isLoading, router, targetRoute, token, user]);

  if (!token || (token && isLoading) || (token && !isLoading && (isError || !user))) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
