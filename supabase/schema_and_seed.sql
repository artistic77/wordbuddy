-- ==============================================================================
-- Word Buddy — Complete Schema, Security, Triggers & Starter Seed Data
-- File: supabase/schema_and_seed.sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Word Buddy Learner',
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    line_user_id TEXT UNIQUE,
    line_display_name TEXT,
    line_picture_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Vocab Sets table
CREATE TABLE IF NOT EXISTS public.vocab_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Vocab Entries table
CREATE TABLE IF NOT EXISTS public.vocab_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word_en TEXT NOT NULL,
    word_th TEXT NOT NULL,
    part_of_speech TEXT NOT NULL DEFAULT 'noun' CHECK (part_of_speech IN ('noun', 'verb', 'adj', 'adv', 'other', 'gerund', 'past_participle')),
    example_sentence_en TEXT,
    example_sentence_th TEXT,
    image_url TEXT,
    audio_url TEXT,
    is_mastered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Study Sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('flashcard', 'spelling', 'multiple_choice', 'matching', 'fill_blank')),
    score INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Favorite Vocab Sets table
CREATE TABLE IF NOT EXISTS public.favorite_vocab_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES public.vocab_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_user_vocab_set_favorite UNIQUE (user_id, set_id)
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vocab_sets_owner_id ON public.vocab_sets(owner_id);
CREATE INDEX IF NOT EXISTS idx_vocab_sets_is_public ON public.vocab_sets(is_public);
CREATE INDEX IF NOT EXISTS idx_vocab_entries_set_id ON public.vocab_entries(set_id);
CREATE INDEX IF NOT EXISTS idx_vocab_entries_owner_id ON public.vocab_entries(owner_id);
CREATE INDEX IF NOT EXISTS idx_vocab_entries_is_mastered ON public.vocab_entries(set_id, is_mastered);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_set_id ON public.study_sessions(set_id);
CREATE INDEX IF NOT EXISTS idx_favorite_vocab_sets_user_id ON public.favorite_vocab_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_vocab_sets_set_id ON public.favorite_vocab_sets(set_id);
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON public.profiles(line_user_id);

-- ==============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_vocab_sets_updated_at ON public.vocab_sets;
CREATE TRIGGER trigger_vocab_sets_updated_at
    BEFORE UPDATE ON public.vocab_sets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_vocab_entries_updated_at ON public.vocab_entries;
CREATE TRIGGER trigger_vocab_entries_updated_at
    BEFORE UPDATE ON public.vocab_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile when auth.users signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Word Buddy Learner'),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_vocab_sets ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to avoid conflicts on re-run
DO $$ 
BEGIN
    -- profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins have full update access to profiles" ON public.profiles;
    
    -- vocab_sets
    DROP POLICY IF EXISTS "Users can view own sets or public sets" ON public.vocab_sets;
    DROP POLICY IF EXISTS "Users can insert own sets" ON public.vocab_sets;
    DROP POLICY IF EXISTS "Users can update own sets" ON public.vocab_sets;
    DROP POLICY IF EXISTS "Users can delete own sets" ON public.vocab_sets;
    
    -- vocab_entries
    DROP POLICY IF EXISTS "Users can view entries of visible sets" ON public.vocab_entries;
    DROP POLICY IF EXISTS "Users can insert entries into own sets" ON public.vocab_entries;
    DROP POLICY IF EXISTS "Users can update own entries" ON public.vocab_entries;
    DROP POLICY IF EXISTS "Users can delete own entries" ON public.vocab_entries;
    
    -- study_sessions
    DROP POLICY IF EXISTS "Users can view own study sessions" ON public.study_sessions;
    DROP POLICY IF EXISTS "Users can insert own study sessions" ON public.study_sessions;
    
    -- favorite_vocab_sets
    DROP POLICY IF EXISTS "Users can view own favorite sets" ON public.favorite_vocab_sets;
    DROP POLICY IF EXISTS "Users can add favorites" ON public.favorite_vocab_sets;
    DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorite_vocab_sets;
