import liff from '@line/liff';

export interface LineUserProfile {
  userId: string; // LINE UID (e.g. U1234567890abcdef...)
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

const LIFF_ID = import.meta.env.VITE_LIFF_ID || '';
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

export const liffService = {
  /**
   * Check if LIFF ID is provided in environment variables
   */
  isConfigured(): boolean {
    return Boolean(LIFF_ID && LIFF_ID.trim().length > 0);
  },

  /**
   * Initialize LIFF SDK
   */
  async init(): Promise<boolean> {
    if (isInitialized) return true;
    if (initPromise) return initPromise;

    if (!this.isConfigured()) {
      console.warn('LINE LIFF: VITE_LIFF_ID is not configured in .env. Mock mode available for testing.');
      return false;
    }

    initPromise = (async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        isInitialized = true;
        return true;
      } catch (err) {
        console.error('Failed to initialize LINE LIFF SDK:', err);
        return false;
      } finally {
        initPromise = null;
      }
    })();

    return initPromise;
  },

  /**
   * Check if running within the LINE In-App Browser (LIFF Client)
   */
  isInClient(): boolean {
    try {
      return isInitialized && liff.isInClient();
    } catch {
      return false;
    }
  },

  /**
   * Check if user is logged in via LINE
   */
  isLoggedIn(): boolean {
    try {
      return isInitialized && liff.isLoggedIn();
    } catch {
      return false;
    }
  },

  /**
   * Trigger LINE Login redirect
   */
  login(redirectUri?: string): void {
    if (!this.isConfigured()) {
      alert('LINE LIFF ID ยังไม่ได้ถูกตั้งค่าใน .env (กรุณาระบุ VITE_LIFF_ID)');
      return;
    }

    if (!isInitialized) {
      console.warn('LIFF not initialized yet, attempting init then login...');
      this.init().then((success) => {
        if (success && !liff.isLoggedIn()) {
          liff.login({ redirectUri: redirectUri || window.location.href });
        }
      });
      return;
    }

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: redirectUri || window.location.href });
    }
  },

  /**
   * Get current LINE user profile
   */
  async getProfile(): Promise<LineUserProfile | null> {
    if (!isInitialized || !liff.isLoggedIn()) {
      return null;
    }

    try {
      const profile = await liff.getProfile();
      let email: string | undefined;

      try {
        const decoded = liff.getDecodedIDToken();
        email = decoded?.email;
      } catch {
        // Email scope might not be granted or ID token unavailable
      }

      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        email,
      };
    } catch (err) {
      console.error('Failed to retrieve LINE user profile:', err);
      return null;
    }
  },

  /**
   * Logout from LINE
   */
  logout(): void {
    if (isInitialized && liff.isLoggedIn()) {
      liff.logout();
    }
  },

  /**
   * Mock profile generator for development/testing when without LIFF ID
   */
  createMockProfile(): LineUserProfile {
    return {
      userId: `U_mock_${Math.random().toString(36).substring(2, 10)}`,
      displayName: 'LINE Student User',
      pictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      statusMessage: 'Learning vocabulary on Word Buddy!',
    };
  },
};
