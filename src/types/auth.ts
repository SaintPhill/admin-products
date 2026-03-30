export interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}
