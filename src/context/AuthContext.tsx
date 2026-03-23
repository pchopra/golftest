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
  deleteGroup: (groupId: string) => void;
  addGroupMember: (groupId: string, userId: string) => void;
  removeGroupMember: (groupId: string, userId: string) => void;
  makeGroupAdmin: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendMessage: (groupId: string, text: string) => void;
  createWeekendPoll: (groupId: string, customDates?: string[], customTimes?: string[]) => WeekendPoll;
  voteOnPoll: (pollId: string, vote: Omit<PollVote, 'userId'>) => void;
  updateProfilePicture: (dataUrl: string) => Promise<void> | void;
  updateProfile: (fields: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'skillLevel' | 'gender' | 'address' | 'lat' | 'lng'>>) => Promise<void>;
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
    firstName: (p.first_name as string) || '',
    lastName: (p.last_name as string) || '',
    email: (p.email as string) || '',
    phone: (p.phone as string) || '',
    skillLevel: (p.skill_level as User['skillLevel']) || 'Beginner',
    gender: (p.gender as User['gender']) || 'Prefer not to say',
    address: (p.address as string) || '',
    lat: (p.lat as number) || 37.7749,
    lng: (p.lng as number) || -122.4194,
    profilePicture: (p.profile_picture as string) || undefined,
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

  // Build a fallback User from Supabase auth session so the app never gets stuck
  const buildFallbackUser = useCallback((userId: string, email: string, meta: Record<string, unknown> = {}): User => ({
    id: userId,
    firstName: (meta.first_name as string) || '',
    lastName: (meta.last_name as string) || '',
    email: email || '',
    phone: (meta.phone as string) || '',
    skillLevel: ((meta.skill_level as string) || 'Beginner') as User['skillLevel'],
    gender: ((meta.gender as string) || 'Prefer not to say') as User['gender'],
    address: (meta.address as string) || '',
    lat: (meta.lat as number) ?? 37.7749,
    lng: (meta.lng as number) ?? -122.4194,
    profilePicture: (meta.profile_picture as string) || undefined,
    createdAt: new Date().toISOString().split('T')[0],
  }), []);

  // Load Supabase profile for authenticated user (creates profile if missing)
  const loadSupabaseProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const user = profileToUser(data);
        // Overlay profile picture from auth user_metadata (not stored in DB)
        const { data: authData } = await supabase.auth.getUser();
        const pic = authData?.user?.user_metadata?.profile_picture;
        if (pic) user.profilePicture = pic as string;
        setCurrentUser(user);
        setAllUsers(prev => {
          const exists = prev.some(u => u.id === user.id);
          return exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
        });
        return;
      }
    } catch (err) {
      console.error('[GolfBuddy] Profile query failed:', err);
    }

    // Profile missing (trigger may have failed) — create it from auth metadata
    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (!authUser) {
        // No auth user — set a minimal fallback so the app doesn't blank out
        const minimal = buildFallbackUser(userId, '');
        setCurrentUser(minimal);
        setAllUsers(prev => [...prev, minimal]);
        return;
      }

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

      if (inserted && !insertErr) {
        const user = profileToUser(inserted);
        setCurrentUser(user);
        setAllUsers(prev => [...prev, user]);
        return;
      }

      // Upsert failed — use fallback from auth metadata
      console.error('[GolfBuddy] Profile upsert failed:', insertErr?.message);
      const fallbackUser = buildFallbackUser(userId, authUser.email || '', meta);
      setCurrentUser(fallbackUser);
      setAllUsers(prev => [...prev, fallbackUser]);
    } catch (err) {
      console.error('[GolfBuddy] Profile creation failed:', err);
      const minimal = buildFallbackUser(userId, '');
      setCurrentUser(minimal);
      setAllUsers(prev => [...prev, minimal]);
    }
  }, [buildFallbackUser]);

  // Fetch all profiles + availability from Supabase so other users' buddies are visible
  const loadAllBuddies = useCallback(async () => {
    try {
      const [{ data: profiles }, { data: availRows }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('buddy_availability').select('*'),
      ]);

      if (profiles && profiles.length > 0) {
        const supaUsers = profiles.map((p: Record<string, unknown>) => profileToUser(p));
        setAllUsers(prev => {
          // Merge: Supabase profiles take precedence, keep mock users that don't collide
          const supaIds = new Set(supaUsers.map((u: User) => u.id));
          const kept = prev.filter(u => !supaIds.has(u.id));
          return [...kept, ...supaUsers];
        });
      }

      if (availRows && availRows.length > 0) {
        const supaAvail: BuddyAvailability[] = availRows.map((r: Record<string, unknown>) => ({
          userId: r.user_id as string,
          availableDates: (r.available_dates as string[]) || [],
          availableTimes: (r.available_times as string[]) || [],
          preferredCourseId: (r.preferred_course_id as string) || '',
          alternateCourseIds: (r.alternate_course_ids as string[]) || [],
          needsRide: (r.needs_ride as boolean) || false,
          canOfferRide: (r.can_offer_ride as boolean) || false,
          rideNote: (r.ride_note as string) || '',
          isFreeNow: (r.is_free_now as boolean) || false,
          freeNowUntil: (r.free_now_until as string) || undefined,
        }));
        setAvailability(prev => {
          const supaUserIds = new Set(supaAvail.map(a => a.userId));
          const kept = prev.filter(a => !supaUserIds.has(a.userId));
          return [...kept, ...supaAvail];
        });
      }
    } catch (err) {
      console.error('[GolfBuddy] Failed to load buddies from Supabase:', err);
    }
  }, []);

  // Listen for Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        try { await loadSupabaseProfile(s.user.id); } catch (e) { console.error('[GolfBuddy] getSession profile load failed:', e); }
        // Fetch all profiles + availability so buddy list is up to date
        loadAllBuddies();
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (_event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      // Note: profile loading is handled by getSession (on mount) and loginWithSupabase (on sign-in)
    });

    return () => subscription.unsubscribe();
  }, [loadSupabaseProfile, loadAllBuddies]);

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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        await loadSupabaseProfile(data.user.id);
      }
      return { error: null };
    } catch (e) {
      console.error('[GolfBuddy] loginWithSupabase error:', e);
      return { error: 'Login failed. Please try again.' };
    }
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

    // signUp may not return a session (e.g. email confirmation flow).
    // Sign in immediately to guarantee a valid session for the profile upsert.
    let activeSession = data.session;
    if (!activeSession) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        console.error('[GolfBuddy] Auto sign-in after signup failed:', signInErr.message);
      } else {
        activeSession = signInData.session;
      }
    }

    if (activeSession) {
      setSession(activeSession);
    }

    // Ensure the profile row exists (DB trigger may not fire in all environments)
    if (data.user) {
      const profileRow = {
        id: data.user.id,
        first_name: meta.firstName,
        last_name: meta.lastName,
        email,
        phone: meta.phone || '',
        skill_level: meta.skillLevel || 'Beginner',
        gender: meta.gender || 'Prefer not to say',
        address: meta.address || '',
        lat: meta.lat ?? 37.7749,
        lng: meta.lng ?? -122.4194,
      };
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileRow, { onConflict: 'id' });
      if (upsertErr) {
        console.error('[GolfBuddy] Profile upsert after signup failed:', upsertErr.message);
      }

      await loadSupabaseProfile(data.user.id);
      loadAllBuddies();
    }

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

  const updateProfilePicture = async (dataUrl: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, profilePicture: dataUrl };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    // Save to Supabase auth user_metadata (works without a DB column)
    if (session) {
      const { error } = await supabase.auth.updateUser({
        data: { profile_picture: dataUrl },
      });
      if (error) {
        console.error('[GolfBuddy] Failed to save profile picture:', error.message);
      }
    }
  };

  const updateProfile = async (fields: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'skillLevel' | 'gender' | 'address' | 'lat' | 'lng'>>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...fields };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));

    if (session) {
      const dbFields: Record<string, unknown> = {};
      if (fields.firstName !== undefined) dbFields.first_name = fields.firstName;
      if (fields.lastName !== undefined) dbFields.last_name = fields.lastName;
      if (fields.phone !== undefined) dbFields.phone = fields.phone;
      if (fields.skillLevel !== undefined) dbFields.skill_level = fields.skillLevel;
      if (fields.gender !== undefined) dbFields.gender = fields.gender;
      if (fields.address !== undefined) dbFields.address = fields.address;
      if (fields.lat !== undefined) dbFields.lat = fields.lat;
      if (fields.lng !== undefined) dbFields.lng = fields.lng;

      const { error } = await supabase
        .from('profiles')
        .update(dbFields)
        .eq('id', currentUser.id);
      if (error) {
        console.error('[GolfBuddy] Profile update failed:', error.message);
      }
    }
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
    const creatorId = currentUser?.id || '';
    const group: ChatGroup = {
      id: `group-${Date.now()}`,
      name,
      memberIds: currentUser ? [...new Set([currentUser.id, ...memberIds])] : memberIds,
      adminIds: creatorId ? [creatorId] : [],
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
      messages: [],
      ...(teeDate && { teeDate }),
      ...(teeTime && { teeTime }),
    };
    setChatGroups(prev => [...prev, group]);
    return group;
  };

  const deleteGroup = (groupId: string) => {
    if (!currentUser) return;
    setChatGroups(prev => {
      const group = prev.find(g => g.id === groupId);
      if (!group) return prev;
      if (!group.memberIds.includes(currentUser.id)) return prev;
      return prev.filter(g => g.id !== groupId);
    });
    setWeekendPolls(prev => prev.filter(p => p.groupId !== groupId));
  };

  const addGroupMember = (groupId: string, userId: string) => {
    if (!currentUser) return;
    setChatGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      if (!(g.adminIds || []).includes(currentUser.id)) return g;
      if (g.memberIds.includes(userId)) return g;
      return { ...g, memberIds: [...g.memberIds, userId] };
    }));
  };

  const removeGroupMember = (groupId: string, userId: string) => {
    if (!currentUser) return;
    setChatGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      if (!(g.adminIds || []).includes(currentUser.id)) return g;
      return {
        ...g,
        memberIds: g.memberIds.filter(id => id !== userId),
        adminIds: (g.adminIds || []).filter(id => id !== userId),
      };
    }));
  };

  const makeGroupAdmin = (groupId: string, userId: string) => {
    if (!currentUser) return;
    setChatGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      if (!(g.adminIds || []).includes(currentUser.id)) return g;
      if ((g.adminIds || []).includes(userId)) return g;
      return { ...g, adminIds: [...(g.adminIds || []), userId] };
    }));
  };

  const leaveGroup = (groupId: string) => {
    if (!currentUser) return;
    setChatGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const newMembers = g.memberIds.filter(id => id !== currentUser.id);
      const newAdmins = (g.adminIds || []).filter(id => id !== currentUser.id);
      // If no members left, remove the group
      if (newMembers.length === 0) return { ...g, memberIds: [] };
      // If leaving admin left no admins, promote the first member
      const finalAdmins = newAdmins.length === 0 ? [newMembers[0]] : newAdmins;
      return { ...g, memberIds: newMembers, adminIds: finalAdmins };
    }).filter(g => g.memberIds.length > 0));
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

  const createWeekendPoll = (groupId: string, customDates?: string[], customTimes?: string[]): WeekendPoll => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysUntilSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    const satStr = sat.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];

    const dateOptions = customDates && customDates.length > 0 ? [...customDates].sort() : [satStr, sunStr];
    const timeOptions = customTimes && customTimes.length > 0 ? customTimes : ['7:00 AM', '9:30 AM', '11:00 AM', '2:00 PM'];

    const poll: WeekendPoll = {
      id: `poll-${Date.now()}`,
      groupId,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      weekendDate: dateOptions[0] || satStr,
      dateOptions,
      timeOptions,
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
      createChatGroup, deleteGroup, addGroupMember, removeGroupMember, makeGroupAdmin, leaveGroup, sendMessage,
      createWeekendPoll, voteOnPoll, updateProfilePicture, updateProfile,
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
