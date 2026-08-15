export interface AuthLoginUser {
  role: 'owner' | 'admin';
  email: string;
  ruralMart?: string;
  userName?: string;
  ruralMartId?: string;
  ownerId?: string;
}

export interface AuthServiceContract {
  login(email: string, password: string): Promise<AuthLoginUser | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthLoginUser | null>;
}
