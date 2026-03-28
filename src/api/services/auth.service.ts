/**
 * Authentication API service
 * Example implementation showing different API configurations
 */
import { api } from "../api-client";
import type {
  AuthResponse,
  EmailAuthRequest,
  PhoneAuthRequest,
  VerifyEmailOTPRequest,
  VerifyPhoneOTPRequest,
  RefreshTokenRequest,
} from "@/types/auth";

export const authService = {
  /**
   * Send magic link to email (public endpoint, no auth required)
   */
  sendMagicLink: async (data: EmailAuthRequest) => {
    const response = await api.public.post<{ message: string }>(
      "/auth/magic-link",
      data,
    );
    return response.data;
  },

  /**
   * Verify email OTP token (public endpoint)
   */
  verifyEmailOTP: async (data: VerifyEmailOTPRequest) => {
    const response = await api.public.post<AuthResponse>(
      "/auth/verify-email",
      data,
      {
        skipAuthRetry: true, // Don't retry on 401
      },
    );
    return response.data;
  },

  /**
   * Send OTP to phone (public endpoint)
   */
  sendPhoneOTP: async (data: PhoneAuthRequest) => {
    const response = await api.public.post<{ message: string }>(
      "/auth/phone-otp",
      data,
    );
    return response.data;
  },

  /**
   * Verify phone OTP (public endpoint)
   */
  verifyPhoneOTP: async (data: VerifyPhoneOTPRequest) => {
    const response = await api.public.post<AuthResponse>(
      "/auth/verify-phone",
      data,
      {
        skipAuthRetry: true, // Don't retry on 401
      },
    );
    return response.data;
  },

  /**
   * Refresh access token (public endpoint, manual handling)
   */
  refreshToken: async (data: RefreshTokenRequest) => {
    const response = await api.public.post<AuthResponse>(
      "/auth/refresh",
      data,
      {
        skipAuthRetry: true, // Don't retry on 401
      },
    );
    return response.data;
  },

  /**
   * Logout (authenticated endpoint)
   */
  logout: async () => {
    const response = await api.post<{ message: string }>(
      "/auth/logout",
      {},
      {
        skipAuthRedirect: true, // Don't redirect on auth failure
      },
    );
    return response.data;
  },

  /**
   * Get current user session (authenticated endpoint)
   */
  getSession: async () => {
    const response = await api.get<AuthResponse>("/auth/session");
    return response.data;
  },
};