END $$;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            public.is_admin() OR (
                role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
                is_suspended = (SELECT is_suspended FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Admins have full update access to profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- Vocab Sets Policies
CREATE POLICY "Users can view own sets or public sets"
    ON public.vocab_sets FOR SELECT
    USING (auth.uid() = owner_id OR is_public = true OR public.is_admin());

CREATE POLICY "Users can insert own sets"
    ON public.vocab_sets FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own sets"
    ON public.vocab_sets FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Users can delete own sets"
    ON public.vocab_sets FOR DELETE
    USING (auth.uid() = owner_id OR public.is_admin());

-- Vocab Entries Policies
CREATE POLICY "Users can view entries of visible sets"
    ON public.vocab_entries FOR SELECT
    USING (
        auth.uid() = owner_id OR 
        EXISTS (
            SELECT 1 FROM public.vocab_sets
            WHERE public.vocab_sets.id = public.vocab_entries.set_id
            AND (public.vocab_sets.is_public = true OR public.vocab_sets.owner_id = auth.uid())
        ) OR 
        public.is_admin()
    );

CREATE POLICY "Users can insert entries into own sets"
    ON public.vocab_entries FOR INSERT
    WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (
            SELECT 1 FROM public.vocab_sets
            WHERE public.vocab_sets.id = public.vocab_entries.set_id
            AND public.vocab_sets.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own entries"
    ON public.vocab_entries FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Users can delete own entries"
    ON public.vocab_entries FOR DELETE
    USING (auth.uid() = owner_id OR public.is_admin());

-- Study Sessions Policies
CREATE POLICY "Users can view own study sessions"
    ON public.study_sessions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own study sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Favorite Vocab Sets Policies
CREATE POLICY "Users can view own favorite sets"
    ON public.favorite_vocab_sets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can add favorites"
    ON public.favorite_vocab_sets FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.vocab_sets
            WHERE public.vocab_sets.id = set_id
            AND (public.vocab_sets.is_public = true OR public.vocab_sets.owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can remove own favorites"
    ON public.favorite_vocab_sets FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 6. STARTER SEED DATA (Official Starter Vocab Sets)
-- ==============================================================================

-- 6.1 Create official admin system user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'official@wordbuddy.app',
    '',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Word Buddy Official","role":"admin"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, display_name, avatar_url, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Word Buddy Official',
    'https://api.dicebear.com/7.x/bottts/svg?seed=WordBuddy',
    'admin'
) ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    display_name = 'Word Buddy Official',
    avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=WordBuddy';

-- 6.2 Insert 4 Starter Public Sets
INSERT INTO public.vocab_sets (id, owner_id, title, description, is_public)
VALUES
(
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000001',
    '🐶 Essential Animals & Pets (สัตว์และสัตว์เลี้ยง)',
    'คำศัพท์สัตว์ยอดนิยมสำหรับผู้เริ่มต้น พร้อมประโยคตัวอย่างภาษาอังกฤษและคำแปลภาษาไทย',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111102',
    '00000000-0000-0000-0000-000000000001',
    '🍕 Delicious Food & Drinks (อาหารและเครื่องดื่ม)',
    'คำศัพท์เกี่ยวกับอาหาร เครื่องดื่ม วัตถุดิบ และมื้ออาหารในชีวิตประจำวัน',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111103',
    '00000000-0000-0000-0000-000000000001',
    '✈️ Travel & Daily Life (การเดินทางและชีวิตประจำวัน)',
    'คำศัพท์การเดินทาง ท่องเที่ยว โรงแรม และยานพาหนะที่จำเป็นต้องรู้',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111104',
    '00000000-0000-0000-0000-000000000001',
    '💻 Tech & Modern Work (เทคโนโลยีและการทำงาน)',
    'คำศัพท์อุปกรณ์ดิจิทัล อินเทอร์เน็ต และการทำงานในยุคปัจจุบัน',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_public = TRUE;

-- 6.3 Insert Vocab Entries for Set 1 (Animals)
INSERT INTO public.vocab_entries (set_id, owner_id, word_en, word_th, part_of_speech, example_sentence_en, example_sentence_th)
VALUES
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Cat', 'แมว', 'noun', 'The cat is sleeping peacefully on the sofa.', 'แมวกำลังนอนหลับอย่างสงบอยู่บนโซฟา'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Dog', 'สุนัข', 'noun', 'My dog wags its tail whenever I come home.', 'สุนัขของฉันกระดิกหางทุกครั้งที่ฉันกลับถึงบ้าน'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Elephant', 'ช้าง', 'noun', 'The elephant is the largest land mammal on Earth.', 'ช้างเป็นสัตว์เลี้ยงลูกด้วยนมบนบกที่ใหญ่ที่สุดในโลก'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Tiger', 'เสือ', 'noun', 'The tiger moved quietly through the tall jungle grass.', 'เสือเคลื่อนตัวอย่างเงียบเชียบผ่านทุ่งหญ้าสูงในป่า'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Lion', 'สิงโต', 'noun', 'The lion is often called the king of the jungle.', 'สิงโตมักถูกเรียกว่าเป็นเจ้าป่า'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Dolphin', 'โลมา', 'noun', 'Dolphins are known for their high intelligence and playful behavior.', 'โลมามีชื่อเสียงในเรื่องความฉลาดสูงและนิสัยขี้เล่น'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Penguin', 'เพนกวิน', 'noun', 'Penguins cannot fly in the air, but they swim very fast underwater.', 'เพนกวินบินบนฟ้าไม่ได้ แต่ว่ายน้ำใต้ทะเลได้เร็วมาก'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Panda', 'แพนด้า', 'noun', 'The giant panda eats bamboo for most of its day.', 'แพนด้ายักษ์กินไผ่เป็นอาหารเกือบตลอดทั้งวัน'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Giraffe', 'ยีราฟ', 'noun', 'The giraffe uses its long neck to reach leaves at the top of trees.', 'ยีราฟใช้คอยาวๆ เพื่อเอื้อมกินใบไม้บนยอดไม้'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Rabbit', 'กระต่าย', 'noun', 'The white rabbit hopped across the garden.', 'กระต่ายสีขาวกระโดดข้ามสวน'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Eagle', 'นกอินทรี', 'noun', 'An eagle soared high above the snow-capped mountains.', 'นกอินทรีบินร่อนอยู่สูงเหนือภูเขาที่ปกคลุมด้วยหิมะ'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Whale', 'วาฬ', 'noun', 'The blue whale is the largest animal to ever live on Earth.', 'วาฬสีน้ำเงินเป็นสัตว์ที่ตัวใหญ่ที่สุดที่เคยมีชีวิตอยู่บนโลก'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Bear', 'หมี', 'noun', 'The brown bear caught a fresh fish from the river.', 'หมีสีน้ำตาลจับปลาสดๆ ได้จากแม่น้ำ'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Monkey', 'ลิง', 'noun', 'The monkey swung skillfully from branch to branch.', 'ลิงโหนตัวไปมาระหว่างกิ่งไม้อย่างชำนาญ'),
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Turtle', 'เต่า', 'noun', 'The sea turtle slowly laid its eggs on the warm sandy beach.', 'เต่าทะเลค่อยๆ วางไข่บนหาดทรายอุ่น');

-- 6.4 Insert Vocab Entries for Set 2 (Food & Drinks)
INSERT INTO public.vocab_entries (set_id, owner_id, word_en, word_th, part_of_speech, example_sentence_en, example_sentence_th)
VALUES
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Apple', 'แอปเปิล', 'noun', 'Eating an apple a day provides plenty of vitamins.', 'การกินแอปเปิลวันละหนึ่งผลให้วิตามินมากมาย'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Bread', 'ขนมปัง', 'noun', 'The bakery bakes fresh bread every single morning.', 'ร้านเบเกอรี่อบขนมปังสดใหม่ทุกเช้า'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Coffee', 'กาแฟ', 'noun', 'I like to start my workday with a hot cup of black coffee.', 'ฉันชอบเริ่มต้นวันทำงานด้วยกาแฟดำร้อนๆ หนึ่งแก้ว'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Pizza', 'พิซซ่า', 'noun', 'We ordered a large cheese pizza for movie night.', 'พวกเราสั่งพิซซ่าหน้าชีสถาดใหญ่มาทานในคืนดูหนัง'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Water', 'น้ำดื่ม', 'noun', 'Drinking enough water throughout the day is essential for good health.', 'การดื่มน้ำให้เพียงพอตลอดทั้งวันเป็นสิ่งจำเป็นต่อสุขภาพที่ดี'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Rice', 'ข้าว', 'noun', 'Jasmine rice is a staple food in many Southeast Asian countries.', 'ข้าวหอมมะลิเป็นอาหารหลักในหลายประเทศแถบเอเชียตะวันออกเฉียงใต้'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Salad', 'สลัด', 'noun', 'A crisp green salad is a refreshing side dish.', 'สลัดผักใบเขียวกรอบๆ เป็นเครื่องเคียงที่เพิ่มความสดชื่น'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Soup', 'ซุป', 'noun', 'Hot chicken noodle soup feels soothing when you have a cold.', 'ซุปไก่เส้นร้อนๆ ทำให้รู้สึกสบายตัวขึ้นเมื่อเป็นหวัด'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Cheese', 'ชีส', 'noun', 'Cheddar cheese has a rich and savory flavor.', 'เชดดาร์ชีสมีรสชาติเข้มข้นและกลมกล่อม'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Chocolate', 'ช็อกโกแลต', 'noun', 'Dark chocolate is rich in antioxidants and has a deep taste.', 'ดาร์กช็อกโกแลตอุดมด้วยสารต้านอนุมูลอิสระและมีรสชาติเข้มลึก'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Delicious', 'อร่อย', 'adj', 'This homemade curry is incredibly delicious and spicy.', 'แกงทำเองหม้อนี้รสชาติอร่อยและเผ็ดถึงใจมาก'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Sweet', 'หวาน', 'adj', 'Ripe mangoes are naturally sweet and juicy.', 'มะม่วงสุกหวานฉ่ำตามธรรมชาติ'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Bake', 'อบ', 'verb', 'She loves to bake chocolate chip cookies on weekends.', 'เธอชอบอบคุกกี้ช็อกโกแลตชิปในวันหยุดสุดสัปดาห์'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Cook', 'ทำอาหาร', 'verb', 'They gathered in the spacious kitchen to cook dinner together.', 'พวกเขามารวมตัวกันในครัวกว้างเพื่อทำอาหารเย็นด้วยกัน'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Fruit', 'ผลไม้', 'noun', 'Fresh seasonal fruit is served after every meal.', 'ผลไม้สดตามฤดูกาลจะถูกเสิร์ฟหลังอาหารทุกมื้อ');

-- 6.5 Insert Vocab Entries for Set 3 (Travel & Daily Life)
INSERT INTO public.vocab_entries (set_id, owner_id, word_en, word_th, part_of_speech, example_sentence_en, example_sentence_th)
VALUES
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Airport', 'สนามบิน', 'noun', 'We arrived at the airport two hours before international departure.', 'พวกเราไปถึงสนามบินก่อนเวลาเที่ยวบินระหว่างประเทศสองชั่วโมง'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Passport', 'หนังสือเดินทาง', 'noun', 'Keep your passport in a safe zippered pocket while traveling.', 'เก็บหนังสือเดินทางของคุณไว้ในกระเป๋าที่มีซิปแน่นหนาขณะเดินทาง'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Hotel', 'โรงแรม', 'noun', 'Our seaside hotel offers a stunning panoramic view of the ocean.', 'โรงแรมริมทะเลของเรามองเห็นวิวพาโนรามาที่สวยงามของมหาสมุทร'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Ticket', 'ตั๋ว', 'noun', 'Please display your electronic train ticket to the inspector.', 'กรุณาแสดงตั๋วรถไฟอิเล็กทรอนิกส์ต่อนายตรวจ'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Luggage', 'สัมภาระ', 'noun', 'The airline staff helped us weigh our heavy luggage.', 'เจ้าหน้าที่สายการบินช่วยพวกเราชั่งน้ำหนักสัมภาระใบใหญ่'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Train', 'รถไฟ', 'noun', 'The high-speed bullet train travels smoothly across the countryside.', 'รถไฟความเร็วสูงวิ่งอย่างราบรื่นผ่านชนบท'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Journey', 'การเดินทาง', 'noun', 'The scenic road journey through the Alps was unforgettable.', 'การเดินทางผ่านเส้นทางทิวทัศน์เทือกเขาแอลป์เป็นสิ่งที่ยากจะลืม'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Explore', 'สำรวจ', 'verb', 'We woke up early to explore the vibrant ancient temple city.', 'พวกเราตื่นเช้าเพื่อออกไปสำรวจเมืองวัดโบราณที่เปี่ยมด้วยชีวิตชีวา'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Visit', 'เยี่ยมชม', 'verb', 'Millions of curious tourists visit the national museum each year.', 'นักท่องเที่ยวผู้ใฝ่รู้หลายล้านคนเดินทางมาเยี่ยมชมพิพิธภัณฑ์แห่งชาติในแต่ละปี'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Map', 'แผนที่', 'noun', 'We downloaded an offline digital map before hiking in the forest.', 'พวกเราดาวน์โหลดแผนที่ดิจิทัลแบบออฟไลน์ก่อนเริ่มเดินป่า'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Destination', 'จุดหมายปลายทาง', 'noun', 'Bangkok is a world-renowned destination for street food lovers.', 'กรุงเทพฯ เป็นจุดหมายปลายทางระดับโลกสำหรับคนรักสตรีทฟู้ด'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Flight', 'เที่ยวบิน', 'noun', 'Our direct flight was delayed due to heavy thunderstorm weather.', 'เที่ยวบินตรงของเราล่าช้าเนื่องจากสภาพอากาศพายุฝนฟ้าคะนอง'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Souvenir', 'ของที่ระลึก', 'noun', 'She bought handcrafted ceramic mugs as a souvenir from Japan.', 'เธอซื้อแก้วเซรามิกทำมือเป็นของที่ระลึกจากญี่ปุ่น'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Arrival', 'การมาถึง', 'noun', 'Check the flight arrival display board for gate details.', 'ตรวจสอบบอร์ดแสดงเวลาเครื่องลงจอดเพื่อดูข้อมูลประตูทางออก'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'Departure', 'การออกเดินทาง', 'noun', 'Passengers should clear security 45 minutes prior to departure.', 'ผู้โดยสารควรผ่านจุดตรวจความปลอดภัย 45 นาทีก่อนเวลาเครื่องออก');

-- 6.6 Insert Vocab Entries for Set 4 (Tech & Modern Work)
INSERT INTO public.vocab_entries (set_id, owner_id, word_en, word_th, part_of_speech, example_sentence_en, example_sentence_th)
VALUES
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Computer', 'คอมพิวเตอร์', 'noun', 'Modern computers can process billions of complex instructions per second.', 'คอมพิวเตอร์สมัยใหม่สามารถประมวลผลคำสั่งที่ซับซ้อนได้หลายพันล้านคำสั่งต่อวินาที'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Internet', 'อินเทอร์เน็ต', 'noun', 'High-speed internet enables instant global communication and remote work.', 'อินเทอร์เน็ตความเร็วสูงช่วยให้สื่อสารทั่วโลกและทำงานจากระยะไกลได้ทันที'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Software', 'ซอฟต์แวร์', 'noun', 'The engineering team released a new software update with better security.', 'ทีมวิศวกรได้ปล่อยอัปเดตซอฟต์แวร์ใหม่ที่เพิ่มความปลอดภัยยิ่งขึ้น'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Password', 'รหัสผ่าน', 'noun', 'Use a strong password combining letters, numbers, and symbols.', 'จงใช้รหัสผ่านที่รัดกุมโดยผสมตัวอักษร ตัวเลข และสัญลักษณ์'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Keyboard', 'แป้นพิมพ์', 'noun', 'A mechanical keyboard provides tactile feedback when typing code.', 'คีย์บอร์ดแบบกลไกให้สัมผัสตอบสนองที่ดีเยี่ยมเวลาพิมพ์โค้ด'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Screen', 'หน้าจอ', 'noun', 'Adjust your screen brightness to reduce eye strain during late nights.', 'ปรับความสว่างของหน้าจอเพื่อลดความเมื่อยล้าของสายตาในเวลากลางคืน'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Website', 'เว็บไซต์', 'noun', 'The responsive website adapts smoothly to all mobile screen sizes.', 'เว็บไซต์ที่ตอบสนองได้ดีจะปรับให้เข้ากับทุกขนาดหน้าจอมือถือได้อย่างราบรื่น'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Develop', 'พัฒนา', 'verb', 'Software engineers develop web applications to solve everyday problems.', 'วิศวกรซอฟต์แวร์พัฒนาเว็บแอปพลิเคชันเพื่อแก้ปัญหาในชีวิตประจำวัน'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Connect', 'เชื่อมต่อ', 'verb', 'Ensure your device connects securely to the company Wi-Fi network.', 'ตรวจสอบให้แน่ใจว่าอุปกรณ์ของคุณเชื่อมต่อกับเครือข่าย Wi-Fi ของบริษัทอย่างปลอดภัย'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Download', 'ดาวน์โหลด', 'verb', 'You can download the practice offline audio files for free.', 'คุณสามารถดาวน์โหลดไฟล์เสียงสำหรับฝึกฝนแบบออฟไลน์ได้ฟรี'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Database', 'ฐานข้อมูล', 'noun', 'The relational database securely stores all vocabulary cards and user stats.', 'ฐานข้อมูลเชิงสัมพันธ์จัดเก็บการ์ดคำศัพท์และสถิติของผู้ใช้อย่างปลอดภัย'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Application', 'แอปพลิเคชัน', 'noun', 'The language learning application makes studying new words addictive and fun.', 'แอปพลิเคชันเรียนภาษาช่วยให้การเรียนคำศัพท์ใหม่เป็นเรื่องสนุกและน่าติดตาม'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Digital', 'ดิจิทัล', 'adj', 'Digital transformation continues to reshape education globally.', 'การเปลี่ยนผ่านสู่ดิจิทัลยังคงปรับเปลี่ยนรูปแบบการศึกษาทั่วโลกอย่างต่อเนื่อง'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Security', 'ความปลอดภัย', 'noun', 'Two-factor authentication adds an essential layer of account security.', 'การยืนยันตัวตนสองขั้นตอนช่วยเพิ่มระดับความปลอดภัยที่สำคัญให้บัญชี'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Efficient', 'มีประสิทธิภาพ', 'adj', 'Spaced repetition flashcards are an efficient way to memorize vocabulary.', 'การใช้แฟลชการ์ดแบบเว้นระยะทบทวนเป็นวิธีที่มีประสิทธิภาพในการจำคำศัพท์');

