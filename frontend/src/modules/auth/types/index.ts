import React from 'react';

/**
 * Request payload for POST /api/v1/auth/login

 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Request payload for POST /api/v1/auth/refresh
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Request payload for POST /api/v1/auth/logout
 */
export interface LogoutRequest {
  refreshToken: string;
}

/**
 * User data nested inside AuthResponse
 */
export interface AuthUserResponse {
  id: string;
  email?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  profilePhoto?: string | null;
  employeeId?: string | null;
}

/**
 * Response data payload for POST /api/v1/auth/login and POST /api/v1/auth/refresh
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  user: AuthUserResponse;
  roles: string[];
  requiresPasswordChange?: boolean;
  setupToken?: string | null;
}

/**
 * Response data payload for GET /api/v1/auth/me
 */
export interface CurrentUserResponse {
  id: string;
  email?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  roles: string[];
  profilePhoto?: string | null;
  employeeId?: string | null;
}

/**
 * UI presentation props for LoginForm component
 */
export interface LoginFormProps {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface FirstLoginChangePasswordRequest {
  setupToken: string;
  newPassword: string;
  confirmPassword: string;
}
