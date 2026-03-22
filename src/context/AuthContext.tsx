import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, BuddyAvailability, ChatGroup, ChatMessage, WeekendPoll, PollVote } from '../data/mockUsers';
import { mockUsers, mockAvailability, mockChatGroups, mockWeekendPolls } from '../data/mockUsers';
import { Storage } from '../utils/storage';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  availability: BuddyAvailability[];
  chatGroups: ChatGroup[];
  weekendPolls: WeekendPoll[];
  session: Session | null;
  loading: boolean;
  login: (email: string) => boolean;
  loginWithSupabase: (email: string, password: string) => Promise<{ error: string | null }>;
  registerWithSupabase: (email: string, password: string, meta: Omit<User, 'id' | 'createdAt' | 'email'>) => Promise<{ error: string | null }>;
  register: (user: Omit<User, 'id' | 'createdAt'>) => void;
  logout: () => void;
  setMyAvailability: (avail: Omit<BuddyAvailability, 'userId'>) => void;
  getMyAvailability: () => BuddyAvailability | undefined;
  toggleFreeNow: (until: string) => void;
  createChatGroup: (name: string, memberIds: string[], teeDate?: string, teeTime?: string) => ChatGroup;
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

// Convert Supabase profile row to app User type
function profileToUser(p: Record<string, unknown>): User {
  return {
    id: p.id as string,
    firstName: p.first_name as string,
    lastName: p.last_name as string,
    email: p.email as string,
    phone: (p.phone as string) || '',
    skillLevel: (p.skill_level as User['skillLevel']) || 'Beginner',
    gender: (p.gender as User['gender']) || 'Prefer not to say',
    address: (p.address as string) || '',
    lat: (p.lat as number) || 37.7749,
    lng: (p.lng as number) || -122.4194,
    createdAt: p.created_at ? new Date(p.created_at as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = Storage.getSync(STORAGE_KEYS.currentUser);
    return stored ? JSON.parse(stored) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const stored = Storage.getSync(STORAGE_KEYS.users);
    return stored ? JSON.parse(stored) : mockUsers;
  });

  const [availability, setAvailability] = useState<BuddyAvailability[]>(() => {
    const stored = Storage.getSync(STORAGE_KEYS.availability);
    return stored ? JSON.parse(stored) : mockAvailability;
  });

  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(() => {
    const stored = Storage.getSync(STORAGE_KEYS.chatGroups);
    return stored ? JSON.parse(stored) : mockChatGroups;
  });

  const [weekendPolls, setWeekendPolls] = useState<WeekendPoll[]>(() => {
    const stored = Storage.getSync(STORAGE_KEYS.weekendPolls);
    return stored ? JSON.parse(stored) : mockWeekendPolls;
  });

  // Load Supabase profile for authenticated user (creates profile if missing)
  const loadSupabaseProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      const user = profileToUser(data);
      setCurrentUser(user);
      setAllUsers(prev => {
        const exists = prev.some(u => u.id === user.id);
        return exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
      });
      return;
    }

    // Profile missing (trigger may have failed) — create it from auth metadata
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const meta = authUser.user_metadata || {};
    const profileRow = {
      id: userId,
      first_name: meta.first_name || '',
      last_name: meta.last_name || '',
      email: authUser.email || '',
      phone: meta.phone || '',
      skill_level: meta.skill_level || 'Beginner',
      gender: meta.gender || 'Prefer not to say',
      address: meta.address || '',
      lat: meta.lat ?? 37.7749,
      lng: meta.lng ?? -122.4194,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('profiles')
      .upsert(profileRow, { onConflict: 'id' })
      .select()
      .single();

    if (insertErr) {
      console.error('[GolfBuddy] Failed to create profile fallback:', insertErr.message);
      // Still set a user from metadata so the app is usable
      const fallbackUser: User = {
        id: userId,
        firstName: meta.first_name || '',
        lastName: meta.last_name || '',
        email: authUser.email || '',
        phone: meta.phone || '',
        skillLevel: meta.skill_level || 'Beginner',
        gender: meta.gender || 'Prefer not to say',
        address: meta.address || '',
        lat: meta.lat ?? 37.7749,
        lng: meta.lng ?? -122.4194,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(fallbackUser);
      setAllUsers(prev => [...prev, fallbackUser]);
      return;
    }

    if (inserted) {
      const user = profileToUser(inserted);
      setCurrentUser(user);
      setAllUsers(prev => [...prev, user]);
    }
  }, []);

  // Listen for Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadSupabaseProfile(s.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadSupabaseProfile(s.user.id);
      } else if (_event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSupabaseProfile]);

  // Hydrate from native storage on mount (async)
  useEffect(() => {
    async function hydrate() {
      const [user, users, avail, groups, polls] = await Promise.all([
        Storage.get(STORAGE_KEYS.currentUser),
        Storage.get(STORAGE_KEYS.users),
        Storage.get(STORAGE_KEYS.availability),
        Storage.get(STORAGE_KEYS.chatGroups),
        Storage.get(STORAGE_KEYS.weekendPolls),
      ]);
      if (user && !session) setCurrentUser(JSON.parse(user));
      if (users) setAllUsers(JSON.parse(users));
      if (avail) setAvailability(JSON.parse(avail));
      if (groups) setChatGroups(JSON.parse(groups));
      if (polls) setWeekendPolls(JSON.parse(polls));
    }
    hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentUser) {
      Storage.set(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    } else {
      Storage.remove(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.users, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.availability, JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.chatGroups, JSON.stringify(chatGroups));
  }, [chatGroups]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.weekendPolls, JSON.stringify(weekendPolls));
  }, [weekendPolls]);

  // Supabase email+password login
  const loginWithSupabase = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  // Supabase email+password registration
  const registerWithSupabase = async (
    email: string,
    password: string,
    meta: Omit<User, 'id' | 'createdAt' | 'email'>
  ): Promise<{ error: string | null }> => {
    console.log('[GolfBuddy] signUp request for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: meta.firstName,
          last_name: meta.lastName,
          phone: meta.phone || '',
          skill_level: meta.skillLevel || 'Beginner',
          gender: meta.gender || 'Prefer not to say',
          address: meta.address || '',
          lat: meta.lat ?? 37.7749,
          lng: meta.lng ?? -122.4194,
        },
      },
    });
    if (error) {
      console.error('[GolfBuddy] signUp error:', JSON.stringify(error, null, 2));
      return { error: error.message };
    }
    console.log('[GolfBuddy] signUp success, user:', data.user?.id, 'session:', !!data.session);

    // Profile is created automatically by the handle_new_user() DB trigger
    // which reads all fields from raw_user_meta_data (runs as security definer)
    return { error: null };
  };

  // Legacy mock login (kept for demo accounts)
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

  const logout = async () => {
    // Sign out of Supabase if there's a session
    if (session) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const setMyAvailability = (avail: Omit<BuddyAvailability, 'userId'>) => {
    if (!currentUser) return;
    const newAvail: BuddyAvailability = { ...avail, userId: currentUser.id };
    setAvailability(prev => {
      const filtered = prev.filter(a => a.userId !== currentUser.id);
      return [...filtered, newAvail];
    });

    // Sync to Supabase if authenticated
    if (session) {
      supabase.from('buddy_availability').upsert({
        user_id: currentUser.id,
        available_dates: avail.availableDates,
        available_times: avail.availableTimes,
        preferred_course_id: avail.preferredCourseId,
        alternate_course_ids: avail.alternateCourseIds,
        needs_ride: avail.needsRide || false,
        can_offer_ride: avail.canOfferRide || false,
        ride_note: avail.rideNote || '',
        is_free_now: avail.isFreeNow || false,
        free_now_until: avail.freeNowUntil || null,
      }, { onConflict: 'user_id' });
    }
  };

  const getMyAvailability = (): BuddyAvailability | undefined => {
    if (!currentUser) return undefined;
    return availability.find(a => a.userId === currentUser.id);
  };

  const createChatGroup = (name: string, memberIds: string[], teeDate?: string, teeTime?: string): ChatGroup => {
    const group: ChatGroup = {
      id: `group-${Date.now()}`,
      name,
      memberIds: currentUser ? [currentUser.id, ...memberIds] : memberIds,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      messages: [],
      ...(teeDate && { teeDate }),
      ...(teeTime && { teeTime }),
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

    // Sync to Supabase if authenticated
    if (session) {
      supabase.from('chat_messages').insert({
        group_id: groupId,
        sender_id: currentUser.id,
        text,
      });
    }
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
      session, loading,
      login, loginWithSupabase, registerWithSupabase,
      register, logout,
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
