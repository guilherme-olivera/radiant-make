import React from 'react';
import { Bell, Sparkles, Settings, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onOpenCobrancas: () => void;
  onOpenConfig: () => void;
  onOpenRelatorios?: () => void;
  pendentesHojeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCobrancas,
  onOpenConfig,
  onOpenRelatorios,
  pendentesHojeCount,
}) => {
  return (
    <header className="bg-gradient-to-r from-radiant-pink to-rose-400 text-white px-5 pt-7 pb-4 shadow-md flex justify-between items-center z-20 sticky top-0">
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-radiant-pink font-bold shadow-md text-lg">
          <Sparkles className="w-5 h-5 text-radiant-pink fill-radiant-pink" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight">Radiant Make</h1>
          <p className="text-[11px] text-pink-100 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block animate-pulse"></span>
            Maquiagem & Acessórios
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        {onOpenRelatorios && (
          <button
            onClick={onOpenRelatorios}
            title="Relatórios & Lucro"
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition"
          >
            <BarChart3 className="w-4 h-4 text-white" />
          </button>
        )}

        <button
          onClick={onOpenConfig}
          title="Configurações e Campanhas"
          className="p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={onOpenCobrancas}
          title="Cobranças e Lembretes"
          className="p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition relative"
        >
          <Bell className="w-4 h-4 text-white" />
          {pendentesHojeCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-radiant-pink animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};


