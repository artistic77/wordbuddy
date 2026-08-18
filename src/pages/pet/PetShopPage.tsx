import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  gamificationService,
  SHOP_ITEMS,
  type ShopItem,
} from '../../services/gamificationService';

export const PetShopPage: React.FC = () => {
  const [coins, setCoins] = useState<number>(gamificationService.getCoins());
  const [inventory, setInventory] = useState<Record<string, number>>(
    gamificationService.getInventory()
  );
  const [activeTab, setActiveTab] = useState<'all' | 'food' | 'potion' | 'glasses' | 'outfit'>('all');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshState = () => {
    setCoins(gamificationService.getCoins());
    setInventory(gamificationService.getInventory());
  };

  useEffect(() => {
    refreshState();
    const handleCoins = () => setCoins(gamificationService.getCoins());
    const handleInv = () => setInventory(gamificationService.getInventory());

    window.addEventListener('wb:coins_updated', handleCoins);
    window.addEventListener('wb:inventory_updated', handleInv);

    return () => {
      window.removeEventListener('wb:coins_updated', handleCoins);
      window.removeEventListener('wb:inventory_updated', handleInv);
    };
  }, []);

  const handleBuy = (item: ShopItem) => {
    const res = gamificationService.buyItem(item.id);
    if (res.success) {
      setNotice({ type: 'success', message: res.message });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({ type: 'error', message: res.message });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const filteredItems =
    activeTab === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((i) => i.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/pet"
            className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="verb" size="sm">
                🛍️ Pet Marketplace
              </Badge>
              <span className="text-xs text-text-muted">อาหาร ยา และแฟชั่น 40 ชิ้น</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-text-primary mt-1">
              Pet Treats & Wardrobe Shop
            </h1>
          </div>
        </div>

        {/* Coin Balance Banner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-accent-yellow-light text-accent-yellow border border-accent-yellow/30 rounded-2xl font-outfit font-bold text-lg shadow-sm">
            <span className="text-2xl">🪙</span>
            <span>{coins} Coins</span>
          </div>
          <Link to="/pet">
            <Button variant="secondary" size="md" className="flex items-center gap-1.5">
              <span>🐾</span> สวนสัตว์เลี้ยง
            </Button>
          </Link>
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fade-in shadow-md ${
            notice.type === 'success'
              ? 'bg-accent-green-light border border-accent-green text-green-900'
              : 'bg-red-50 border border-red-300 text-red-900'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {[
          { id: 'all', label: '🌟 ทั้งหมด (All Items)', count: SHOP_ITEMS.length },
          { id: 'food', label: '🍖 อาหาร (Food)', count: SHOP_ITEMS.filter((i) => i.type === 'food').length },
          { id: 'potion', label: '🧪 ยาเวทมนตร์ (Potions)', count: SHOP_ITEMS.filter((i) => i.type === 'potion').length },
          { id: 'glasses', label: '👓 แว่นตา (20 แบบ)', count: SHOP_ITEMS.filter((i) => i.type === 'glasses').length },
          { id: 'outfit', label: '👗 ชุดเสื้อผ้า (20 แบบ)', count: SHOP_ITEMS.filter((i) => i.type === 'outfit').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-primary-btn scale-[1.02]'
                : 'bg-white text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const owned = inventory[item.id] || 0;
          const canAfford = coins >= item.price;

          const bgBox =
            item.type === 'glasses'
              ? 'bg-indigo-50 border-indigo-200'
              : item.type === 'outfit'
              ? 'bg-purple-50 border-purple-200'
              : item.type === 'potion'
              ? 'bg-cyan-50 border-cyan-200'
              : 'bg-orange-50 border-orange-200';

          return (
            <Card
              key={item.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all shadow-card bg-white"
            >
              <div className="space-y-3">
                {/* Icon & Owned Count */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl ${bgBox} border flex items-center justify-center text-3xl shadow-sm`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      owned > 0
                        ? 'bg-accent-green-light text-accent-green border border-accent-green/30'
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    {owned > 0 ? `Owned: ${owned}` : 'Not Owned'}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="font-outfit font-bold text-base text-text-primary">
                    {item.nameTh}
                  </h3>
                  <p className="text-xs text-text-muted font-outfit">{item.name}</p>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sarabun">
                    {item.description}
                  </p>
                </div>

                {/* Stat Bonus / Restoration Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.hungerRestore !== undefined && item.hungerRestore > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                      +{item.hungerRestore}% Hunger
                    </span>
                  )}
                  {item.happinessGain !== undefined && item.happinessGain > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200">
                      +{item.happinessGain}% Joy
                    </span>
                  )}
                  {item.expGain !== undefined && item.expGain > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-light text-primary border border-primary/20">
                      +{item.expGain} EXP
                    </span>
                  )}
                  {item.statBonus?.str && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                      +{item.statBonus.str} STR ⚔️
                    </span>
                  )}
                  {item.statBonus?.agi && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{item.statBonus.agi} AGI ⚡
                    </span>
                  )}
                  {item.statBonus?.intStat && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      +{item.statBonus.intStat} INT 🧠
                    </span>
                  )}
                  {item.statBonus?.power && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      +{item.statBonus.power} POWER 🔥
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 font-outfit font-bold text-base text-text-primary">
                  <span className="text-lg">🪙</span>
                  <span>{item.price}</span>
                </div>

                <Button
                  variant={canAfford ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => handleBuy(item)}
                  className="font-sarabun"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                  {item.type === 'glasses' || item.type === 'outfit'
                    ? owned > 0
                      ? 'ซื้อเพิ่ม'
                      : 'ซื้อใส่'
                    : 'ซื้อ'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
