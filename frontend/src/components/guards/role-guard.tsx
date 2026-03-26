"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { ROUTES } from "@/lib/constants/routes";
import { hasRole } from "@/lib/auth/has-role";
import type { Role } from "@/types/common.types";
import type { User } from "@/types/user.types";

type RoleGuardProps = {
  user: User | null | undefined;
  allowedRoles: Role[];
  children: ReactNode;
};

export function RoleGuard({ user, allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const allowed = hasRole(user?.role, allowedRoles);

  useEffect(() => {
    if (user && !allowed) {
      router.replace(ROUTES.dashboard);
    }
  }, [allowed, router, user]);

  if (!user || !allowed) {
    return null;
  }

  return <>{children}</>;
}
