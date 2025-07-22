import { AuthenticatedApiClient } from ".";

export class UserApiService {
  constructor(private apiClient: AuthenticatedApiClient) {}

  // async getProfile(): Promise<UserProfile> {
  //   return await this.apiClient.getData<UserProfile>("/user/profile");
  // }

  // async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  //   return await this.apiClient.putData<UserProfile>("/user/profile", profile);
  // }

  // async getTransactions(): Promise<Transaction[]> {
  //   return await this.apiClient.getData<Transaction[]>("/user/transactions");
  // }

  // async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  //   const formData = new FormData();
  //   formData.append("avatar", file);

  //   return await this.apiClient.postData<{ avatarUrl: string }>("/user/avatar", formData);
  // }
}
