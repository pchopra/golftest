import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, BuddyAvailability, ChatGroup, ChatMessage } from '../data/mockUsers';
import { mockUsers, mockAvailability, mockChatGroups } from '../data/mockUsers';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  availability: BuddyAvailability[];
  chatGroups: ChatGroup[];
  login: (email: string) => boolean;
  register: (user: Omit<User, 'id' | 'createdAt'>) => void;
  logout: () => void;
  setMyAvailability: (avail: Omit<BuddyAvailability, 'userId'>) => void;
  getMyAvailability: () => BuddyAvailability | undefined;
  createChatGroup: (name: string, memberIds: string[]) => ChatGroup;
  sendMessage: (groupId: string, text: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  currentUser: 'golf-current-user',
  users: 'golf-users',
  availability: 'golf-availability',
  chatGroups: 'golf-chat-groups',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
    return stored ? JSON.parse(stored) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.users);
    return stored ? JSON.parse(stored) : mockUsers;
  });

  const [availability, setAvailability] = useState<BuddyAvailability[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.availability);
    return stored ? JSON.parse(stored) : mockAvailability;
  });

  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.chatGroups);
    return stored ? JSON.parse(stored) : mockChatGroups;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.availability, JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.chatGroups, JSON.stringify(chatGroups));
  }, [chatGroups]);

  const login = (email: string): boolean => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setMyAvailability = (avail: Omit<BuddyAvailability, 'userId'>) => {
    if (!currentUser) return;
    const newAvail: BuddyAvailability = { ...avail, userId: currentUser.id };
    setAvailability(prev => {
      const filtered = prev.filter(a => a.userId !== currentUser.id);
      return [...filtered, newAvail];
    });
  };

  const getMyAvailability = (): BuddyAvailability | undefined => {
    if (!currentUser) return undefined;
    return availability.find(a => a.userId === currentUser.id);
  };

  const createChatGroup = (name: string, memberIds: string[]): ChatGroup => {
    const group: ChatGroup = {
      id: `group-${Date.now()}`,
      name,
      memberIds: currentUser ? [currentUser.id, ...memberIds] : memberIds,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChatGroups(prev => [...prev, group]);
    return group;
  };

  const sendMessage = (groupId: string, text: string) => {
    if (!currentUser) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setChatGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, messages: [...g.messages, msg] } : g
      )
    );
  };

  return (
    <AuthContext.Provider value={{
      currentUser, allUsers, availability, chatGroups,
      login, register, logout,
      setMyAvailability, getMyAvailability,
      createChatGroup, sendMessage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
