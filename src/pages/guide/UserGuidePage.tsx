import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Volume2,
  Layers,
  ArrowLeft,
  Play,
  Trophy,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type GuideSection = 'all' | 'start' | 'study' | 'pet' | 'battle' | 'shop';

export const UserGuidePage: React.FC = () => {
  const [filter, setFilter] = useState<GuideSection>('all');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sarabun">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าแรก (Home)
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary tracking-tight">
              📖 คู่มือการใช้งาน Word Buddy
            </h1>
            <Badge variant="noun" size="md">
              User Guide
            </Badge>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            สรุปฟีเจอร์เด่นและขั้นตอนการใช้งานทั้งหมดแบบกระชับ เข้าใจง่าย พร้อมเริ่มสนุกกับการท่องศัพท์!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/sets">
            <Button variant="primary" size="md">
              <Play className="w-4 h-4 mr-1.5 fill-current" /> เริ่มต้นฝึกคำศัพท์
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border no-scrollbar">
        {[
          { id: 'all', label: 'ทั้งหมด (All)' },
          { id: 'start', label: '🚀 1. เริ่มต้นใช้งาน' },
          { id: 'study', label: '🎮 2. 5 โหมดฝึกฝน' },
          { id: 'pet', label: '🐾 3. สัตว์เลี้ยง & กีฬา' },
          { id: 'battle', label: '⚔️ 4. สังเวียนบอส' },
          { id: 'shop', label: '🛍️ 5. ร้านค้า & ภารกิจ' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as GuideSection)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-text-secondary border border-border hover:border-primary/40 hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Getting Started */}
      {(filter === 'all' || filter === 'start') && (
        <Card className="space-y-4 border-primary/20">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚀</span>
              <div>
                <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
                  1. เริ่มต้นสร้างและจัดการชุดคำศัพท์ (Vocab Sets)
                </h2>
                <p className="text-xs text-text-secondary">
                  วิธีสร้างชุดคำศัพท์ นำเข้าคำศัพท์ และใช้ AI อัจฉริยะช่วยเติมข้อมูล
                </p>
              </div>
            </div>
            <Link to="/sets" className="text-xs font-semibold text-primary hover:underline hidden sm:block">
              ไปที่ My Sets →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-2">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> สร้างชุดคำศัพท์ใหม่ (Create Set)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                เข้าเมนู <strong>"My Sets"</strong> และคลิก <strong>"+ New Set"</strong> ตั้งชื่อชุดคำศัพท์ เช่น <em>"TOEIC Essentials"</em>, <em>"Daily Verbs"</em> หรือเลือกนำเข้าคำศัพท์จากระบบ Master Pool 1,050 คำที่แบ่งระดับตามความยากง่าย
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-2">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-yellow" /> AI เติมข้อมูลอัตโนมัติ & OCR สแกนภาพ
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                เพียงพิมพ์คำศัพท์ภาษาอังกฤษ ระบบ AI จะช่วยดึงคำแปลไทย คำอ่านสัทศาสตร์ ชนิดของคำ และตัวอย่างประโยคให้อัตโนมัติ หรือใช้ปุ่มสแกน OCR เพื่อถ่ายภาพเอกสาร/ชีทเรียนแปลงเป็นคำศัพท์ทันที
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-2">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-secondary" /> เสียงอ่านออกเสียงมาตรฐาน (TTS)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                ทุกคำศัพท์มีปุ่มรูปลำโพง 🔊 กดฟังเสียงออกเสียงภาษาอังกฤษสำเนียงสากลคมชัด สามารถฝึกออกเสียงตามได้อย่างมั่นใจ
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-2">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> ชุมชนแบ่งปัน (Explore Community)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                สามารถเข้าไปเลือกดูชุดคำศัพท์สาธารณะที่ผู้อื่นแชร์ไว้ และกด <strong>"Clone to My Sets"</strong> เพื่อเพิ่มลงในบัญชีของคุณได้ทันที
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 2: 5 Study Modes */}
      {(filter === 'all' || filter === 'study') && (
        <Card className="space-y-4 border-indigo-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎮</span>
              <div>
                <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
                  2. สนุกกับ 5 โหมดฝึกฝนคำศัพท์ (Study Modes)
                </h2>
                <p className="text-xs text-text-secondary">
                  เลือกโหมดการเรียนรู้ที่เหมาะกับสไตล์ของคุณเพื่อความจำที่แม่นยำและไม่น่าเบื่อ
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                <span>🃏</span> 1. แฟลชการ์ด (Flashcards)
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                คลิกเพื่อพลิกการ์ดสลับคำศัพท์และคำแปล พร้อมมีปุ่มกดฟังเสียง เหมาะกับการท่องจำเป็นรอบๆ
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <span>✍️</span> 2. สะกดคำ (Spelling)
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                ฟังเสียงอ่านและดูความหมาย แล้วพิมพ์สะกดคำศัพท์ภาษาอังกฤษให้ถูกต้อง มีคำใบ้ช่วยเมื่อติดขัด
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-800 text-sm">
                <span>🔘</span> 3. เลือกตอบ (Multiple Choice)
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                ควิซ 4 ตัวเลือก ประลองความไวและความแม่นยำ ตอบถูกสะสมคะแนนต่อเนื่อง
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <span>🧩</span> 4. จับคู่คำศัพท์ (Matching)
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                คลิกจับคู่การ์ดคำศัพท์ภาษาอังกฤษกับการ์ดคำแปลภาษาไทย แข่งกับเวลาเพื่อชิงเหรียญทอง
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <span>📝</span> 5. เติมคำในช่องว่าง (Fill Blank)
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                อ่านประโยคตัวอย่างแล้วพิมพ์หรือเลือกคำศัพท์ที่ถูกต้องมาเติมลงในช่องว่างตามบริบท
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-primary-light/20 flex flex-col justify-center items-center text-center p-4">
              <Trophy className="w-7 h-7 text-primary mb-1" />
              <p className="text-xs font-bold text-primary">รับเหรียญ 🪙 & EXP ทุกครั้งที่เล่นจบ!</p>
              <p className="text-[11px] text-text-muted mt-1">
                ผลคะแนนจะถูกบันทึกเพื่อประเมินระดับความแม่นยำของคุณ
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 3: Pet & Sports Arcade */}
      {(filter === 'all' || filter === 'pet') && (
        <Card className="space-y-4 border-emerald-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🐾</span>
              <div>
                <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
                  3. สัตว์เลี้ยงคู่หู (Tamagotchi) & มินิเกมกีฬาอาเขต
                </h2>
                <p className="text-xs text-text-secondary">
                  ดูแลสัตว์เลี้ยง 10 สายพันธุ์ พร้อมฝึกความแม่นยำผ่าน 3 มินิเกมกีฬา
                </p>
              </div>
            </div>
            <Link to="/pet" className="text-xs font-semibold text-emerald-600 hover:underline hidden sm:block">
              ไปที่ Pet Sanctuary →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2">
              <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                ❤️ การดูแลสัตว์เลี้ยง (Tamagotchi System)
              </h3>
              <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
                <li><strong>ให้อาหาร (Feed):</strong> ใช้อาหารที่ซื้อจาก Shop เพื่อเพิ่มความอิ่ม (Hunger) และ EXP</li>
                <li><strong>ลูบหัว (Petting):</strong> คลิกสัมผัสตัวสัตว์เลี้ยงเพื่อเพิ่มค่าความสุข (Happiness)</li>
                <li><strong>สเตตัส 4 สาย:</strong> STR (พลังโจมตี), AGI (ความว่องไว), INT (สติปัญญา), BURST (เกจอัลติ)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
              <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                🏅 3 มินิเกมกีฬาอาเขต (Pure Sports Arcade)
              </h3>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <p>🏀 <strong>Basketball Shootout:</strong> กะจังหวะเกจให้อยู่จุดกึ่งกลางเพื่อชู้ต 3 แต้ม</p>
                <p>🎯 <strong>Precision Darts:</strong> ปาลูกดอกให้เข้ากลางเป้า Bullseye 50 แต้ม</p>
                <p>⚽ <strong>Penalty Soccer:</strong> เลือกมุมยิง 4 ทิศทางหลบผู้รักษาประตูสไลม์</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 4: Boss Battle */}
      {(filter === 'all' || filter === 'battle') && (
        <Card className="space-y-4 border-red-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚔️</span>
              <div>
                <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
                  4. สังเวียนประลองบอส 5 ด่าน (Boss Battle Arena)
                </h2>
                <p className="text-xs text-text-secondary">
                  ดวลตอบคำถามคำศัพท์แบบเทิร์นเบส โค่นบอสประจำด่าน
                </p>
              </div>
            </div>
            <Link to="/battle" className="text-xs font-semibold text-red-600 hover:underline hidden sm:block">
              ไปที่ Boss Arena →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-red-50/30 border border-red-100 space-y-2">
              <h3 className="font-bold text-sm text-red-900">🛡️ ระบบต่อสู้</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                ตอบคำศัพท์ถูกต้องเพื่อสร้างดาเมจใส่บอส หากตอบผิดหรือหมดเวลา บอสจะโจมตีสวนกลับทันที
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 space-y-2">
              <h3 className="font-bold text-sm text-amber-900">🔥 Ultimate Burst (x3)</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                ตอบถูกต่อเนื่อง 3 ข้อเพื่อปลดล็อกคอมโบ <strong>Ultimate Burst</strong> ปล่อยดาเมจรุนแรงขึ้น 3 เท่า!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-2">
              <h3 className="font-bold text-sm text-purple-900">👑 พิชิต 5 บอส</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Goblin Grunt ➔ Frost Yeti ➔ Magma Golem ➔ Shadow Wyrm ➔ Void Overlord
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 5: Shop & Missions */}
      {(filter === 'all' || filter === 'shop') && (
        <Card className="space-y-4 border-amber-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛍️</span>
              <div>
                <h2 className="text-lg sm:text-xl font-outfit font-bold text-text-primary">
                  5. ร้านค้า แฟชั่น & ภารกิจรายวัน (Shop & Missions)
                </h2>
                <p className="text-xs text-text-secondary">
                  ซื้อไอเทมแต่งตัวเพิ่มสเตตัส และเคลียร์ภารกิจรับเหรียญทอง
                </p>
              </div>
            </div>
            <Link to="/shop" className="text-xs font-semibold text-amber-700 hover:underline hidden sm:block">
              ไปที่ Shop →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
              <h3 className="font-bold text-sm text-amber-900">
                👓 แว่นตา 20 แบบ & 👗 คอสตูม 20 แบบ
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                เข้าเมนู <strong>"Shop"</strong> เพื่อเลือกซื้อแว่นตาและชุดน่ารักๆ ทุกชิ้นเมื่อสวมใส่ใน <strong>Wardrobe</strong> จะช่วยเพิ่มค่าพลัง STR, AGI หรือ INT ให้สัตว์เลี้ยงของคุณทันที
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
              <h3 className="font-bold text-sm text-indigo-900">
                🎯 ภารกิจรายวัน (Daily Missions)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                คลิกปุ่ม <strong>"Missions"</strong> บนแถบเมนูด้านบนทุกวันเพื่อรับเควสต์ เช่น ทบทวนคำศัพท์, เล่นเกมกีฬา หรือชนะบอส เพื่อเคลียร์เควสต์รับเหรียญ 🪙 และ EXP สัตว์เลี้ยงฟรี
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Bottom CTA Card */}
      <Card className="bg-gradient-to-r from-primary-light via-white to-accent-yellow-light/40 border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="font-outfit font-bold text-lg text-text-primary">
            พร้อมที่จะเริ่มฝึกฝนคำศัพท์แล้วหรือยัง? 🌟
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            เริ่มต้นสร้างชุดคำศัพท์แรก หรือเข้าไปลองเล่นโหมด Flashcard ได้ทันที
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/sets">
            <Button variant="primary" size="md">
              ไปยังชุดคำศัพท์ของฉัน (My Sets)
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
export default UserGuidePage;
