import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, sanitizeFirestoreData } from '../firebase';
import { User, FriendshipDoc, BattleDoc } from '../types';

/**
 * Ensures user profile document is saved/updated in Firestore `users/{uid}`
 */
export async function upsertUserProfile(user: User, customUsername?: string) {
  const activeAuthUser = auth.currentUser;
  if (!activeAuthUser) return; // Skip Firestore write if user is not authenticated with Firebase Auth

  const targetUid = activeAuthUser.uid;
  const path = `users/${targetUid}`;
  try {
    const defaultUsername = customUsername || user.username || (user.name || 'user').toLowerCase().replace(/\s+/g, '_') + '_' + targetUid.slice(-4);
    const userPayload = {
      uid: targetUid,
      id: targetUid,
      name: user.name,
      username: defaultUsername,
      displayName: user.displayName || user.name,
      photoURL: user.photoURL || user.avatar,
      avatar: user.avatar,
      role: user.role || 'student',
      status: user.status || 'online',
      isOnline: user.status === 'online' || user.status === 'in_battle' || true,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', targetUid), sanitizeFirestoreData(userPayload), { merge: true });
  } catch (err) {
    console.warn('Notice: Could not sync user profile to Firestore:', err);
  }
}

/**
 * Update user presence status ('online' | 'in_battle' | 'offline')
 */
export async function updateUserStatus(userId: string, status: 'online' | 'in_battle' | 'offline') {
  const activeAuthUser = auth.currentUser;
  if (!activeAuthUser) return; // Skip Firestore write if user is not authenticated with Firebase Auth

  const targetUid = activeAuthUser.uid;
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      status,
      isOnline: status !== 'offline',
      lastActiveDate: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Notice: Could not update user status in Firestore:', err);
  }
}

/**
 * Search dancers by username, displayName, or ID
 */
export async function searchUsersByQuery(searchQuery: string, currentUserId: string): Promise<User[]> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), limit(50));
    const snap = await getDocs(q);
    const term = searchQuery.toLowerCase().trim();
    
    const results: User[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.id === currentUserId || data.uid === currentUserId) return;

      const uname = (data.username || '').toLowerCase();
      const dname = (data.displayName || data.name || '').toLowerCase();
      const uid = (data.id || data.uid || '').toLowerCase();

      if (!term || uname.includes(term) || dname.includes(term) || uid.includes(term)) {
        results.push({
          id: data.id || data.uid,
          name: data.displayName || data.name || 'Bailarín',
          username: data.username || uname,
          displayName: data.displayName || data.name,
          avatar: data.photoURL || data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          photoURL: data.photoURL || data.avatar,
          role: data.role || 'student',
          status: data.status || (data.isOnline ? 'online' : 'offline'),
          isOnline: data.isOnline !== false,
          completedLessons: data.completedLessons || [],
          points: data.points || 0
        });
      }
    });

    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

/**
 * Send a friend request to a target user
 */
