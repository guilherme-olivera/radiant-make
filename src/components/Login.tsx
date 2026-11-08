import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, Fingerprint, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { biometriaService } from '../utils/biometria';

interface LoginProps {
  onLoginSucesso: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSucesso }) => {
  const [modo, setModo] = useState<'PIN' | 'SENHA_MESTRA'>('PIN');
  
  // PIN de 4 dígitos
  const [pin, setPin] = useState('');
  const [erroPin, setErroPin] = useState<string | null>(null);

  // Senha Mestra
  const [senhaMestra, setSenhaMestra] = useState('');
  const [mostrarSenhaMestra, setMostrarSenhaMestra] = useState(false);
  const [erroSenhaMestra, setErroSenhaMestra] = useState<string | null>(null);

  // Redefinir PIN via Senha Mestra
  const [redefinindoPin, setRedefinindoPin] = useState(false);
  const [novoPin, setNovoPin] = useState('');

  // Biometria
  const [biometriaSuportada, setBiometriaSuportada] = useState(false);

  // Padrões iniciais (personalizáveis nas Configurações)
  const PIN_PADRAO = '2626';
  const SENHA_MESTRA_PADRAO = 'Maraccini26@';

  const obterPinSalvo = () => localStorage.getItem('radiant_pin_mestre') || PIN_PADRAO;
  const obterSenhaMestraSalva = () => localStorage.getItem('radiant_senha_mestra') || SENHA_MESTRA_PADRAO;

  // Checa biometria na inicialização
  useEffect(() => {
    biometriaService.isDisponivel().then(disp => {
      setBiometriaSuportada(disp);
      // Se biometria estiver ativa, tenta desbloquear automaticamente
      if (disp && biometriaService.isAtivada()) {
        handleDesbloquearBiometria();
      }
    });
  }, []);

  const handleDesbloquearBiometria = async () => {
    try {
      const ok = await biometriaService.autenticar();
      if (ok) {
        concluirAutenticacao('BIOMETRIA');
      }
    } catch {
      // Continua no PIN se o usuário cancelar
    }
  };

  const concluirAutenticacao = (metodo: string) => {
    localStorage.setItem(
      'radiant_auth_session',
      JSON.stringify({
        autenticado: true,
        data: new Date().toISOString(),
        metodo,
      })
    );
    onLoginSucesso();
  };

  const digitarNumeroPin = (num: string) => {
    if (pin.length < 4) {
      const novo = pin + num;
      setPin(novo);
      setErroPin(null);

      if (novo.length === 4) {
        if (novo === obterPinSalvo()) {
          setTimeout(() => concluirAutenticacao('PIN'), 150);
        } else {
          setTimeout(() => {
            setErroPin('PIN incorreto!');
            setPin('');
          }, 250);
        }
      }
    }
  };

  const apagarNumeroPin = () => {
    setPin(prev => prev.slice(0, -1));
    setErroPin(null);
  };

  const handleEntrarComSenhaMestra = (e: React.FormEvent) => {
    e.preventDefault();
    setErroSenhaMestra(null);

    if (senhaMestra === obterSenhaMestraSalva()) {
      if (redefinindoPin) {
        if (novoPin.length === 4 && /^\d{4}$/.test(novoPin)) {
          localStorage.setItem('radiant_pin_mestre', novoPin);
          alert(`PIN redefinido com sucesso para ${novoPin}!`);
          concluirAutenticacao('SENHA_MESTRA');
        } else {
          setErroSenhaMestra('O novo PIN deve ter exatamente 4 números.');
        }
      } else {
        concluirAutenticacao('SENHA_MESTRA');
      }
    } else {
      setErroSenhaMestra('Senha mestra incorreta.');
    }
  };

  return (
    <div className="bg-stone-900 text-stone-800 flex justify-center items-center min-h-screen p-0 sm:p-4">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-radiant-50 sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border sm:border-stone-800 relative justify-between p-6">
        
        {/* Cabeçalho */}
        <div className="text-center pt-6 space-y-2">
          <div className="w-20 h-20 rounded-full bg-white p-1 mx-auto flex items-center justify-center shadow-xl shadow-radiant-pink/20 border-2 border-rose-200 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Logo Radiant Make"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Radiant Make</h1>
            <p className="text-xs text-stone-500 font-medium">Gestão & Cobrança Express</p>
          </div>
        </div>

        {/* Corpo Principal: PIN ou Senha Mestra */}
        <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full my-auto">
          {modo === 'PIN' ? (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-radiant-pink text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  Acesso Protegido
                </div>
                <p className="text-xs text-stone-500 font-medium">Digite o seu PIN de 4 dígitos</p>

                {/* Bolinhas indicadoras do PIN */}
                <div className="flex justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map(idx => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        pin.length > idx
                          ? 'bg-radiant-pink border-radiant-pink scale-110 shadow-sm'
                          : 'border-stone-300 bg-white'
                      }`}
                    />
                  ))}
                </div>

                {erroPin && (
                  <p className="text-xs font-bold text-rose-600 animate-pulse">
                    {erroPin}
                  </p>
                )}
              </div>

              {/* Teclado Numérico */}
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => digitarNumeroPin(num)}
                    className="h-13 rounded-2xl bg-white hover:bg-rose-50 active:scale-95 text-xl font-bold text-stone-800 shadow-sm border border-stone-200/80 transition flex items-center justify-center py-3"
                  >
                    {num}
                  </button>
                ))}

                {/* Botão de Biometria (Face ID / Digital) */}
                <button
                  type="button"
                  onClick={handleDesbloquearBiometria}
                  title="Desbloquear com Biometria / Face ID"
                  className="h-13 rounded-2xl bg-rose-50 hover:bg-rose-100 text-radiant-pink active:scale-95 transition flex items-center justify-center shadow-xs border border-rose-200/60"
                >
                  <Fingerprint className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => digitarNumeroPin('0')}
                  className="h-13 rounded-2xl bg-white hover:bg-rose-50 active:scale-95 text-xl font-bold text-stone-800 shadow-sm border border-stone-200/80 transition flex items-center justify-center py-3"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={apagarNumeroPin}
                  className="h-13 rounded-2xl text-stone-400 hover:text-stone-700 active:scale-95 font-bold transition flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              {/* Botão para Senha Mestra */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setModo('SENHA_MESTRA')}
                  className="text-xs text-stone-500 hover:text-radiant-pink font-semibold inline-flex items-center gap-1 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Entrar com Senha Mestra
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Senha Mestra */
            <form onSubmit={handleEntrarComSenhaMestra} className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-stone-200/80 text-xs">
              <div className="text-center mb-1">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-radiant-pink mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="font-extrabold text-sm text-stone-800">Senha Mestra</h2>
                <p className="text-[11px] text-stone-500">
                  {redefinindoPin ? 'Confirme a senha para criar um novo PIN' : 'Acesso de administrador'}
                </p>
              </div>

              {erroSenhaMestra && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                  {erroSenhaMestra}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Digite sua Senha Mestra</label>
                  <div className="relative">
                    <input
                      type={mostrarSenhaMestra ? 'text' : 'password'}
                      required
                      value={senhaMestra}
                      onChange={e => setSenhaMestra(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:border-radiant-pink pr-9 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaMestra(!mostrarSenhaMestra)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {mostrarSenhaMestra ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {redefinindoPin && (
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Novo PIN (4 números)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={novoPin}
                      onChange={e => setNovoPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 1234"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold tracking-widest text-center text-sm focus:outline-none focus:border-radiant-pink"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-radiant-pink hover:bg-rose-600 active:scale-95 text-white font-extrabold rounded-2xl shadow-md shadow-radiant-pink/30 transition flex items-center justify-center gap-2"
              >
                {redefinindoPin ? 'Salvar Novo PIN e Entrar' : 'Desbloquear Sistema'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRedefinindoPin(!redefinindoPin)}
                  className="text-stone-500 hover:text-radiant-pink font-semibold"
                >
                  {redefinindoPin ? 'Cancelar redefinição' : 'Esqueci o PIN'}
                </button>

                <button
                  type="button"
                  onClick={() => setModo('PIN')}
                  className="text-stone-500 hover:text-stone-800 font-bold"
                >
                  Voltar ao PIN
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center pb-2">
          <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Radiant Make • Protegido por Biometria, PIN e Senha Mestra
          </p>
        </div>

      </div>
    </div>
  );
};
