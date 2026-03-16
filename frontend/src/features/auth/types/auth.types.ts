import type { User } from "@/types/user.types";

export type LoginInput = {
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
  confirmPassword?: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: "PARTICIPANT" | "ORGANIZER";
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
};
