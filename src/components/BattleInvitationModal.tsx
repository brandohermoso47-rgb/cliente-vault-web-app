import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Check, X, Flame, Radio, Sparkles } from 'lucide-react';
import { User, BattleDoc } from '../types';
import { 
  listenToIncomingBattleInvitations, 
  respondToBattleInvitation 
} from '../lib/friendsAndBattles';

interface BattleInvitationModalProps {
  currentUser: User;
  onAcceptBattle: (battle: BattleDoc) => void;
}

export const BattleInvitationModal: React.FC<BattleInvitationModalProps> = ({
  currentUser,
  onAcceptBattle
}) => {
  const [incomingBattles, setIncomingBattles] = useState<BattleDoc[]>([]);

  // Listen to incoming battle invitations in real time
  useEffect(() => {
    if (!currentUser.id) return;
    const unsubscribe = listenToIncomingBattleInvitations(currentUser.id, (battles) => {
      setIncomingBattles(battles);
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  if (incomingBattles.length === 0) return null;

  const currentInvitation = incomingBattles[0];

  const handleAccept = async () => {
    await respondToBattleInvitation(currentInvitation.id, 'active');
    onAcceptBattle(currentInvitation);
  };

  const handleDecline = async () => {
    await respondToBattleInvitation(currentInvitation.id, 'declined');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#161414] border-2 border-[#E9C349] rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(233,195,73,0.3)] overflow-hidden"
        >
          {/* Animated pulse background element */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#E9C349]/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#9A2B3C]/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9C349]/20 border border-[#E9C349]/40 rounded-full text-[#E9C349] text-[10px] font-black uppercase tracking-widest mb-4">
            <Radio className="w-3.5 h-3.5 animate-ping text-[#E9C349]" />
            ¡Desafío de Live Battle en Tiempo Real!
          </div>

          {/* Host Avatar & Details */}
          <div className="my-4 flex flex-col items-center">
            <div className="relative mb-3">
              <img 
                src={currentInvitation.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                alt={currentInvitation.hostName}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#E9C349] shadow-xl" 
              />
              <div className="absolute -bottom-2 -right-2 p-2 bg-[#9A2B3C] border-2 border-black rounded-full text-white">
                <Swords className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wide">
              {currentInvitation.hostName}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              Te ha invitado a una sala de <span className="text-[#E9C349] font-bold">Waacking Live Battle</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleDecline}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs rounded-xl uppercase transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <X className="w-4 h-4" /> Rechazar
            </button>

            <button
              onClick={handleAccept}
              className="py-3 px-4 bg-[#E9C349] hover:bg-[#d6b13e] text-black font-black text-xs rounded-xl uppercase transition-all shadow-lg hover:shadow-[#E9C349]/30 flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" /> Aceptar Batalla
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
