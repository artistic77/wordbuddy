import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ShieldCheck, LogOut, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user, profile, isAdmin, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile(displayName.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to update profile.');
    } else {
      setSuccessMessage('Profile updated successfully!');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-text-primary tracking-tight">
            Account Profile
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your personal details and account preferences.
          </p>
        </div>
        <Button variant="danger" size="md" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-outfit font-bold text-2xl shadow-inner">
            {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-outfit font-bold text-text-primary">
                {profile?.display_name || 'Word Buddy Learner'}
              </h2>
              {isAdmin ? (
                <Badge variant="admin" size="sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="user" size="sm">
                  Learner
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-0.5">{user?.email}</p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-secondary-light border border-secondary/20 flex items-start gap-2.5 text-secondary text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-accent-green-light border border-accent-green/20 flex items-start gap-2.5 text-accent-emerald text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleUpdate} className="space-y-5">
          <Input
            label="Display Name / Nickname"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            helperText="This name will appear on your public vocabulary sets and study leaderboards."
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={user?.email || ''}
            leftIcon={<Mail className="w-4 h-4" />}
            disabled
            helperText="Email cannot be changed directly."
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Info / Role Card */}
      <Card className="bg-surface border-border">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-base">Account Security & Role</h3>
            <p className="text-sm text-text-secondary mt-1">
              Your account is authenticated with Supabase. Role-based security policies (RLS) ensure that your personal vocabulary sets remain private to you unless explicitly shared.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
