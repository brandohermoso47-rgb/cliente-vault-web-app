import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Landmark, 
  ArrowUpRight, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  X, 
  Globe,
  Coins,
  ShoppingBag,
  CreditCard,
  MapPin
} from 'lucide-react';
import { User } from '../types';
import { Language } from '../lib/translations';
import { 
  fetchInstructorFinances, 
  requestInstructorPayoutBackend, 
  saveInstructorBankAccountBackend, 
  simulateInstructorSaleBackend 
} from '../lib/api';

interface InstructorFinanceViewProps {
  currentUser: User;
  language: Language;
  playChime: (type: 'success' | 'click' | 'cash' | 'error') => void;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number;
  flag: string;
  name: string;
  region: string;
  hub: string;
}

const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, flag: '🇺🇸', name: 'US Dollar', region: 'EE.UU. / Global', hub: 'Los Ángeles & NY (Origen)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, flag: '🇪🇺', name: 'Euro', region: 'Europa', hub: 'París, Milán & Berlín' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, flag: '🇬🇧', name: 'British Pound', region: 'Reino Unido', hub: 'Londres (UK Waack Scene)' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.5, flag: '🇯🇵', name: 'Yen Japonés', region: 'Japón', hub: 'Tokio & Osaka (Waack Meca)' },
  KRW: { code: 'KRW', symbol: '₩', rate: 1380.0, flag: '🇰🇷', name: 'Won Surcoreano', region: 'Corea del Sur', hub: 'Seúl (Meca Asiática)' },
  MXN: { code: 'MXN', symbol: '$', rate: 18.2, flag: '🇲🇽', name: 'Peso Mexicano', region: 'México & LATAM', hub: 'CDMX & Guadalajara' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.60, flag: '🇧🇷', name: 'Real Brasileño', region: 'Brasil', hub: 'São Paulo & Rio' }
};

