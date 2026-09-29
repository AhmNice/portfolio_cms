import type { UserDTO } from "../interface/user.dto";
import { create } from "zustand";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthResponse<T = any> {
  success: boolean;
  message: string;
  data?: UserDTO | null | T;
}

interface LoginPayload {
  email: string;
  password: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticating: false,
  isAuthenticated: false,
};

interface AuthActions {
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  authenticate: () => Promise<void>;
  logout: () => Promise<AuthResponse>;
  requestAccountRecovery: (
    secretKey: string,
  ) => Promise<AuthResponse<{ recoveryToken: string }>>;
  changePassword: ({
    newPassword,
    token,
  }: {
    newPassword: string;
    token: string;
  }) => Promise<AuthResponse>;
  reset: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  login: async (payload: LoginPayload) => {
    set({ loading: true, error: null });
    const response: AuthResponse = {
      success: false,
      message: "",
      data: null,
    };

    await handleRequest({
      request: () => api.post("/auth/login", payload),
      onSuccess: (data) => {
        set({
          user: data.data as UserDTO,
          loading: false,
          isAuthenticating: false,
          isAuthenticated: true,
        });
        response.success = true;
        response.message = "Login successful";
        response.data = data.data as UserDTO;
      },
      onError: (error) => {
        set({
          error: error.response?.data?.message || "Login failed",
          loading: false,
          isAuthenticating: false,
        });
        response.success = false;
        response.message =
          (error.response?.data?.message as string) || "Login failed";
        response.data = null;
      },
      showToast: true,
    });

    return response;
  },

  logout: async () => {
    const response: AuthResponse = {
      success: false,
      message: "",
      data: null,
    };

    await handleRequest({
      request: () => api.post("/auth/logout"),
      onSuccess: () => {
        get().reset(); // 1. Purge all auth state
        response.success = true;
        response.message = "Logout successful";
      },
      onError: (error) => {
        // 2. Clear user & auth state EVEN IF backend call fails (e.g., token already expired)
        get().reset();
        response.success = false;
        response.message =
          error.response?.data?.message ||
          "Logout failed on server, cleared locally";
      },
      showToast: true,
    });

    return response;
  },

  authenticate: async () => {
    set({ isAuthenticating: true });
    await handleRequest({
      request: () => api.get("/auth/me"),
      onSuccess: (data) => {
        set({
          user: data.data as UserDTO,
          loading: false,
          isAuthenticating: false,
          isAuthenticated: true,
        });
      },
      onError: (error) => {
        get().reset(); // Clear state if token verification fails
      },
      showToast: false,
    });
  },

  requestAccountRecovery: async (secretKey: string) => {
    const response: AuthResponse<{ recoveryToken: string }> = {
      success: false,
      message: "",
      data: null,
    };

    await handleRequest({
      request: () => api.post("/auth/request-recovery", { secretKey }),
      onSuccess: (data) => {
        response.success = true;
        response.message = "Recovery request successful";
        response.data = data.data as { recoveryToken: string };
      },
      onError: (error) => {
        response.success = false;
        response.message =
          error.response?.data?.message || "Recovery request failed";
      },
      showToast: true,
    });

    return response;
  },

  changePassword: async ({
    newPassword,
    token,
  }: {
    newPassword: string;
    token: string;
  }) => {
    const response: AuthResponse = {
      success: false,
      message: "",
      data: null,
    };

    await handleRequest({
      request: () =>
        api.post("/auth/change-password", {
          newPassword,
          recoveryToken: token,
        }),
      onSuccess: (data) => {
        response.success = true;
        response.message = "Password changed successfully";
        response.data = data.data as UserDTO;
      },
      onError: (error) => {
        response.success = false;
        response.message =
          error.response?.data?.message || "Failed to change password";
      },
      showToast: true,
    });

    return response;
  },

  reset: () => set({ ...initialState }),
}));
