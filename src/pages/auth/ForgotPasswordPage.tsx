import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to send password reset email.');
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-surface via-primary-light/30 to-surface">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-8 sm:p-10 shadow-card border-primary/10">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center text-primary">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-outfit font-bold text-text-primary tracking-tight">
                Reset Password
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter your email and we will send you a link to reset your password.
              </p>
            </div>
          </div>

          <hr className="my-6 border-border" />

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-secondary-light border border-secondary/20 flex items-start gap-2.5 text-secondary text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-accent-green-light border border-accent-green/20 flex items-start gap-3 text-accent-emerald text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Reset link sent!</p>
                  <p className="mt-1 text-text-secondary">
                    Please check your inbox at <span className="font-medium text-text-primary">{email}</span> for instructions to reset your password.
                  </p>
                </div>
              </div>

              <Link to="/auth/login">
                <Button variant="secondary" size="lg" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Send Reset Link
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
