/**
 * Example service demonstrating flexible API configurations
 */
import { api } from "../api-client";

export const exampleService = {
  /**
   * Example 1: Regular authenticated request
   */
  getProtectedData: async () => {
    const response = await api.get<{ data: string }>("/protected/data");
    return response.data;
  },

  /**
   * Example 2: Public endpoint (no authentication)
   */
  getPublicData: async () => {
    const response = await api.public.get<{ data: string }>("/public/data");
    return response.data;
  },

  /**
   * Example 3: External API call (absolute URL)
   */
  getExternalData: async () => {
    const response = await api.external.get<{ data: string }>(
      "https://api.example.com/data",
    );
    return response.data;
  },

  /**
   * Example 4: Custom base URL for specific endpoint
   */
  getDataFromV2API: async () => {
    const response = await api.get<{ data: string }>("/some-endpoint", {
      customBaseURL: "https://api.yourdomain.com/api/v2",
    });
    return response.data;
  },

  /**
   * Example 5: Silent request (no error logging)
   */
  getSilentData: async () => {
    try {
      const response = await api.get<{ data: string }>("/data", {
        silent: true,
      });
      return response.data;
    } catch (error) {
      // Handle error manually
      return null;
    }
  },

  /**
   * Example 6: Request with custom headers
   */
  getWithCustomHeaders: async () => {
    const response = await api.get<{ data: string }>("/data", {
      headers: {
        "X-Custom-Header": "value",
      },
    });
    return response.data;
  },

  /**
   * Example 7: Request with timeout override
   */
  getWithTimeout: async () => {
    const response = await api.get<{ data: string }>("/slow-endpoint", {
      timeout: 5000, // 5 seconds
    });
    return response.data;
  },

  /**
   * Example 8: Upload with form data
   */
  uploadFile: async (file: FormData) => {
    const response = await api.post<{ fileId: string }>("/upload", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for uploads
    });
    return response.data;
  },

  /**
   * Example 9: Download file (blob response)
   */
  downloadFile: async (fileId: string) => {
    const response = await api.get<Blob>(`/files/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Example 10: Paginated request with query params
   */
  getPagedData: async (page: number, limit: number) => {
    const response = await api.get<{ items: unknown[]; total: number }>(
      "/items",
      {
        params: {
          page,
          limit,
        },
      },
    );
    return response.data;
  },

  /**
   * Example 11: Request that bypasses auth redirect
   * (useful for checking auth status without triggering login)
   */
  checkAuth: async () => {
    try {
      const response = await api.get<{ authenticated: boolean }>(
        "/auth/check",
        {
          skipAuthRedirect: true,
        },
      );
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  },
};
