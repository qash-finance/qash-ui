import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Extract user-friendly error message from API response
function extractErrorMessage(errorData: any): string {
  let message = "";
  
  if (Array.isArray(errorData?.message)) {
    // NestJS validation error array - extract first constraint message
    const firstError = errorData.message[0];
    if (firstError?.constraints) {
      const constraintKey = Object.keys(firstError.constraints)[0];
      message = firstError.constraints[constraintKey];
    }
  } else if (errorData?.message) {
    message = errorData.message;
  } else {
    return "An Unexpected Error Occurred";
  }

  // Capitalize first letter for formal tone
  return message.charAt(0).toUpperCase() + message.slice(1);
}

export class AuthenticatedApiClient {
  private axiosInstance: AxiosInstance;
  private onUnauthenticated: () => void;

  constructor(
    baseURL: string,
    onUnauthenticated: () => void,
  ) {
    // ✅ CRITICAL: withCredentials enables cookie-based auth (para-jwt)
    this.axiosInstance = axios.create({ 
      baseURL,
      withCredentials: true, // Send cookies with every request
    });
    this.onUnauthenticated = onUnauthenticated;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Log requests for debugging
    this.axiosInstance.interceptors.request.use(
      config => {
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor - Handle 401 errors
    this.axiosInstance.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const status = error.response?.status;
        const url = error.config?.url;
        const errorData = error.response?.data;

        // Log validation errors with constraints or fall back to error message
        let errorLog = errorData;
        if (Array.isArray(errorData?.message)) {
          // NestJS validation error array - extract constraints
          const validationErrors = errorData.message.map((err: any) => ({
            property: err.property,
            constraints: err.constraints,
          }));
          errorLog = { validationErrors, statusCode: errorData.statusCode };
        } else if (errorData?.target && errorData?.constraints) {
          // Single validation error object
          errorLog = { constraints: errorData.constraints, statusCode: errorData.statusCode };
        } else if (typeof errorData === 'object' && errorData?.message) {
          // Fall back to message if available
          errorLog = errorData.message;
        }

        console.error(`❌ API Error ${status} on ${url}:`, errorLog);

        // Attach user-friendly error message to error for components to use
        (error as any).userMessage = extractErrorMessage(errorData);

        // Handle unauthorized errors
        if (status === 401) {
          console.warn("🔐 Unauthorized (401) - Cookie may be expired, redirecting to login...");
          this.onUnauthenticated();
          return Promise.reject(error);
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

  async deleteData<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.delete<T>(url, { ...config, data });
    return response.data;
  }
}

const apiServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  // ✅ CRITICAL: Enable cookies for Para JWT auth
  withCredentials: true,
});

// Create a single shared API client instance with cookie-based auth
const apiServerWithAuth = new AuthenticatedApiClient(
  process.env.NEXT_PUBLIC_SERVER_URL || "",
  () => {
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname || "";
    const isPublic =
      currentPath.startsWith("/login") ||
      currentPath.startsWith("/onboarding") ||
      currentPath.startsWith("/payment") ||
      currentPath.startsWith("/invoice-review") ||
      currentPath.startsWith("/mobile");
    if (!isPublic) {
      console.log("🔐 Redirecting to login due to 401 error");
      window.location.href = "/login";
    }
  },
);

export { apiServer, apiServerWithAuth };
