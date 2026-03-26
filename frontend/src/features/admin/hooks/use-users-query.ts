"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsers } from "../api/get-users";

export function useUsersQuery() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsers
  });
}
