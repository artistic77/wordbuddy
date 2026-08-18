import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { SetsListPage } from './pages/sets/SetsListPage';
import { SetDetailPage } from './pages/sets/SetDetailPage';
import { ExplorePage } from './pages/sets/ExplorePage';
import { FlashcardGamePage } from './pages/study/FlashcardGamePage';
import { SpellingGamePage } from './pages/study/SpellingGamePage';
import { MultipleChoiceGamePage } from './pages/study/MultipleChoiceGamePage';
import { MatchingGamePage } from './pages/study/MatchingGamePage';
import { FillBlankGamePage } from './pages/study/FillBlankGamePage';
import { StudyResultsPage } from './pages/study/StudyResultsPage';
import { PetSanctuaryPage } from './pages/pet/PetSanctuaryPage';
import { PetShopPage } from './pages/pet/PetShopPage';
import { BossBattlePage } from './pages/battle/BossBattlePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { BookOpen, Trophy, Compass, Plus, Play, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import type { VocabSet } from './types';

const queryClient = new QueryClient();

const HomePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [recentSets, setRecentSets] = useState<VocabSet[]>([]);
  const [totalWordsMastered, setTotalWordsMastered] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      // 1. Fetch user sets
      const { data: setsData } = await supabase
        .from('vocab_sets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentSets(setsData || []);

      // 2. Fetch total word entries count
      const { data: entriesData } = await supabase
        .from('vocab_entries')
        .select('id')
        .eq('owner_id', user.id);

      setTotalWordsMastered(entriesData?.length || 0);
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Greeting Card */}
      <Card className="bg-gradient-to-r from-primary-light via-white to-accent-yellow-light border-primary/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="noun" size="sm">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Learning
              </Badge>
              <Badge variant="adj" size="sm">Active</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-outfit font-bold text-text-primary tracking-tight">
              {user
                ? `Good day, ${profile?.display_name || user.email?.split('@')[0]}! 🌟`
                : 'Welcome to Word Buddy! 🦉'}
            </h1>
            <p className="text-text-secondary max-w-xl text-base">
              Learn English vocabulary faster with AI-powered Thai translations, instant grammar cues, and fun training games.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/sets">
                <Button variant="primary" size="md">
                  <Plus className="w-4 h-4 mr-1" />
                  My Vocab Sets
                </Button>
              </Link>
            ) : (
              <Link to="/auth/register">
                <Button variant="primary" size="md">
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Words Collected
            </p>
            <p className="text-2xl font-outfit font-bold text-text-primary">
              {totalWordsMastered}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Day Streak
            </p>
            <p className="text-2xl font-outfit font-bold text-text-primary">🔥 1 Day</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Vocab Sets
            </p>
            <p className="text-2xl font-outfit font-bold text-text-primary">
              {recentSets.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Continue Studying Section */}
      {user && recentSets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-outfit font-bold text-text-primary">Continue Studying</h2>
            <Link to="/sets" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View all ({recentSets.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentSets.map((set) => (
              <Link key={set.id} to={`/sets/${set.id}`} className="block group">
                <Card hoverEffect className="p-5 flex flex-col justify-between h-36">
                  <div>
                    <h3 className="font-outfit font-bold text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {set.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-1 mt-1">
                      {set.description || 'Vocabulary study set'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-primary">Open Deck →</span>
                    <Button variant="primary" size="sm" className="h-7 px-2.5 text-xs">
                      <Play className="w-3 h-3 fill-current mr-1" /> Study
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h3 className="text-lg font-outfit font-bold text-text-primary">📚 My Vocabulary Decks</h3>
          <p className="text-sm text-text-secondary">
            Organize words by unit or theme. Use AI translation, add example sentences, and test yourself.
          </p>
          <Link to="/sets" className="inline-block pt-2">
            <Button variant="secondary" size="sm">Go to My Sets →</Button>
          </Link>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-outfit font-bold text-text-primary">✨ Explore Community Sets</h3>
          <p className="text-sm text-text-secondary">
            Browse public decks shared by teachers and fellow students. Copy sets to your library in 1 click.
          </p>
          <Link to="/explore" className="inline-block pt-2">
            <Button variant="secondary" size="sm">Explore Public Sets →</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected User Routes */}
                <Route
                  path="/sets"
                  element={
                    <ProtectedRoute>
                      <SetsListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sets/:id"
                  element={
                    <ProtectedRoute>
                      <SetDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sets/:id/study/flashcard"
                  element={
                    <ProtectedRoute>
                      <FlashcardGamePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sets/:id/study/spelling"
                  element={
                    <ProtectedRoute>
                      <SpellingGamePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sets/:id/study/multiple_choice"
                  element={
                    <ProtectedRoute>
                      <MultipleChoiceGamePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sets/:id/study/matching"
                  element={
                    <ProtectedRoute>
                      <MatchingGamePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sets/:id/study/fill_blank"
                  element={
                    <ProtectedRoute>
                      <FillBlankGamePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study/results"
                  element={
                    <ProtectedRoute>
                      <StudyResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <ProtectedRoute>
                      <ExplorePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pet"
                  element={
                    <ProtectedRoute>
                      <PetSanctuaryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ProtectedRoute>
                      <PetShopPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/battle"
                  element={
                    <ProtectedRoute>
                      <BossBattlePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <AdminRoute>
                      <AdminUserDetailPage />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
