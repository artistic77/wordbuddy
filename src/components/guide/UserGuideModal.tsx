import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Volume2,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = 'start' | 'study' | 'pet' | 'battle' | 'shop';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('start');

  if (!isOpen) return null;

  const tabs: { id: GuideTab; label: string; icon: string }[] = [
    { id: 'start', label: 'เริ่มต้นใช้งาน', icon: '🚀' },
    { id: 'study', label: '5 โหมดฝึกฝน', icon: '🎮' },
    { id: 'pet', label: 'สัตว์เลี้ยง & กีฬา', icon: '🐾' },
    { id: 'battle', label: 'สังเวียนบอส', icon: '⚔️' },
    { id: 'shop', label: 'ร้านค้า & ภารกิจ', icon: '🛍️' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl p-0 my-auto max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl relative border-primary/20 bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-border bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary-light flex items-center justify-center text-lg sm:text-xl shadow-sm flex-shrink-0">
              📖
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-outfit font-bold text-text-primary truncate">
                  คู่มือการใช้งาน Word Buddy
                </h2>
                <Badge variant="noun" size="sm" className="hidden xs:inline-flex">
                  Quick Guide
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary font-sarabun line-clamp-1 sm:line-clamp-none">
                เรียนรู้ฟีเจอร์เด่นและวิธีเล่นแบบกระชับ เข้าใจง่ายใน 1 นาที
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-xl bg-surface hover:bg-surface-elevated border border-border transition-all active:scale-95 flex-shrink-0 ml-2"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-slate-50/80 px-3 sm:px-4 pt-2 gap-1 overflow-x-auto touch-pan-x no-scrollbar flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-primary text-primary bg-white shadow-sm'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-white/50'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 min-h-0 font-sarabun text-sm text-text-secondary space-y-4">
          {/* TAB 1: เริ่มต้นใช้งาน */}
          {activeTab === 'start' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-light via-blue-50 to-white border border-primary/20 text-text-primary">
                <h3 className="font-outfit font-bold text-base text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> ยินดีต้อนรับสู่ Word Buddy!
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  แพลตฟอร์มท่องศัพท์ภาษาอังกฤษสไตล์เกม (Gamification) พร้อมระบบ AI ช่วยแปล คำอ่านสัทศาสตร์ และเสียงเจ้าของภาษา
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-surface/50 hover:bg-white transition-all space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-text-primary text-sm">
                    <BookOpen className="w-4 h-4 text-primary" /> 1. สร้างชุดคำศัพท์ (Vocab Sets)
                  </div>
                  <p className="text-xs">
                    ไปที่เมนู <strong>"My Sets"</strong> แล้วกด <strong>"+ New Set"</strong> สามารถเพิ่มคำศัพท์เอง หรือเลือกจากคลังคำศัพท์มาตรฐาน 1,050 คำ (Easy / Medium / Hard)
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface/50 hover:bg-white transition-all space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-text-primary text-sm">
                    <Sparkles className="w-4 h-4 text-accent-yellow" /> 2. AI อัจฉริยะ & OCR สแกนภาพ
                  </div>
                  <p className="text-xs">
                    พิมพ์เฉพาะคำศัพท์ภาษาอังกฤษ ระบบ AI จะช่วยค้นหาคำแปลไทย คำอ่านสัทศาสตร์ และชนิดคำ (Part of Speech) หรือถ่ายรูปเอกสารเพื่อสแกนด้วย OCR
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface/50 hover:bg-white transition-all space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-text-primary text-sm">
                    <Volume2 className="w-4 h-4 text-secondary" /> 3. ฟังเสียงอ่านเจ้าของภาษา
                  </div>
                  <p className="text-xs">
                    กดไอคอนลำโพงเพื่อฟังเสียงออกเสียงภาษาอังกฤษสำเนียงสากลคมชัด ช่วยฝึกการฟังและการออกเสียงที่ถูกต้อง
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface/50 hover:bg-white transition-all space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-text-primary text-sm">
                    <Layers className="w-4 h-4 text-emerald-600" /> 4. สำรวจชุดคำศัพท์สาธารณะ (Explore)
                  </div>
                  <p className="text-xs">
                    สามารถค้นหาและคัดลอกชุดคำศัพท์ที่เพื่อนๆ หรือครูแชร์ไว้ในเมนู <strong>"Explore"</strong> เข้าสู่คลังส่วนตัวได้ใน 1 คลิก
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 โหมดฝึกฝน */}
          {activeTab === 'study' && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                เลือกชุดคำศัพท์ใน <strong>"My Sets"</strong> แล้วกดเลือก 1 ใน 5 โหมดฝึกฝนเพื่อสะสม EXP และเหรียญ 🪙:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    🃏
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">1. แฟลชการ์ด (Flashcards)</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      พลิกการ์ดหน้า-หลังเพื่อทบทวนคำศัพท์ คำแปล และประโยคตัวอย่าง เหมาะสำหรับการจำคำศัพท์ใหม่
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    ✍️
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">2. สะกดคำ (Spelling)</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      ฟังเสียงอ่านและดูคำแปลภาษาไทย แล้วพิมพ์สะกดคำภาษาอังกฤษให้ถูกต้อง เหมาะสำหรับฝึก Writing
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    🔘
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">3. เลือกตอบ (Multiple Choice)</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      ควิซทดสอบความเร็วและความแม่นยำ เลือกความหมายที่ถูกต้องจาก 4 ตัวเลือก
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    🧩
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">4. จับคู่คำศัพท์ (Matching)</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      จับคู่คำศัพท์ภาษาอังกฤษกับคำแปลภาษาไทยให้ตรงกัน ทำเวลาให้เร็วที่สุดเพื่อรับคะแนนสูงสุด
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    📝
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">5. เติมคำในช่องว่าง (Fill in the Blank)</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      อ่านประโยคบริบทแล้วเติมคำศัพท์ที่หายไป ช่วยให้เข้าใจการนำคำศัพท์ไปใช้จริงในประโยค
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: สัตว์เลี้ยง & กีฬา */}
          {activeTab === 'pet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/60">
                <h3 className="font-outfit font-bold text-base text-emerald-800 flex items-center gap-2">
                  🐾 สัตว์เลี้ยงคู่หูสไตล์ Tamagotchi (10 สายพันธุ์)
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  เลือกมอนสเตอร์คู่หู 1 ตัวจาก 10 แบบ เช่น น้องโมจิ (Moji), บับเบิ้ล (Bubble), ปุยปุย (Pui Pui), ลูโน่ (Luno) และช่วยกันพัฒนาสเตตัส!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1.5">
                  <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    🍖 การดูแล (Care & Feeding)
                  </div>
                  <ul className="text-xs list-disc list-inside space-y-1 text-text-secondary">
                    <li><strong>ให้อาหาร:</strong> เพิ่มค่าความอิ่ม (Hunger) และ EXP</li>
                    <li><strong>ลูบหัว/เล่นด้วย:</strong> เพิ่มค่าความสุข (Happiness)</li>
                    <li><strong>เลเวลอัป:</strong> ปลดล็อกพลังโจมตีและโบนัสพิเศษ</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1.5">
                  <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    📊 ค่าพลัง 4 ด้าน (Stats)
                  </div>
                  <ul className="text-xs list-disc list-inside space-y-1 text-text-secondary">
                    <li><strong>STR (พลังโจมตี):</strong> ช่วยทำดาเมจบอสแรงขึ้น</li>
                    <li><strong>AGI (ความว่องไว):</strong> เพิ่มความเร็วและหลบหลีก</li>
                    <li><strong>INT (สติปัญญา):</strong> เพิ่มโบนัสคะแนนและความจำ</li>
                    <li><strong>BURST:</strong> เร่งเกจสะสมพลังอัลติเมต</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-slate-50 space-y-2">
                <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                  🏅 มินิเกมกีฬาอาเขต 3 รูปแบบ (Sports Arcade)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-border">
                    <span className="font-bold text-amber-600 block mb-0.5">🏀 Basketball</span>
                    กดกะจังหวะให้แถบหยุดตรงจุดเขียวกลางเป้าเพื่อยิง 3 แต้ม
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border">
                    <span className="font-bold text-rose-600 block mb-0.5">🎯 Darts</span>
                    เล็ง Crosshair ให้เข้าเป้า Bullseye 50 แต้ม
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-border">
                    <span className="font-bold text-blue-600 block mb-0.5">⚽ Penalty Kick</span>
                    เลือกมุมยิง 4 ทิศทาง หลบผู้รักษาประตูสไลม์
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: สังเวียนบอส */}
          {activeTab === 'battle' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-orange-50 to-white border border-red-200">
                <h3 className="font-outfit font-bold text-base text-red-700 flex items-center gap-2">
                  ⚔️ สังเวียนผจญภัยท้าดวลบอส 5 ด่าน (Boss Battle Arena)
                </h3>
                <p className="text-xs text-red-600 mt-1">
                  นำสัตว์เลี้ยงของคุณออกศึก ดวลตอบคำถามคำศัพท์เพื่อลด HP ของบอสและพิชิตชัยชนะ!
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">การต่อสู้แบบเทิร์นเบส (Turn-based Combat)</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      เมื่อตอบคำศัพท์ถูก สัตว์เลี้ยงจะปล่อยพลังโจมตีใส่บอส แต่หากตอบผิดหรือหมดเวลา บอสจะโจมตีสวนกลับ
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    🔥
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                      Ultimate Burst (ดาเมจ x3)
                    </h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      ตอบคำศัพท์ถูกต่อเนื่อง 3 ข้อเพื่อเปิดใช้งาน <strong>Ultimate Burst</strong> ทำดาเมจหนักขึ้น 3 เท่าทันที!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    👑
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">ด่านบอสทั้ง 5 ระดับ</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      1. Goblin Grunt 🌲 ➔ 2. Frost Yeti ❄️ ➔ 3. Magma Golem 🌋 ➔ 4. Shadow Wyrm 🌌 ➔ 5. Void Overlord 👑
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ร้านค้า & ภารกิจ */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-white border border-amber-200">
                <h3 className="font-outfit font-bold text-base text-amber-800 flex items-center gap-2">
                  🛍️ ร้านค้าแฟชั่น, ห้องแต่งตัว & ภารกิจรายวัน
                </h3>
                <p className="text-xs text-amber-700 mt-1">
                  นำเหรียญ 🪙 ที่ได้จากการฝึกฝนและทำภารกิจมาซื้ออาหาร แว่นตา และชุดคอสตูมสุดน่ารัก!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1.5">
                  <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    👓 แว่นตา 20 แบบ & 👗 ชุด 20 แบบ
                  </div>
                  <p className="text-xs">
                    มีแว่นตาแฟชั่นหลากหลายและชุดธีมต่างๆ (เช่น ไดโนเสาร์, นักเรียน, นินจา, อวกาศ ฯลฯ) สวมใส่แล้วเพิ่มค่า STR, AGI, INT ทันที
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1.5">
                  <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    🎯 ภารกิจประจำวัน (Daily Missions)
                  </div>
                  <p className="text-xs">
                    กดปุ่ม <strong>"Missions"</strong> บนแถบเมนูเพื่อดูเควสต์ประจำวัน เช่น ทบทวนคำศัพท์ครบ 10 คำ, เล่นมินิเกมกีฬา หรือชนะบอส เพื่อรับเหรียญ 🪙 และ EXP สัตว์เลี้ยง
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary-light/40 border border-primary/20 flex items-center justify-between">
                <div className="text-xs">
                  <strong className="text-primary block font-bold">💡 เคล็ดลับสะสมเหรียญไว:</strong>
                  เข้าเล่นทุกวัน ทบทวนคำศัพท์อย่างน้อย 1 ชุด และเคลียร์ภารกิจครบ 100%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-slate-50 flex items-center justify-between">
          <Link
            to="/guide"
            onClick={onClose}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>อ่านแบบหน้าเต็ม (Full Guide)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button variant="primary" size="sm" onClick={onClose} className="px-5">
            เข้าใจแล้ว (Got it!)
          </Button>
        </div>
      </Card>
    </div>
  );
};
