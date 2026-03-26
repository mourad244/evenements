"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { hasSessionExpired } from "@/features/auth/utils/auth-storage";
import { getToken } from "@/lib/auth/get-token";
import { ROUTES } from "@/lib/constants/routes";

type PublicOnlyGuardProps = {
  children: ReactNode;
};

function getHomeForRole(role?: string | null) {
  if (role === "ADMIN") return ROUTES.adminEvents;
  if (role === "ORGANIZER") return ROUTES.organizerEvents;
  return ROUTES.dashboard;
}

export function PublicOnlyGuard({ children }: PublicOnlyGuardProps) {
  const router = useRouter();
  const token = getToken();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (token && user) {
      router.replace(getHomeForRole(user.role));
    }
  }, [router, token, user]);

  if (token && (isLoading || user)) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (token && isError && hasSessionExpired()) {
    router.replace(ROUTES.sessionExpired);
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
