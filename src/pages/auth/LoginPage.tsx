import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { liffService } from '../../services/liffService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { signInWithPassword, signInWithGoogle, signInWithLine } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLineSignIn = async () => {
    setErrorMessage(null);
    setIsLineLoading(true);
    try {
      if (liffService.isConfigured()) {
        await liffService.init();
        if (liffService.isLoggedIn()) {
          const profile = await liffService.getProfile();
          if (profile) {
            const { error } = await signInWithLine(profile);
            if (error) {
              setErrorMessage(error.message);
            } else {
              navigate(from, { replace: true });
            }
          }
        } else {
          liffService.login();
        }
      } else {
        // Mock profile fallback when VITE_LIFF_ID is not yet configured in local development
        const mockProfile = liffService.createMockProfile();
        const { error } = await signInWithLine(mockProfile);
        if (error) {
          setErrorMessage(error.message);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with LINE.';
      setErrorMessage(msg);
    } finally {
      setIsLineLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-surface via-primary-light/30 to-surface">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-8 sm:p-10 shadow-card border-primary/10">
          {/* Header & Owl Mascot */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-light/70 p-2 flex items-center justify-center shadow-inner">
              <img src="/owl-icon.svg" alt="Word Buddy Owl" className="w-16 h-16 animate-bounce-subtle" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-primary tracking-tight">
                Word Buddy
              </h1>
              <p className="text-sm font-medium text-text-secondary mt-1">
                Learn words. Level up.
              </p>
            </div>
          </div>

          <hr className="my-6 border-border" />

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-secondary-light border border-secondary/20 flex items-start gap-2.5 text-secondary text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-text-primary">Password</label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-secondary hover:text-text-primary focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-text-secondary font-medium">or continue with</span>
            </div>
          </div>

          {/* Social OAuth Buttons */}
          <div className="space-y-2.5">
            {/* LINE Login Button */}
            <button
              type="button"
              onClick={handleLineSignIn}
              disabled={isLineLoading}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-btn bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLineLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.578.39.085.922.26 1.057.601.121.306.079.784.039 1.093l-.169 1.018c-.052.311-.247 1.218 1.066.664 1.314-.555 7.098-4.227 9.689-7.234 1.579-1.748 2.299-3.528 2.299-5.642z" />
                </svg>
              )}
              <span>{isLineLoading ? 'Connecting LINE...' : 'Continue with LINE'}</span>
            </button>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-btn border border-border bg-white text-text-primary font-semibold text-sm hover:bg-surface hover:border-gray-300 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-primary hover:text-primary-hover hover:underline"
            >
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