export const InstructorFinanceView: React.FC<InstructorFinanceViewProps> = ({
  currentUser,
  language,
  playChime
}) => {
  const isEs = language === 'es';

  // Multi-Currency Selection State
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Financial State
  const [finances, setFinances] = useState<any>({
    grossEarningsUSD: 180.00,
    platformFeeUSD: 36.00,
    netEarningsUSD: 144.00,
    pendingBalanceUSD: 24.00,
    availableBalanceUSD: 120.00,
    totalPaidOutUSD: 0.00,
    payoutMinimumUSD: 20.00,
    canRequestPayout: true,
    transactions: [],
    payouts: [],
    bankAccount: {
      bankName: 'Chase Bank / Banco Internacional',
      accountHolder: 'Jassy Soner',
      accountNumber: '**** **** **** 8842',
      routingNumber: '121000358',
      country: 'USD'
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [payoutAmountInput, setPayoutAmountInput] = useState<string>('');
  const [payoutNotesInput, setPayoutNotesInput] = useState<string>('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState<boolean>(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Bank Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [bankNameInput, setBankNameInput] = useState<string>('');
  const [accountHolderInput, setAccountHolderInput] = useState<string>('');
  const [accountNumberInput, setAccountNumberInput] = useState<string>('');
  const [routingNumberInput, setRoutingNumberInput] = useState<string>('');
  const [countryInput, setCountryInput] = useState<string>('USD');
  const [isSavingBank, setIsSavingBank] = useState<boolean>(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activeCurrencyConfig = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.USD;

  // Currency Converter helper
  const formatMoney = (amountUSD: number, code: string = selectedCurrency) => {
    const config = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.USD;
    const converted = amountUSD * config.rate;
    if (code === 'JPY' || code === 'KRW') {
      return `${config.symbol}${Math.round(converted).toLocaleString('en-US')} ${config.code}`;
    }
    return `${config.symbol}${converted.toFixed(2)} ${config.code}`;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInstructorFinances(currentUser);
      if (data) {
        setFinances(data);
        if (data.bankAccount) {
          setBankNameInput(data.bankAccount.bankName || '');
          setAccountHolderInput(data.bankAccount.accountHolder || '');
          setAccountNumberInput(data.bankAccount.accountNumber || '');
          setRoutingNumberInput(data.bankAccount.routingNumber || '');
          setCountryInput(data.bankAccount.country || 'USD');
        }
      }
    } catch (err) {
      console.error('[Load Finances Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle Request Payout
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);

    const amount = parseFloat(payoutAmountInput);

    if (isNaN(amount) || amount <= 0) {
      setPayoutError(isEs ? 'Por favor ingresa un monto válido mayor a $0.00 USD.' : 'Please enter a valid amount greater than $0.00 USD.');
      playChime('error');
      return;
    }

    if (amount < finances.payoutMinimumUSD) {
      setPayoutError(
        isEs 
          ? `Regla de negocio: El umbral mínimo de retiro es de $${finances.payoutMinimumUSD.toFixed(2)} USD.`
          : `Business rule: The minimum payout threshold is $${finances.payoutMinimumUSD.toFixed(2)} USD.`
      );
      playChime('error');
      return;
    }

    if (amount > finances.availableBalanceUSD) {
      setPayoutError(
        isEs 
          ? `El monto solicitado ($${amount.toFixed(2)} USD) excede tu Saldo Disponible ($${finances.availableBalanceUSD.toFixed(2)} USD).`
          : `Requested amount ($${amount.toFixed(2)} USD) exceeds your Available Balance ($${finances.availableBalanceUSD.toFixed(2)} USD).`
      );
      playChime('error');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await requestInstructorPayoutBackend(currentUser, {
        amountUSD: amount,
        notes: payoutNotesInput
      });

      playChime('cash');
      setFinances(res.finances);
      setIsPayoutModalOpen(false);
      setPayoutAmountInput('');
      setPayoutNotesInput('');
      setToastMessage(res.message || '¡Retiro procesado exitosamente!');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      console.error('[Payout Submission Error]:', err);
      setPayoutError(err.message || 'Error al procesar el retiro en el servidor');
      playChime('error');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Handle Save Bank Account
  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankError(null);

    if (!bankNameInput.trim() || !accountHolderInput.trim() || !accountNumberInput.trim()) {
      setBankError(isEs ? 'Por favor completa todos los campos requeridos del banco.' : 'Please fill all required bank fields.');
      playChime('error');
      return;
    }

    setIsSavingBank(true);
    try {
      const res = await saveInstructorBankAccountBackend(currentUser, {
        bankName: bankNameInput,
        accountHolder: accountHolderInput,
        accountNumber: accountNumberInput,
        routingNumber: routingNumberInput,
        country: countryInput
      });

      playChime('success');
      setFinances((prev: any) => ({ ...prev, bankAccount: res.bankAccount }));
      setIsBankModalOpen(false);
      setToastMessage(isEs ? '¡Cuenta bancaria vinculada exitosamente para depósitos directos!' : 'Bank account linked successfully!');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      console.error('[Save Bank Error]:', err);
      setBankError(err.message || 'Error al guardar la cuenta bancaria');
      playChime('error');
    } finally {
      setIsSavingBank(false);
    }
  };

  // Handle International Sale Simulation
  const handleSimulateSale = async () => {
    playChime('click');
    setIsSimulating(true);
    try {
      const globalStudents = [
        { name: 'Yuki Waacker', region: '🇯🇵 JPN (Tokio)', amount: 100 },
        { name: 'Min-jun Kim', region: '🇰🇷 KOR (Seúl)', amount: 50 },
        { name: 'Camille Funk', region: '🇪🇺 FRA (París)', amount: 25 },
        { name: 'Aria Arms', region: '🇬🇧 GBR (Londres)', amount: 35 },
        { name: 'Mateo Posing', region: '🇲🇽 MEX (CDMX)', amount: 20 },
        { name: 'Lucas Funk', region: '🇧🇷 BRA (São Paulo)', amount: 30 }
      ];

      const randomStudent = globalStudents[Math.floor(Math.random() * globalStudents.length)];
      const sampleTypes = ['Cátedra', 'Masterclass', 'Ebook', 'Coaching'];
      const randomType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];

      const res = await simulateInstructorSaleBackend(currentUser, {
        studentName: randomStudent.name,
        studentRegion: randomStudent.region,
        itemType: randomType,
        itemTitle: `Inscripción ${randomType} (${randomStudent.region})`,
        amountUSD: randomStudent.amount
      });

      playChime('cash');
      setFinances(res.finances);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      console.error('[Simulate Sale Error]:', err);
      setToastMessage('Error al simular venta: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Floating Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 max-w-md p-4 bg-[#0A120E] border-2 border-emerald-500/50 shadow-[0_4px_30px_rgba(52,211,153,0.2)] rounded-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-bold text-white font-mono">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER: POLÍTICA ONLYFANS 80/20 & RBAC SECURITY */}
      <div className="bg-gradient-to-r from-[#170E28] via-[#221332] to-[#0D0B18] border border-[#D9A9FF]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C23E9E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D9A9FF]" />
                POLÍTICA DE CREADORES 80/20
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ROLLING WINDOW 21 DÍAS
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> MULTI-CURRENCY GLOBAL
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Wallet className="w-7 h-7 text-[#D9A9FF]" />
              {isEs ? 'Módulo Central de Finanzas & Retiros' : 'Finance & Payouts Central'}
            </h2>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {isEs 
                ? 'Lógica de ingresos automatizada bajo el modelo OnlyFans: La plataforma retiene una comisión estricta del 20% y tú recibes el 80% como ganancia neta. Los pagos ingresan a tu Saldo Pendiente y se transfieren a tu Saldo Disponible 21 días después de cada compra con conversión multi-divisa en tiempo real.'
                : 'Automated revenue engine under the OnlyFans model: Platform retains strict 20% commission, and you receive 80% net with real-time multi-currency support.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSimulateSale}
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#D9A9FF] text-white hover:text-black font-mono font-bold text-xs border border-white/15 hover:border-[#D9A9FF] transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#D9A9FF]" />}
              <span>{isEs ? 'Simular Venta Internacional' : 'Simulate Global Sale'}</span>
            </button>

            <button
              onClick={() => {
                playChime('click');
                setIsBankModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1D172E] hover:bg-[#28203E] text-[#D9A9FF] border border-[#D9A9FF]/40 font-mono font-bold text-xs transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Landmark className="w-4 h-4 text-[#D9A9FF]" />
              <span>{isEs ? 'Configurar Cuenta Bancaria' : 'Bank Account'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-CURRENCY & WAACKING HUB SELECTOR BAR */}
      <div className="bg-[#120F20] border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-extrabold uppercase text-white tracking-wider">
              {isEs ? 'Mercados Internacionales de Waacking (Conversión de Divisa)' : 'Global Waacking Scene Currency Adaptor'}
            </span>
          </div>

          <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            Tipo de Cambio Oficial Base USD: 1.00
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => {
                  playChime('click');
                  setSelectedCurrency(curr.code);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>{curr.flag}</span>
                <span>{curr.code} ({curr.symbol})</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-1">
          <MapPin className="w-3.5 h-3.5 text-[#D9A9FF]" />
          <span>Región seleccionada: <strong className="text-cyan-300 font-bold">{activeCurrencyConfig.flag} {activeCurrencyConfig.name} ({activeCurrencyConfig.hub})</strong></span>
          {selectedCurrency !== 'USD' && (
            <span className="text-slate-500">(1 USD = {activeCurrencyConfig.rate} {activeCurrencyConfig.code})</span>
          )}
        </div>
      </div>

      {/* TOP SUMMARY CARDS: INGRESOS BRUTOS | COMISIÓN 20% | NETO 80% */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Ingresos Brutos */}
        <div className="bg-[#120F20] border border-white/10 p-5 rounded-2xl relative overflow-hidden shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
              {isEs ? 'INGRESOS BRUTOS (100%)' : 'GROSS REVENUE (100%)'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {formatMoney(finances.grossEarningsUSD)}
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            {isEs ? `Base oficial: $${finances.grossEarningsUSD.toFixed(2)} USD` : `Official base: $${finances.grossEarningsUSD.toFixed(2)} USD`}
          </p>
        </div>

        {/* Card 2: Comisión Plataforma 20% */}
        <div className="bg-[#120F20] border border-rose-500/20 p-5 rounded-2xl relative overflow-hidden shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-rose-300">
              {isEs ? 'COMISIÓN PLATAFORMA (20%)' : 'PLATFORM FEE (20%)'}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
            -{formatMoney(finances.platformFeeUSD)}
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            {isEs ? `Base oficial: -$${finances.platformFeeUSD.toFixed(2)} USD` : `Official base: -$${finances.platformFeeUSD.toFixed(2)} USD`}
          </p>
        </div>

        {/* Card 3: Ganancia Neta 80% */}
        <div className="bg-[#120F20] border border-[#D9A9FF]/30 p-5 rounded-2xl relative overflow-hidden shadow-xl space-y-2 bg-gradient-to-br from-[#D9A9FF]/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#D9A9FF]">
              {isEs ? 'GANANCIA NETA TOTAL (80%)' : 'TOTAL NET EARNINGS (80%)'}
            </span>
            <div className="p-2 rounded-xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {formatMoney(finances.netEarningsUSD)}
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            {isEs ? `Base oficial: $${finances.netEarningsUSD.toFixed(2)} USD` : `Official base: $${finances.netEarningsUSD.toFixed(2)} USD`}
          </p>
        </div>

      </div>

      {/* INSTRUCTOR PLATFORM SUBSCRIPTION FEE INFO ($15 USD/MONTH) */}
      <div className="bg-[#181224] border border-purple-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shrink-0">
            <Coins className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-white uppercase">Cuota Fija de Plataforma para Instructores</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                MEMBRESÍA ACTIVA ($15.00 USD/mes)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5">
              {isEs 
                ? 'Membresía mensual fija de $15.00 USD para acceder al panel de gestión, publicar cátedras y recibir el 80% neto de la suscripción de tus alumnos.'
                : 'Fixed monthly platform fee of $15.00 USD to access the management dashboard, publish cátedras, and receive 80% net earnings.'}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-mono font-bold text-purple-300 block">
            $15.00 USD / mes
          </span>
          <span className="text-[9px] font-mono text-slate-400 block">
            Facturación mensual fija
          </span>
        </div>
      </div>

      {/* BALANCES SPLIT: SALDO PENDIENTE (RETENCIÓN 21 DÍAS) VS SALDO DISPONIBLE (LISTO PARA RETIRAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD A: SALDO PENDIENTES (PENDING BALANCE - 21-DAY ROLLING WINDOW) */}
        <div className="bg-[#120D1F] border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {isEs ? 'SALDO PENDIENTE' : 'PENDING BALANCE'}
                </h3>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {isEs ? 'Retención Rolling Window (21 Días)' : '21-Day Rolling Retention Window'}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-black">
              21 Días
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight">
              {formatMoney(finances.pendingBalanceUSD)}
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
              {isEs 
                ? 'Fondos de ventas procesadas recientemente. Cada pago ingresa aquí y el sistema lo transfiere automáticamente a tu Saldo Disponible exactamente 21 días después de la compra original.'
                : 'Funds from recent sales. Each purchase enters here and transfers automatically to your Available Balance 21 days after the original purchase date.'}
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Transacciones en retención:</span>
            <strong className="text-amber-400 font-bold">
              {(finances?.transactions || []).filter((t: any) => t.status === 'pending_21d').length} ventas
            </strong>
          </div>
        </div>

        {/* CARD B: SALDO DISPONIBLE (AVAILABLE BALANCE - READY FOR PAYOUT) */}
        <div className="bg-gradient-to-br from-[#111A16] via-[#0E1513] to-[#0B0F0E] border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {isEs ? 'SALDO DISPONIBLE' : 'AVAILABLE BALANCE'}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {isEs ? 'Fondos maduros listos para retirar' : 'Matured funds ready for payout'}
                </span>
              </div>
            </div>

            {/* Threshold Badge */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black border ${
              finances.canRequestPayout 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {finances.canRequestPayout ? 'UMBRAL ALCANZADO (>$20.00)' : 'MÍNIMO $20.00 USD'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
              {formatMoney(finances.availableBalanceUSD)}
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
              {isEs 
                ? 'Fondos con periodo de retención cumplido. Puedes solicitar la transferencia directa a tu cuenta bancaria cuando el saldo sea igual o superior a $20.00 USD.'
                : 'Funds that have passed the retention period. You can request direct payout to your bank account whenever balance reaches $20.00 USD or more.'}
            </p>
          </div>

          {/* PAYOUT BUTTON & LINKED BANK ACCOUNT SUMMARY */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#D9A9FF]" />
                <span>
                  {finances.bankAccount?.bankName 
                    ? `${finances.bankAccount.bankName} (${finances.bankAccount.accountNumber})` 
                    : (isEs ? 'Sin cuenta bancaria vinculada' : 'No bank linked')}
                </span>
              </div>

              {/* ACTION PAYOUT BUTTON */}
              <button
                type="button"
                disabled={!finances.canRequestPayout}
                onClick={() => {
                  playChime('click');
                  setPayoutAmountInput(finances.availableBalanceUSD.toFixed(2));
                  setIsPayoutModalOpen(true);
                }}
                className={`py-3 px-6 rounded-2xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                  finances.canRequestPayout
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-[#D9A9FF] hover:brightness-110 text-black active:scale-95 cursor-pointer'
                    : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                }`}
                title={!finances.canRequestPayout ? 'Requiere un Saldo Disponible mínimo de $20.00 USD' : 'Solicitar retiro a cuenta bancaria'}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{isEs ? 'Solicitar Retiro' : 'Request Payout'}</span>
              </button>
            </div>

            {!finances.canRequestPayout && (
              <p className="text-[10px] font-mono text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-500/30 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isEs 
                    ? `El botón de retiro permanece deshabilitado hasta alcanzar el umbral mínimo de $20.00 USD (Saldo actual: $${finances.availableBalanceUSD.toFixed(2)} USD).`
                    : `Payout button remains disabled until reaching the $20.00 USD minimum threshold.`}
                </span>
              </p>
            )}
          </div>
        </div>

      </div>

      {/* TRANSACTIONS TABLE: DETAILED 80/20 BREAKDOWN & MATURITY STATUS */}
      <div className="bg-[#120F20] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D9A9FF]" />
              {isEs ? 'Historial Detallado de Ventas Internacionales (Desglose 80/20)' : 'Detailed International Sales History (80/20 Breakdown)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEs ? 'Cálculo exacto del 20% de comisión y 80% neto para el instructor con origen del alumno y maduración de 21 días.' : 'Exact 20% commission and 80% net instructor earnings with student market origin and 21-day maturity status.'}
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-300">
            Total: {(finances?.transactions || []).length} registros
          </span>
        </div>

        {(!finances?.transactions || finances.transactions.length === 0) ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            [NO HAY TRANSACCIONES REGISTRADAS]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 pb-3 text-slate-400 font-mono font-extrabold uppercase">
                  <th className="pb-3 pr-3">ITEM</th>
                  <th className="pb-3 px-3">ALUMNO / REGIÓN</th>
                  <th className="pb-3 px-3 text-right">VENTA BRUTA (100%)</th>
                  <th className="pb-3 px-3 text-right text-rose-400">COMISIÓN (20%)</th>
                  <th className="pb-3 px-3 text-right text-emerald-400">NETO INSTRUCTOR (80%)</th>
                  <th className="pb-3 pl-3 text-center">ESTADO ROLLING WINDOW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {(finances.transactions || []).map((tx: any) => {
                  const isMatured = tx.status === 'available';
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3.5 pr-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] font-mono text-[9px] font-black uppercase">
                            {tx.itemType}
                          </span>
                          <span className="truncate max-w-[200px]">{tx.itemTitle}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.studentName}</span>
                          {tx.studentRegion && (
                            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                              {tx.studentRegion}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                        {formatMoney(tx.grossAmountUSD)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-400">
                        -{formatMoney(tx.platformFeeUSD)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-400">
                        +{formatMoney(tx.netAmountUSD)}
                      </td>
                      <td className="py-3.5 pl-3 text-center">
                        {isMatured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-amber-400" /> Pendiente ({tx.daysRemainingToMaturity}d)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYOUT HISTORY LOG */}
      <div className="bg-[#120F20] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-black text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-4">
          <CreditCard className="w-5 h-5 text-[#D9A9FF]" />
          {isEs ? 'Historial de Retiros Procesados' : 'Processed Payouts Log'}
        </h3>

        {(!finances?.payouts || finances.payouts.length === 0) ? (
          <div className="py-8 text-center text-slate-400 font-mono text-xs">
            [NO HAY RETIROS REGISTRADOS AÚN]
          </div>
        ) : (
          <div className="space-y-3">
            {(finances.payouts || []).map((po: any) => (
              <div key={po.id} className="p-4 rounded-2xl bg-[#171329] border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-black text-white">
                      Retiro Transferido: {formatMoney(po.amountUSD)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Destino: {po.bankSummary} • {new Date(po.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 uppercase">
                  Completado
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: PAYOUT REQUEST MODAL WITH ZOD & BALANCE VALIDATION */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#120F20] border-2 border-[#D9A9FF]/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    SALDO DISPONIBLE: ${finances.availableBalanceUSD.toFixed(2)} USD ({formatMoney(finances.availableBalanceUSD)})
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight font-mono">
                  {isEs ? 'Solicitar Retiro de Fondos' : 'Request Funds Payout'}
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  {isEs 
                    ? 'Ingresa el monto que deseas transferir a tu cuenta bancaria configurada. (Umbral mínimo: $20.00 USD).'
                    : 'Enter the amount you wish to transfer to your linked bank account. (Minimum threshold: $20.00 USD).'}
                </p>
              </div>

              {payoutError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{payoutError}</span>
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                    Monto a Retirar (USD Base) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-base font-mono font-bold text-[#D9A9FF]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="20"
                      max={finances.availableBalanceUSD}
                      value={payoutAmountInput}
                      onChange={(e) => {
                        setPayoutError(null);
                        setPayoutAmountInput(e.target.value);
                      }}
                      placeholder="20.00"
                      className="w-full bg-[#18142A] border border-[#D9A9FF]/50 rounded-2xl pl-9 pr-16 py-3 text-lg font-mono font-black text-white focus:border-[#D9A9FF] focus:ring-1 focus:ring-[#D9A9FF] outline-none"
                    />
                    <span className="absolute right-4 text-xs font-mono font-bold text-slate-400">USD</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                    <span>Mínimo permitido: $20.00 USD</span>
                    <button
                      type="button"
                      onClick={() => setPayoutAmountInput(finances.availableBalanceUSD.toFixed(2))}
                      className="text-[#D9A9FF] hover:underline font-bold"
                    >
                      Retirar todo (${finances.availableBalanceUSD.toFixed(2)} USD)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                    Destino Bancario
                  </label>
                  <div className="p-3 rounded-xl bg-[#18142A] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#D9A9FF]" />
                    <span>{finances.bankAccount?.bankName} ({finances.bankAccount?.accountNumber})</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                    Notas Opcionales
                  </label>
                  <input
                    type="text"
                    value={payoutNotesInput}
                    onChange={(e) => setPayoutNotesInput(e.target.value)}
                    placeholder="Ej. Retiro de membresías de Julio"
                    className="w-full bg-[#18142A] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:border-[#D9A9FF] outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-bold text-xs transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingPayout}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#D9A9FF] hover:brightness-110 text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmittingPayout ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Confirmar Retiro</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: LINK BANK ACCOUNT CONFIGURATION MODAL */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#120F20] border-2 border-[#D9A9FF]/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight font-mono flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#D9A9FF]" />
                  {isEs ? 'Configuración de Cuenta Bancaria Internacional' : 'Global Bank Account Configuration'}
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  {isEs 
                    ? 'Vincula tu cuenta bancaria personal para recibir las transferencias directas de tus retiros.'
                    : 'Link your personal bank account for direct deposit payout transfers.'}
                </p>
              </div>

              {bankError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{bankError}</span>
                </div>
              )}

              <form onSubmit={handleSaveBankAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                    Nombre del Banco *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    placeholder="Ej. Chase Bank / MUFG / Barclays / BBVA"
                    className="w-full bg-[#18142A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#D9A9FF] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                    Titular de la Cuenta *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolderInput}
                    onChange={(e) => setAccountHolderInput(e.target.value)}
                    placeholder="Nombre completo legal del titular"
                    className="w-full bg-[#18142A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#D9A9FF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                      Número / CLABE / IBAN *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumberInput}
                      onChange={(e) => setAccountNumberInput(e.target.value)}
                      placeholder="**** **** **** 8842"
                      className="w-full bg-[#18142A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#D9A9FF] outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                      Routing / SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      value={routingNumberInput}
                      onChange={(e) => setRoutingNumberInput(e.target.value)}
                      placeholder="CHASUS33 / 121000358"
                      className="w-full bg-[#18142A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#D9A9FF] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBankModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-bold text-xs transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingBank}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSavingBank ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Guardar Cuenta</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
