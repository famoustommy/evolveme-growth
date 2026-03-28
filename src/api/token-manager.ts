/**
 * Token manager for mobile using expo-secure-store
 */
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TOKEN_EXPIRY_KEY = "token_expiry";

export const tokenManager = {
  /**
   * Store access token securely
   */
  async setAccessToken(token: string, expiresIn: number): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

      // Calculate and store expiry time
      const expiryTime = Date.now() + expiresIn * 1000;
      await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error("Error storing access token:", error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return null;
    }
  },

  /**
   * Store refresh token securely
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw error;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  },

  /**
   * Update access token (used during refresh)
   */
  async updateAccessToken(token: string, expiresIn: number): Promise<void> {
    await this.setAccessToken(token, expiresIn);
  },

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  },

  /**
   * Check if access token is expired or about to expire
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
      if (!expiryStr) return true;

      const expiry = parseInt(expiryStr, 10);
      // Consider token expired if it expires in less than 5 minutes
      return Date.now() >= expiry - 5 * 60 * 1000;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  },

  /**
   * Store both tokens
   */
  async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): Promise<void> {
    await this.setAccessToken(accessToken, expiresIn);
    await this.setRefreshToken(refreshToken);
  },
};
