import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { AuthStorage } from "../auth/storage";

export class AuthenticatedApiClient {
  private axiosInstance: AxiosInstance;
  private getToken: () => string | null;
  private refreshToken: () => Promise<void>;
  private onUnauthenticated: () => void;

  constructor(
    baseURL: string,
    getToken: () => string | null,
    refreshToken: () => Promise<void>,
    onUnauthenticated: () => void,
  ) {
    this.axiosInstance = axios.create({ baseURL });
    this.getToken = getToken;
    this.refreshToken = refreshToken;
    this.onUnauthenticated = onUnauthenticated;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth header
    this.axiosInstance.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor - Handle token refresh
    this.axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const newToken = this.getToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.onUnauthenticated();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Standard HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  // Convenience methods that return data directly
  async getData<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.get<T>(url, config);
    return response.data;
  }

  async postData<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.post<T>(url, data, config);
    return response.data;
  }

  async putData<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.put<T>(url, data, config);
    return response.data;
  }

  async patchData<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.patch<T>(url, data, config);
    return response.data;
  }

  async deleteData<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.delete<T>(url, config);
    return response.data;
  }
}

const apiServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

// Create a single shared API client instance
const apiServerWithAuth = new AuthenticatedApiClient(
  process.env.NEXT_PUBLIC_SERVER_URL || "",
  () => {
    const auth = AuthStorage.getAuth();
    return auth?.sessionToken || null;
  },
  async () => {
    // TODO: Implement token refresh logic
    // For now, just clear auth and redirect to login
  },
  () => {},
);

export { apiServer, apiServerWithAuth };
