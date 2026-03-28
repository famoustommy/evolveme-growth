/**
 * Authentication types matching backend passwordless schemas
 */

// ============================================================================
// USER & RESPONSE TYPES
// ============================================================================

export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  user_metadata?: Record<string, unknown>;
  is_new_user: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  expires_in: number;
  expires_at?: number;
}

// ============================================================================
// PASSWORDLESS AUTHENTICATION
// ============================================================================

// Email Magic Link
export interface EmailAuthRequest {
  email: string;
}

export interface VerifyEmailOTPRequest {
  token_hash: string;
  type: string;
}

// Phone OTP
export interface PhoneAuthRequest {
  phone: string;
}

export interface VerifyPhoneOTPRequest {
  phone: string;
  token: string;
}

// ============================================================================
// PROFILE COMPLETION
// ============================================================================

export interface CompleteProfileRequest {
  name: string;
  date_of_birth: string; // ISO date string (YYYY-MM-DD)
  bio?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  date_of_birth?: string; // ISO date string (YYYY-MM-DD)
  bio?: string;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface RefreshTokenRequest {
  refresh_token: string;
}
