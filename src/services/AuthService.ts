import { fetchWithoutToken } from "./ServerService";
import { logger } from "../utils/logger";

export interface AdminUser {
    username: string;
    role: string;
}

class AuthService {
    private isAuthenticated: boolean = false;
    private currentUser: AdminUser | null = null;

    /**
     * Check if admin is currently logged in
     */
    async checkSession(): Promise<boolean> {
        try {
            const response = await fetchWithoutToken('/auth/session');

            if (response && response.success && response.data.authenticated) {
                this.isAuthenticated = true;
                this.currentUser = {
                    username: response.data.username,
                    role: 'admin'
                };
                return true;
            } else {
                this.isAuthenticated = false;
                this.currentUser = null;
                return false;
            }
        } catch (error) {
            logger.error('Session check failed:', error);
            this.isAuthenticated = false;
            this.currentUser = null;
            return false;
        }
    }

    /**
     * Look up applicant by email, optionally verify with form number
     */
    async lookupApplicant(email: string, formNumber?: string): Promise<{
        success: boolean;
        redirect?: 'admin';
        found?: boolean;
        verified?: boolean;
        formNumber?: string;
        firstName?: string;
        error?: string;
    }> {
        try {
            const body: any = { email };
            if (formNumber) body.formNumber = formNumber;

            const response = await fetchWithoutToken('/auth/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response && response.success) {
                return { success: true, ...response.data };
            } else {
                return { success: false, error: response?.error || 'Lookup failed' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Network error' };
        }
    }

    /**
     * Login with username and password — returns step:'otp' if credentials valid
     */
    async login(username: string, password: string): Promise<{ success: boolean; step?: string; error?: string }> {
        try {
            const response = await fetchWithoutToken('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response && response.success) {
                if (response.data.step === 'otp') {
                    return { success: true, step: 'otp' };
                }
                this.isAuthenticated = true;
                this.currentUser = {
                    username: response.data.username,
                    role: response.data.role
                };
                return { success: true };
            } else {
                return {
                    success: false,
                    error: response?.error || 'Login failed'
                };
            }
        } catch (error: any) {
            logger.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * Submit OTP for 2FA verification
     */
    async verifyOtp(otp: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetchWithoutToken('/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }),
            });

            if (response && response.success) {
                this.isAuthenticated = true;
                this.currentUser = {
                    username: response.data.username,
                    role: response.data.role
                };
                return { success: true };
            } else {
                return { success: false, error: response?.error || 'Invalid verification code' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Network error' };
        }
    }

    /**
     * Logout current admin
     */
    async logout(): Promise<void> {
        try {
            await fetchWithoutToken('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            logger.error('Logout error:', error);
        } finally {
            this.isAuthenticated = false;
            this.currentUser = null;
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser(): AdminUser | null {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated (synchronous)
     */
    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }
}

// Export singleton instance
export const authService = new AuthService();