export async function sendFriendRequest(currentUserId: string, targetUserId: string) {
  const path = 'friendships';
  try {
    const friendshipId = [currentUserId, targetUserId].sort().join('_');
    const friendshipData: FriendshipDoc = {
      id: friendshipId,
      users: [currentUserId, targetUserId],
      status: 'pending',
      requestedBy: currentUserId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'friendships', friendshipId), sanitizeFirestoreData(friendshipData), { merge: true });
    return friendshipId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Accept a pending friend request
 */
export async function acceptFriendRequest(friendshipId: string) {
  const path = `friendships/${friendshipId}`;
  try {
    await updateDoc(doc(db, 'friendships', friendshipId), {
      status: 'accepted'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Decline/reject or cancel a friend request
 */
export async function declineFriendRequest(friendshipId: string) {
  const path = `friendships/${friendshipId}`;
  try {
    await updateDoc(doc(db, 'friendships', friendshipId), {
      status: 'declined'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Real-time listener for friendships associated with current user
 */
export function listenToFriendships(userId: string, callback: (friendships: FriendshipDoc[]) => void) {
  if (!userId || !auth.currentUser) {
    callback([]);
    return () => {};
  }
  const path = 'friendships';
  const q = query(collection(db, 'friendships'), where('users', 'array-contains', userId));
  
  return onSnapshot(q, (snapshot) => {
    const friendships: FriendshipDoc[] = [];
    snapshot.forEach((docSnap) => {
      friendships.push(docSnap.data() as FriendshipDoc);
    });
    callback(friendships);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

/**
 * Real-time listener for user profiles by ID array
 */
export function listenToUsersProfiles(userUids: string[], callback: (users: User[]) => void) {
  if (!userUids || userUids.length === 0 || !auth.currentUser) {
    callback([]);
    return () => {};
  }
  const path = 'users';
  const q = query(collection(db, 'users'));
  
  return onSnapshot(q, (snapshot) => {
    const userMap = new Map<string, User>();
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = data.id || data.uid;
      if (userUids.includes(uid)) {
        userMap.set(uid, {
          id: uid,
          name: data.displayName || data.name || 'Bailarín',
          username: data.username || uid,
          displayName: data.displayName || data.name,
          avatar: data.photoURL || data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          photoURL: data.photoURL || data.avatar,
          role: data.role || 'student',
          status: data.status || (data.isOnline ? 'online' : 'offline'),
          isOnline: data.isOnline !== false,
          completedLessons: data.completedLessons || [],
          points: data.points || 0
        });
      }
    });

    // Ensure all requested UIDs exist in callback
    const resultList: User[] = userUids.map(uid => {
      if (userMap.has(uid)) {
        return userMap.get(uid)!;
      }
      return {
        id: uid,
        name: 'Bailarín ' + uid.slice(-4),
        username: 'user_' + uid.slice(-4),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        role: 'student',
        status: 'offline',
        isOnline: false,
        completedLessons: [],
        points: 0
      };
    });

    callback(resultList);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

/**
 * Create a live battle session invitation
 */
export async function createBattleInvitation(hostUser: User, guestUser: User): Promise<string> {
  const path = 'battles';
  try {
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const battleData: BattleDoc = {
      id: battleId,
      battleId,
      hostId: hostUser.id,
      hostName: hostUser.displayName || hostUser.name,
      hostAvatar: hostUser.avatar || hostUser.photoURL,
      guestId: guestUser.id,
      guestName: guestUser.displayName || guestUser.name,
      guestAvatar: guestUser.avatar || guestUser.photoURL,
      tool: 'live_battles',
      status: 'waiting',
      createdAt: new Date().toISOString(),
      currentTrackId: 'track-1',
      roundTimer: 45,
      activeRound: 1,
      hostScore: 0,
      guestScore: 0
    };

    await setDoc(doc(db, 'battles', battleId), sanitizeFirestoreData(battleData));
    return battleId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

/**
 * Real-time listener for incoming battle invitations for guest
 */
export function listenToIncomingBattleInvitations(guestUserId: string, callback: (battles: BattleDoc[]) => void) {
  if (!guestUserId || !auth.currentUser) {
    callback([]);
    return () => {};
  }
  const path = 'battles';
  const q = query(
    collection(db, 'battles'), 
    where('guestId', '==', guestUserId), 
    where('status', '==', 'waiting')
  );

  return onSnapshot(q, (snapshot) => {
    const battles: BattleDoc[] = [];
    snapshot.forEach((docSnap) => {
      battles.push(docSnap.data() as BattleDoc);
    });
    callback(battles);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

/**
 * Real-time listener for a specific battle session
 */
export function listenToBattleSession(battleId: string, callback: (battle: BattleDoc | null) => void) {
  if (!battleId || !auth.currentUser) {
    callback(null);
    return () => {};
  }
  const path = `battles/${battleId}`;
  
  return onSnapshot(doc(db, 'battles', battleId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as BattleDoc);
    } else {
      callback(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

/**
 * Accept or decline a battle invitation
 */
export async function respondToBattleInvitation(battleId: string, responseStatus: 'active' | 'declined') {
  const path = `battles/${battleId}`;
  try {
    await updateDoc(doc(db, 'battles', battleId), {
      status: responseStatus
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Update active battle session state (timer, track, round, scores, status)
 */
export async function updateBattleState(battleId: string, updates: Partial<BattleDoc>) {
  const path = `battles/${battleId}`;
  try {
    await updateDoc(doc(db, 'battles', battleId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
