import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, BuddyAvailability, ChatGroup, ChatMessage, WeekendPoll, PollVote } from '../data/mockUsers';
import { mockUsers, mockAvailability, mockChatGroups, mockWeekendPolls } from '../data/mockUsers';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  availability: BuddyAvailability[];
  chatGroups: ChatGroup[];
  weekendPolls: WeekendPoll[];
  login: (email: string) => boolean;
  register: (user: Omit<User, 'id' | 'createdAt'>) => void;
  logout: () => void;
  setMyAvailability: (avail: Omit<BuddyAvailability, 'userId'>) => void;
  getMyAvailability: () => BuddyAvailability | undefined;
  toggleFreeNow: (until: string) => void;
  createChatGroup: (name: string, memberIds: string[]) => ChatGroup;
  sendMessage: (groupId: string, text: string) => void;
  createWeekendPoll: (groupId: string) => WeekendPoll;
  voteOnPoll: (pollId: string, vote: Omit<PollVote, 'userId'>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  currentUser: 'golf-current-user',
  users: 'golf-users',
  availability: 'golf-availability',
  chatGroups: 'golf-chat-groups',
  weekendPolls: 'golf-weekend-polls',
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

  const [weekendPolls, setWeekendPolls] = useState<WeekendPoll[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.weekendPolls);
    return stored ? JSON.parse(stored) : mockWeekendPolls;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.weekendPolls, JSON.stringify(weekendPolls));
  }, [weekendPolls]);

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

  const toggleFreeNow = (until: string) => {
    if (!currentUser) return;
    setAvailability(prev => {
      const existing = prev.find(a => a.userId === currentUser.id);
      if (existing) {
        return prev.map(a =>
          a.userId === currentUser.id
            ? { ...a, isFreeNow: !a.isFreeNow, freeNowUntil: !a.isFreeNow ? until : undefined }
            : a
        );
      }
      // Create minimal availability if none exists
      return [...prev, {
        userId: currentUser.id,
        availableDates: [],
        availableTimes: [],
        preferredCourseId: '',
        alternateCourseIds: [],
        isFreeNow: true,
        freeNowUntil: until,
      }];
    });
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

  const createWeekendPoll = (groupId: string): WeekendPoll => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysUntilSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    const satStr = sat.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];

    const poll: WeekendPoll = {
      id: `poll-${Date.now()}`,
      groupId,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      weekendDate: satStr,
      dateOptions: [satStr, sunStr],
      timeOptions: ['7:00 AM', '9:30 AM', '11:00 AM', '2:00 PM'],
      votes: [],
      status: 'open',
    };
    setWeekendPolls(prev => [...prev, poll]);
    return poll;
  };

  const voteOnPoll = (pollId: string, vote: Omit<PollVote, 'userId'>) => {
    if (!currentUser) return;
    setWeekendPolls(prev =>
      prev.map(p => {
        if (p.id !== pollId) return p;
        const filtered = p.votes.filter(v => v.userId !== currentUser.id);
        return { ...p, votes: [...filtered, { ...vote, userId: currentUser.id }] };
      })
    );
  };

  return (
    <AuthContext.Provider value={{
      currentUser, allUsers, availability, chatGroups, weekendPolls,
      login, register, logout,
      setMyAvailability, getMyAvailability, toggleFreeNow,
      createChatGroup, sendMessage,
      createWeekendPoll, voteOnPoll,
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
