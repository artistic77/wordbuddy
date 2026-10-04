import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
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
import { UserGuidePage } from './pages/guide/UserGuidePage';
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
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoadingStats(false);
      return;
    }
    const fetchUserData = async () => {
      setIsLoadingStats(true);
      try {
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
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Hero / Greeting Card */}
      <Card className="bg-gradient-to-r from-primary-light via-white to-amber-50/50 border-primary/20 relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="noun" size="sm">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                เรียนรู้ด้วย AI
              </Badge>
              <Badge variant="adj" size="sm">พร้อมใช้งาน</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-outfit font-bold text-text-primary tracking-tight">
              {user ? (
                <span>สวัสดี {profile?.display_name || user.email?.split('@')[0]}! 🌟</span>
              ) : (
                <span>ยินดีต้อนรับสู่ Word Buddy! 🦉</span>
              )}
            </h1>
            <p className="text-text-secondary max-w-xl text-sm sm:text-base leading-relaxed">
              ฝึกฝนคำศัพท์ภาษาอังกฤษได้เร็วกว่าเดิม ด้วยคำแปลไทย ตัวอย่างประโยค มินิเกม และระบบ AI ช่วยสร้างคำศัพท์
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            {user ? (
              <Link to="/sets" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="w-4 h-4 mr-1.5" />
                  ชุดคำศัพท์ของฉัน
                </Button>
              </Link>
            ) : (
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto min-h-[44px]">
                  เริ่มใช้งานฟรี
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid: 3 equal-height compact cards */}
      <div className="grid grid-cols-3 gap-3 items-stretch">
        <Card className="p-3 sm:p-4 flex flex-col items-center justify-center text-center rounded-xl bg-white border border-border shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary mb-1.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-outfit font-bold text-text-primary min-h-[28px] flex items-center justify-center">
            {isLoadingStats ? (
              <div className="h-6 w-8 bg-neutral-200 animate-pulse rounded" />
            ) : (
              totalWordsMastered
            )}
          </div>
          <span className="text-[12px] text-text-muted mt-0.5 truncate max-w-full">
            คำศัพท์สะสม
          </span>
        </Card>

        <Card className="p-3 sm:p-4 flex flex-col items-center justify-center text-center rounded-xl bg-white border border-border shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mb-1.5">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-outfit font-bold text-text-primary min-h-[28px] flex items-center justify-center">
            {isLoadingStats ? (
              <div className="h-6 w-12 bg-neutral-200 animate-pulse rounded" />
            ) : (
              '🔥 1 วัน'
            )}
          </div>
          <span className="text-[12px] text-text-muted mt-0.5 truncate max-w-full">
            ความต่อเนื่อง
          </span>
        </Card>

        <Card className="p-3 sm:p-4 flex flex-col items-center justify-center text-center rounded-xl bg-white border border-border shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-1.5">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-outfit font-bold text-text-primary min-h-[28px] flex items-center justify-center">
            {isLoadingStats ? (
              <div className="h-6 w-8 bg-neutral-200 animate-pulse rounded" />
            ) : (
              recentSets.length
            )}
          </div>
          <span className="text-[12px] text-text-muted mt-0.5 truncate max-w-full">
            ชุดคำศัพท์
          </span>
        </Card>
      </div>

      {/* Empty State when Words Collected = 0 */}
      {user && !isLoadingStats && totalWordsMastered === 0 && (
        <Card className="p-6 sm:p-8 text-center bg-gradient-to-b from-primary-light/30 to-white border border-primary/20 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-2xl shadow-xs">
            🦉
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-outfit font-bold text-base sm:text-lg text-text-primary">
              ยังไม่มีคำศัพท์ที่บันทึกไว้
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              เริ่มต้นสะสมคลังคำศัพท์ภาษาอังกฤษของคุณวันนี้ เพื่อฝึกฝนและพัฒนาทักษะได้เร็วยิ่งขึ้น
            </p>
          </div>
          <Link to="/sets" className="pt-2">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              สร้างหรือเลือกชุดคำศัพท์แรก
            </Button>
          </Link>
        </Card>
      )}

      {/* Continue Studying Section */}
      {user && recentSets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-outfit font-bold text-text-primary">เรียนรู้ต่อจากเดิม</h2>
            <Link to="/sets" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              ดูทั้งหมด ({recentSets.length}) <ArrowRight className="w-3.5 h-3.5" />
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
                      {set.description || 'ชุดคำศัพท์สำหรับฝึกฝน'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-primary">เปิดชุดคำศัพท์ →</span>
                    <Button variant="primary" size="sm" className="h-7 min-h-[36px] px-2.5 text-xs">
                      <Play className="w-3 h-3 fill-current mr-1" /> ฝึกฝน
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <h3 className="text-lg font-outfit font-bold text-text-primary">📚 ชุดคำศัพท์ของฉัน</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            จัดหมวดหมู่คำศัพท์ตามบทเรียน แปลด้วยระบบ AI อัจฉริยะ เพิ่มตัวอย่างประโยค และทดสอบความจำ
          </p>
          <Link to="/sets" className="inline-block pt-2">
            <Button variant="secondary" size="sm">ไปยังชุดคำศัพท์ของฉัน →</Button>
          </Link>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-outfit font-bold text-text-primary">✨ สำรวจคลังคำศัพท์สาธารณะ</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            เลือกดูชุดคำศัพท์ที่เพื่อนๆ และคุณครูแชร์ไว้ คัดลอกเข้าคลังส่วนตัวเพื่อฝึกฝนได้ทันที
          </p>
          <Link to="/explore" className="inline-block pt-2">
            <Button variant="secondary" size="sm">สำรวจชุดคำศัพท์สาธารณะ →</Button>
          </Link>
        </Card>

        <Card className="space-y-3 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-amber-200/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h3 className="text-lg font-outfit font-bold text-text-primary">คู่มือการใช้งาน</h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            วิธีสร้างชุดคำศัพท์, เล่น 5 โหมดฝึกฝน, เลี้ยงดูสัตว์เลี้ยง, มินิเกมกีฬา และสู้บอสแบบสรุปกระชับ
          </p>
          <Link to="/guide" className="inline-block pt-2">
            <Button variant="secondary" size="sm" className="border-amber-300 text-amber-900 hover:bg-amber-100">
              อ่านคู่มือการใช้งาน →
            </Button>
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
            <main className="flex-1 pb-16 md:pb-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/guide" element={<UserGuidePage />} />
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
            <BottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
