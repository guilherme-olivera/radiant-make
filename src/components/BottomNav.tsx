import React from 'react';
import { LayoutGrid, Plus, BadgeDollarSign, Sparkles } from 'lucide-react';

export type TabType = 'dashboard' | 'venda' | 'cobrancas' | 'catalogo' | 'config' | 'relatorios';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  cobrancasAlertCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  cobrancasAlertCount,
}) => {
  return (
    <nav className="fixed sm:absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/80 py-2 px-6 flex justify-between items-center z-30 max-w-md mx-auto">
      {/* Início */}
      <button
        onClick={() => onChangeTab('dashboard')}
        className={`flex flex-col items-center transition ${
          currentTab === 'dashboard' ? 'text-radiant-pink' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Início</span>
      </button>

      {/* Botão Central Venda */}
      <button
        onClick={() => onChangeTab('venda')}
        className="flex flex-col items-center group relative -mt-6"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-radiant-pink to-rose-400 text-white flex items-center justify-center shadow-lg shadow-radiant-pink/40 border-4 border-white group-active:scale-95 transition">
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-extrabold text-radiant-pink mt-1">Venda</span>
      </button>

      {/* Cobranças */}
      <button
        onClick={() => onChangeTab('cobrancas')}
        className={`flex flex-col items-center transition relative ${
          currentTab === 'cobrancas' ? 'text-radiant-pink' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <BadgeDollarSign className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Cobranças</span>
        {cobrancasAlertCount > 0 && (
          <span className="absolute top-0 right-3.5 w-2 h-2 bg-amber-500 rounded-full" />
        )}
      </button>

      {/* Catálogo */}
      <button
        onClick={() => onChangeTab('catalogo')}
        className={`flex flex-col items-center transition ${
          currentTab === 'catalogo' ? 'text-radiant-pink' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Catálogo</span>
      </button>
    </nav>
  );
};

