import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Check, 
  X, 
  Swords, 
  UserCheck, 
  Clock, 
  Sparkles,
  Shield,
  Circle,
  Instagram,
  ExternalLink,
  Globe,
  MessageSquare
} from 'lucide-react';
import { User, FriendshipDoc } from '../types';
import { openDirectMessageWithUser } from './UnifiedFloatingMessenger';
import { 
  searchUsersByQuery, 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  listenToFriendships,
  listenToUsersProfiles,
  createBattleInvitation
} from '../lib/friendsAndBattles';

interface FriendsModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onInviteToBattle?: (friend: User) => void;
}

export interface FriendsSectionProps {
  currentUser: User;
  onInviteToBattle?: (friend: User) => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({
  currentUser,
  onInviteToBattle,
  showCloseButton = false,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendships, setFriendships] = useState<FriendshipDoc[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<User[]>([]);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);

  // Listen to friendships for current user
  useEffect(() => {
    if (!currentUser.id) return;
    const unsubscribe = listenToFriendships(currentUser.id, (docs) => {
      setFriendships(docs);
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  // Derived accepted friend UIDs and pending request UIDs
  const acceptedFriendships = (friendships || []).filter(f => f && f.status === 'accepted');
  const friendUids = acceptedFriendships.map(f => (f.users || []).find(u => u !== currentUser.id)).filter((u): u is string => Boolean(u));
  
  const pendingIncoming = (friendships || []).filter(f => f && f.status === 'pending' && f.requestedBy !== currentUser.id);
  const pendingOutgoingUids = new Set(
    (friendships || []).filter(f => f && f.status === 'pending' && f.requestedBy === currentUser.id)
      .map(f => (f.users || []).find(u => u !== currentUser.id))
      .filter((u): u is string => Boolean(u))
  );

  // Listen to profiles of accepted friends
  useEffect(() => {
    if (friendUids.length === 0) {
      setFriendsProfiles([]);
      return;
    }
    const unsubscribe = listenToUsersProfiles(friendUids, (profiles) => {
      setFriendsProfiles(profiles);
    });
    return () => unsubscribe();
  }, [JSON.stringify(friendUids)]);

  // Handle search submit/change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchUsersByQuery(searchQuery, currentUser.id);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser.id]);

  const handleSendRequest = async (targetUser: User) => {
    setSendingRequestTo(targetUser.id);
    await sendFriendRequest(currentUser.id, targetUser.id);
    setSendingRequestTo(null);
  };

  const handleAccept = async (friendshipId: string) => {
    await acceptFriendRequest(friendshipId);
  };

  const handleDecline = async (friendshipId: string) => {
    await declineFriendRequest(friendshipId);
  };

  const handleInviteBattle = async (friend: User) => {
    if (onInviteToBattle) {
      onInviteToBattle(friend);
    } else {
      setInvitingFriendId(friend.id);
      try {
        await createBattleInvitation(currentUser, friend);
        alert(`¡Invitación a Live Battle enviada a ${friend.displayName || friend.name}!`);
      } catch (e) {
        console.error('Error inviting to battle:', e);
      } finally {
        setInvitingFriendId(null);
      }
    }
  };

  return (
    <div className="w-full bg-[#141414] border border-[#D9A9FF]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-[#1c1a1a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#D9A9FF]/15 border border-[#D9A9FF]/30 text-[#D9A9FF]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
              Amigos & Compañeros de Waacking
              <Sparkles className="w-4 h-4 text-[#D9A9FF]" />
            </h2>
            <p className="text-xs text-slate-400">
              Conecta, agrega bailarines e invítalos a Live Battles en tiempo real
            </p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Cerrar modal de amigos"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#101010] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'friends'
                ? 'border-[#D9A9FF] text-[#D9A9FF] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Mis Amigos ({friendsProfiles.length})
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'search'
                ? 'border-[#D9A9FF] text-[#D9A9FF] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Buscar Bailarines
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors flex items-center gap-2 border-b-2 relative ${
              activeTab === 'requests'
                ? 'border-[#D9A9FF] text-[#D9A9FF] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Solicitudes
            {pendingIncoming.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-pink-500 text-white rounded-full">
                {pendingIncoming.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {/* TAB 1: FRIENDS LIST */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friendsProfiles.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">Aún no tienes amigos agregados</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Ve a la pestaña <strong>"Buscar Bailarines"</strong> para encontrar compañeros por su @username.
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-4 px-4 py-2 bg-[#D9A9FF] text-black font-extrabold text-xs rounded-xl uppercase hover:brightness-110 transition-all inline-flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5" /> Buscar Bailarines
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(friendsProfiles || []).map((friend) => {
                    const isOnline = friend.status === 'online';
                    const isInBattle = friend.status === 'in_battle';

                    return (
                      <div 
                        key={friend.id}
                        className="p-3.5 bg-[#1a1818] border border-white/10 rounded-2xl flex items-center justify-between hover:border-[#D9A9FF]/40 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img 
                              src={friend.avatar || friend.photoURL} 
                              alt={friend.name}
                              className="w-11 h-11 rounded-full object-cover border border-white/20" 
                            />
                            <span 
                              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1818] ${
                                isInBattle ? 'bg-amber-400 animate-pulse' : isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                              }`}
                              title={isInBattle ? 'En Batalla' : isOnline ? 'En línea' : 'Desconectado'}
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white truncate group-hover:text-[#D9A9FF] transition-colors">
                              {friend.displayName || friend.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              @{friend.username || friend.id.slice(0, 8)}
                            </p>
                            
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${
                                isInBattle 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                  : isOnline 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {isInBattle ? '⚔️ En Batalla' : isOnline ? '🟢 En línea' : '⚪ Desconectado'}
                              </span>

                              {/* Instagram & Platform Social Links */}
                              <a
                                href={`https://instagram.com/${friend.instagram ? friend.instagram.replace('@', '') : friend.username || 'waackon'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2 py-0.5 rounded-md transition-all"
                                title="Ver Instagram de este bailarín"
                              >
                                <Instagram className="w-2.5 h-2.5 text-rose-400" />
                                <span>@{friend.instagram ? friend.instagram.replace('@', '') : friend.username || 'ig'}</span>
                              </a>

                              <span 
                                className="inline-flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md cursor-pointer hover:bg-cyan-500/20 transition-all"
                                title="Link oficial de perfil en la plataforma WAACK ON"
                              >
                                <Globe className="w-2.5 h-2.5 text-cyan-400" />
                                <span>waackon.app/@{friend.username || friend.id.slice(0, 6)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openDirectMessageWithUser(friend)}
                            className="px-3 py-1.5 bg-[#252525] hover:bg-[#D9A9FF] text-gray-200 hover:text-black border border-white/10 hover:border-[#D9A9FF] rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Enviar mensaje directo"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Mensaje</span>
                          </button>

                          <button
                            onClick={() => handleInviteBattle(friend)}
                            disabled={invitingFriendId === friend.id}
                            className="px-3 py-1.5 bg-[#D9A9FF]/20 hover:bg-[#D9A9FF] text-[#D9A9FF] hover:text-black border border-[#D9A9FF]/40 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Enviar invitación directa para Live Battle"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            {invitingFriendId === friend.id ? 'Invitando...' : 'Invitar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEARCH USERS */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por @username, nombre o ID (ej: monroe_waacking)..."
                  className="w-full bg-[#1e1c1c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D9A9FF]"
                />
              </div>

              {isSearching ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Buscando bailarines...
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-white/10 rounded-xl">
                  No se encontraron bailarines con ese nombre o usuario.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(searchResults || []).map((user) => {
                    const isAlreadyFriend = friendUids.includes(user.id);
                    const isPendingSent = pendingOutgoingUids.has(user.id);

                    return (
                      <div 
                        key={user.id}
                        className="p-3 bg-[#1a1818] border border-white/10 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={user.avatar || user.photoURL} 
                            alt={user.name} 
                            className="w-9 h-9 rounded-full object-cover border border-white/10" 
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white truncate">
                              {user.displayName || user.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono">
                              @{user.username || user.id}
                            </p>
                          </div>
                        </div>

                        {isAlreadyFriend ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg uppercase flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Amigo
                            </span>
                            <button
                              onClick={() => openDirectMessageWithUser(user)}
                              className="px-2.5 py-1 bg-[#252525] hover:bg-[#D9A9FF] text-gray-200 hover:text-black border border-white/10 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                              title="Enviar mensaje directo"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat</span>
                            </button>
                          </div>
                        ) : isPendingSent ? (
                          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Solicitud Enviada
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(user)}
                            disabled={sendingRequestTo === user.id}
                            className="px-3 py-1.5 bg-[#D9A9FF] hover:bg-[#BA7EFF] text-black font-extrabold text-[10px] rounded-lg uppercase transition-all flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            {sendingRequestTo === user.id ? 'Enviando...' : 'Agregar'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PENDING REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {pendingIncoming.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold">No tienes solicitudes de amistad pendientes</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(pendingIncoming || []).map((req) => {
                  const senderUid = req.requestedBy;
                  return (
                    <PendingRequestCard 
                      key={req.id} 
                      friendshipId={req.id}
                      senderUid={senderUid}
                      onAccept={() => handleAccept(req.id)}
                      onDecline={() => handleDecline(req.id)}
                    />
                  );
                })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

export const FriendsModal: React.FC<FriendsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onInviteToBattle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col"
      >
        <FriendsSection
          currentUser={currentUser}
          onInviteToBattle={onInviteToBattle}
          showCloseButton={true}
          onClose={onClose}
        />
      </motion.div>
    </div>
  );
};

interface PendingRequestCardProps {
  key?: string;
  friendshipId: string;
  senderUid: string;
  onAccept: () => void;
  onDecline: () => void;
}

function PendingRequestCard({ 
  friendshipId, 
  senderUid, 
  onAccept, 
  onDecline 
}: PendingRequestCardProps) {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = listenToUsersProfiles([senderUid], (users) => {
      if (users.length > 0) setProfile(users[0]);
    });
    return () => unsubscribe();
  }, [senderUid]);

  return (
    <div className="p-3.5 bg-[#1a1818] border border-[#D9A9FF]/30 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img 
          src={profile?.avatar || profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'} 
          alt={profile?.name} 
          className="w-10 h-10 rounded-full object-cover border border-white/20" 
        />
        <div>
          <h4 className="text-xs font-black text-white">
            {profile?.displayName || profile?.name || 'Bailarín'}
          </h4>
          <p className="text-[10px] text-slate-400 font-mono">
            @{profile?.username || senderUid.slice(0, 8)} te ha enviado una solicitud de amistad
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-colors flex items-center gap-1 text-xs"
          title="Aceptar solicitud"
        >
          <Check className="w-4 h-4" /> Aceptar
        </button>
        <button
          onClick={onDecline}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-xs"
          title="Rechazar solicitud"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
