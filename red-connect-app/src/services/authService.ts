import api from "@/services/api";

// Define user type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  bloodType?: string;
}

// Auth service class
class AuthService {
  private user: User | null = null;

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  // Get current user
  getUser(): User | null {
    if (this.user) {
      return this.user;
    }
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        return this.user;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        return null;
      }
    }
    
    return null;
  }

  // Set current user
  setUser(user: User): void {
    this.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Clear current user
  clearUser(): void {
    this.user = null;
    localStorage.removeItem("user");
  }

  // Clear all auth related data
  clearAllAuthData(): void {
    this.user = null;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    localStorage.removeItem("rememberMe");
    api.signout(); // Also clear token from API service
  }

  // Signout function
  signout(): void {
    this.clearUser();
  }

  // Signup function
  async signup(userData: any): Promise<User> {
    try {
      const response = await api.signup(userData);
      const user = response.user;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Signin function
  async signin(credentials: { email: string; password: string }): Promise<User> {
    try {
      const response = await api.signin(credentials);
      const user = response.user;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error("Signin error:", error);
      throw error;
    }
  }
}

export default new AuthService();