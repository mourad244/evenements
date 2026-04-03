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
    // Only redirect when there is no token, or when the fetch failed AND there is no cached user
    // (do not redirect on background-refetch errors when we already have valid cached data)
    if (!token) {
      router.replace(targetRoute);
    } else if (!isLoading && isError && !user) {
      router.replace(targetRoute);
    }
  }, [isError, isLoading, router, targetRoute, token, user]);

  if (!token || (token && isLoading && !user) || (token && !isLoading && isError && !user)) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
