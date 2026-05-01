import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { mockCourses } from '../data/mockCourses';
import { hotDeals } from '../data/hotDeals';
import { getDistanceMiles } from '../utils/distance';
import { getCoordinatesForZip } from '../data/zipCoordinates';
import type { BuddyAvailability, User, ChatGroup, WeekendPoll } from '../data/mockUsers';
import {
  Calendar, Clock, MapPin, Users, MessageCircle, Send,
  ChevronRight, Plus, Check, Star, ArrowLeft, Sparkles,
  UserCheck, Users2, Filter, Flame, BarChart3, Eye, Phone,
  Settings, Trash2, LogOut, Shield, UserPlus, UserMinus, X,
  Search, ExternalLink, Mic, Globe, Bell,
} from 'lucide-react';

type MainTab = 'buddies' | 'chat';
type AvailFilter = 'all' | 'two' | 'four' | 'moreThanTwo';

/** Parse "9:30 AM" style time string into hours and minutes (24h). */
function parseTimeString(time: string): { hours: number; minutes: number } {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hours: 9, minutes: 0 };
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

/** Generate and download an .ics calendar file with a 30-min reminder. */
function downloadTeeTimeReminder(groupName: string, teeDate: string, teeTime: string) {
  const { hours, minutes } = parseTimeString(teeTime);
  const start = new Date(`${teeDate}T00:00:00`);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4-hour block

  const fmt = (d: Date) =>
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    'T' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    '00';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GolfBuddy//TeeTime//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${groupName} - Tee Time`,
    `DESCRIPTION:Tee time with ${groupName} at ${teeTime}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Tee time in 30 minutes!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tee-time-${teeDate}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LetsPlayBuddy() {
  const { currentUser, allUsers, availability, chatGroups, weekendPolls, loading, setMyAvailability, getMyAvailability, createChatGroup, deleteGroup, addGroupMember, removeGroupMember, makeGroupAdmin, leaveGroup, sendMessage, createWeekendPoll, voteOnPoll, getUnreadMessageCount, markGroupRead, refreshBuddies } = useAuth();
  const navigate = useNavigate();

  // Always fetch fresh profiles from Supabase when visiting the buddy page
  useEffect(() => { refreshBuddies(); }, [refreshBuddies]);

  const [mainTab, setMainTab] = useState<MainTab>('buddies');
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all');
  const [showSetAvailability, setShowSetAvailability] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showGroupAvailability, setShowGroupAvailability] = useState(false);
  const [groupAvailFilter, setGroupAvailFilter] = useState<AvailFilter>('all');
  const [showPollPanel, setShowPollPanel] = useState(false);
  const [showAvailViewer, setShowAvailViewer] = useState(false);
  const [viewDate, setViewDate] = useState('');
  const [viewTime, setViewTime] = useState('');
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [deleteRevealedGroupId, setDeleteRevealedGroupId] = useState<string | null>(null);
  const [groupCallMembers, setGroupCallMembers] = useState<User[]>([]);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  // Buddy search & favorites
  const [buddySearch, setBuddySearch] = useState('');
  const [favoriteBuddyIds, setFavoriteBuddyIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favoriteBuddyIds') || '[]'); } catch { return []; }
  });

  const toggleFavorite = (userId: string) => {
    setFavoriteBuddyIds(prev => {
      const next = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
      localStorage.setItem('favoriteBuddyIds', JSON.stringify(next));
      return next;
    });
  };

  // Poll voting state
  const [pollSelDates, setPollSelDates] = useState<string[]>([]);
  const [pollSelTimes, setPollSelTimes] = useState<string[]>([]);
  const [pollNeedsRide, setPollNeedsRide] = useState(false);
  const [pollCanOffer, setPollCanOffer] = useState(false);

  // Availability form state
  const [selDates, setSelDates] = useState<string[]>([]);
  const [selTimes, setSelTimes] = useState<string[]>([]);
  const [prefCourse, setPrefCourse] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSearchActive, setCourseSearchActive] = useState('');

  // Pre-populate form with existing availability when opening the sheet
  useEffect(() => {
    if (showSetAvailability) {
      const existing = getMyAvailability();
      if (existing) {
        const todayStr = new Date().toISOString().split('T')[0];
        setSelDates(existing.availableDates.filter(d => d >= todayStr));
        setSelTimes(existing.availableTimes);
        setPrefCourse(existing.preferredCourseId);
      }
    }
  }, [showSetAvailability]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create group state
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroupId, chatGroups]);

  // Mark group as read when user opens a chat
  useEffect(() => {
    if (activeGroupId) markGroupRead(activeGroupId);
  }, [activeGroupId, chatGroups, markGroupRead]);

  // All hooks must be called before any early return (Rules of Hooks)
  // Derive effective lat/lng from user's address zip code (if present), else profile lat/lng
  const userCoords = useMemo(() => {
    if (!currentUser) return { lat: 37.7749, lng: -122.4194, zip: '' };
    const zipMatch = currentUser.address.match(/\b(\d{5})\b/);
    if (zipMatch) {
      const coords = getCoordinatesForZip(zipMatch[1]);
      if (coords) return { lat: coords.lat, lng: coords.lng, zip: zipMatch[1] };
    }
    return { lat: currentUser.lat, lng: currentUser.lng, zip: '' };
  }, [currentUser?.address, currentUser?.lat, currentUser?.lng]);

  const allCoursesWithDistance = useMemo(() =>
    mockCourses
      .map(c => ({ ...c, distance: getDistanceMiles(userCoords.lat, userCoords.lng, c.lat, c.lng) }))
      .sort((a, b) => a.distance - b.distance),
    [userCoords.lat, userCoords.lng]
  );

  // Default: nearest 5 courses (auto-populated from profile location)
  const nearest5 = useMemo(() =>
    allCoursesWithDistance.slice(0, 5),
    [allCoursesWithDistance]
  );

  // Filtered course list based on search query (name or zip)
  const filteredCourseList = useMemo(() => {
    const q = courseSearchActive.trim().toLowerCase();
    if (!q) return nearest5;

    // Zip code search — show nearest 5 within 25mi of that zip
    if (/^\d{5}$/.test(q)) {
      const coords = getCoordinatesForZip(q);
      if (coords) {
        return mockCourses
          .map(c => ({ ...c, distance: getDistanceMiles(coords.lat, coords.lng, c.lat, c.lng) }))
          .filter(c => c.distance <= 25)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);
      }
      return [];
    }

    // Name search — search all courses, not just nearby
    return allCoursesWithDistance.filter(c =>
      c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
    );
  }, [courseSearchActive, nearest5, allCoursesWithDistance]);

  // Determine if the "Set Availability" button should pulse to grab attention.
  // Pulse when: no availability set, or all selected dates are in the past.
  const needsAvailability = useMemo(() => {
    if (!currentUser) return false;
    const myAvail = availability.find(a => a.userId === currentUser.id);
    if (!myAvail || myAvail.availableDates.length === 0) return true;
    const today = new Date().toISOString().split('T')[0];
    return myAvail.availableDates.every(d => d < today);
  }, [currentUser, availability]);

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="px-4 pt-12 pb-28 text-center">
        <div className="w-10 h-10 border-4 border-golf-200 border-t-golf-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="px-4 pt-12 pb-28 text-center">
        <Users size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
        <p className="text-sm text-gray-500 mb-6">Please sign in to find golf buddies and plan tee times together.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

  // Get upcoming dates for the next 7 days
  const upcomingDates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    upcomingDates.push(d.toISOString().split('T')[0]);
  }

  const timeSlots = ['7:00 AM', '9:30 AM', '11:00 AM', '2:00 PM', '3:00 PM'];

  const courseSearchIsName = courseSearchActive.trim().length > 0 && !/^\d{5}$/.test(courseSearchActive.trim());
  const courseGoogleUrl = courseSearchActive.trim()
    ? `https://www.google.com/search?q=${encodeURIComponent(courseSearchActive.trim() + ' golf course tee times')}`
    : '';

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getUserById = (id: string) => allUsers.find(u => u.id === id);
  const getCourseName = (id: string) =>
    id.startsWith('custom:') ? id.slice(7) : (mockCourses.find(c => c.id === id)?.name || 'Unknown');

  // Compute available buddies with their availability and distance
  const buddiesWithAvail = otherUsers.map(user => {
    const avail = availability.find(a => a.userId === user.id);
    const dist = getDistanceMiles(currentUser.lat, currentUser.lng, user.lat, user.lng);
    return { user, avail, distance: dist };
  }).sort((a, b) => a.distance - b.distance);

  // Hot deals near user – 50-mile radius from profile zip code, valid today
  const DEAL_RADIUS_MILES = 50;
  const nearbyDeals = hotDeals
    .filter(d => d.validDays.includes(new Date().getDay()))
    .map(d => ({ ...d, distance: getDistanceMiles(userCoords.lat, userCoords.lng, d.lat, d.lng) }))
    .filter(d => d.distance <= DEAL_RADIUS_MILES)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  // Filter by availability count
  const getFilteredBuddies = (filter: AvailFilter) => {
    const withDates = buddiesWithAvail.filter(b => b.avail && b.avail.availableDates.length > 0);
    switch (filter) {
      case 'two': return withDates.filter((_b, _i, arr) => arr.length >= 2).slice(0, 2);
      case 'four': return withDates.filter((_b, _i, arr) => arr.length >= 4).slice(0, 4);
      case 'moreThanTwo': return withDates.filter((_b, _i, arr) => arr.length > 2);
      default: return buddiesWithAvail;
    }
  };

  // Find common dates among filtered buddies
  const getCommonDates = (buddies: typeof buddiesWithAvail) => {
    if (buddies.length === 0) return [];
    const myAvail = getMyAvailability();
    const allDates = buddies.map(b => b.avail?.availableDates || []);
    if (myAvail) allDates.push(myAvail.availableDates);
    if (allDates.length === 0) return [];
    return allDates[0].filter(date => allDates.every(dates => dates.includes(date)));
  };

  // Find common times
  const getCommonTimes = (buddies: typeof buddiesWithAvail) => {
    if (buddies.length === 0) return [];
    const myAvail = getMyAvailability();
    const allTimes = buddies.map(b => b.avail?.availableTimes || []);
    if (myAvail) allTimes.push(myAvail.availableTimes);
    if (allTimes.length === 0) return [];
    return allTimes[0].filter(time => allTimes.every(times => times.includes(time)));
  };

  const handleSaveAvailability = () => {
    setMyAvailability({
      availableDates: selDates,
      availableTimes: selTimes,
      preferredCourseId: prefCourse,
      alternateCourseIds: [],
    });
    setShowSetAvailability(false);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    const group = createChatGroup(groupName.trim(), selectedMembers);
    setGroupName('');
    setSelectedMembers([]);
    setShowCreateGroup(false);
    setActiveGroupId(group.id);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeGroupId) return;
    sendMessage(activeGroupId, chatInput.trim());
    setChatInput('');
  };

  const handleGroupChat = (memberIds: string[], dateStr?: string, timeStr?: string) => {
    // Create a new chat group with the given members (voters / available buddies)
    const uniqueIds = [...new Set([currentUser.id, ...memberIds])];
    const memberNames = uniqueIds
      .filter(id => id !== currentUser.id)
      .map(id => getUserById(id)?.firstName)
      .filter(Boolean);
    const dateTimePart = [dateStr && formatDate(dateStr), timeStr].filter(Boolean).join(' @ ');
    const groupName = dateTimePart
      ? `Tee Time - ${dateTimePart}`
      : memberNames.length > 0
        ? `Tee Time - ${memberNames.join(', ')}`
        : 'Tee Time Chat';
    const group = createChatGroup(groupName, uniqueIds, dateStr, timeStr);
    setShowPollPanel(false);
    setShowAvailViewer(false);
    setActiveGroupId(group.id);
  };

  const handleGroupCall = (memberIds: string[]) => {
    const members = memberIds
      .filter(id => id !== currentUser.id)
      .map(id => getUserById(id))
      .filter((u): u is User => !!u && !!u.phone);
    if (members.length === 1) {
      window.location.href = `tel:${members[0].phone}`;
    } else if (members.length > 1) {
      setGroupCallMembers(members);
    }
  };

  const filteredBuddies = (() => {
    let list = getFilteredBuddies(availFilter);
    // Search filter
    if (buddySearch.trim()) {
      const q = buddySearch.trim().toLowerCase();
      list = list.filter(({ user }) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(q)
      );
    }
    // Sort favorites to top, preserving distance order within each group
    list.sort((a, b) => {
      const aFav = favoriteBuddyIds.includes(a.user.id) ? 0 : 1;
      const bFav = favoriteBuddyIds.includes(b.user.id) ? 0 : 1;
      return aFav - bFav;
    });
    return list;
  })();
  const commonDates = getCommonDates(filteredBuddies);
  const commonTimes = getCommonTimes(filteredBuddies);

  // Availability filter for group chat members
  const getGroupAvailBuddies = (group: ChatGroup, filter: AvailFilter) => {
    const members = group.memberIds
      .filter(id => id !== currentUser.id)
      .map(id => {
        const user = getUserById(id);
        const avail = availability.find(a => a.userId === id);
        const dist = user ? getDistanceMiles(currentUser.lat, currentUser.lng, user.lat, user.lng) : 999;
        return { user: user!, avail, distance: dist };
      })
      .filter(b => b.user && b.avail);

    switch (filter) {
      case 'two': return members.slice(0, 2);
      case 'four': return members.slice(0, 4);
      case 'moreThanTwo': return members.length > 2 ? members : [];
      default: return members;
    }
  };

  // ——— Set Availability Sheet ———
  if (showSetAvailability) {
    return (
      <div className="px-4 pt-4 pb-28 animate-fade-in">
        <button onClick={() => setShowSetAvailability(false)} className="flex items-center gap-1 text-golf-700 text-sm font-medium mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Set Your Availability</h2>
        <p className="text-sm text-gray-500 mb-5">Choose when you're free to play and your preferred courses.</p>

        <div className="space-y-5">
          {/* Dates */}
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={14} className="-mt-0.5" /> Available Dates
              <span className="text-xs font-normal text-gray-400 ml-1">({selDates.length}/5 selected)</span>
              <label
                htmlFor="buddy-date-picker"
                className="ml-auto p-1.5 rounded-lg border border-golf-300 text-golf-700 hover:bg-golf-50 transition-colors cursor-pointer"
                title="Pick a date from calendar"
              >
                <Plus size={14} />
              </label>
              <input
                id="buddy-date-picker"
                type="date"
                style={{ position: 'fixed', top: '-200px', left: '-200px', opacity: 0 }}
                tabIndex={-1}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date && !selDates.includes(date)) {
                    setSelDates(prev => {
                      const next = prev.length >= 5 ? [...prev.slice(1), date] : [...prev, date];
                      return next.sort();
                    });
                  }
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingDates.map(date => {
                const isSelected = selDates.includes(date);
                const atLimit = selDates.length >= 5 && !isSelected;
                return (
                  <button
                    key={date}
                    onClick={() => setSelDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : prev.length < 5 ? [...prev, date] : prev)}
                    disabled={atLimit}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-golf-600 bg-golf-50 text-golf-700'
                        : atLimit
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                );
              })}
              {/* Show custom-picked dates not in upcoming list */}
              {selDates.filter(d => !upcomingDates.includes(d)).map(date => (
                <button
                  key={date}
                  onClick={() => setSelDates(prev => prev.filter(d => d !== date))}
                  className="px-3 py-2 rounded-xl border border-golf-600 bg-golf-50 text-golf-700 text-xs font-medium transition-all flex items-center gap-1"
                >
                  {formatDate(date)} <X size={10} />
                </button>
              ))}
            </div>
            {selDates.length >= 5 && (
              <p className="text-[10px] text-amber-600 mt-1">Maximum 5 dates selected. Remove one to add another.</p>
            )}
          </div>

          {/* Times */}
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Clock size={14} className="-mt-0.5" /> Available Times
              <span className="text-xs font-normal text-gray-400 ml-1">({selTimes.length}/3 selected)</span>
              <label
                htmlFor="buddy-time-picker"
                className="ml-auto p-1.5 rounded-lg border border-golf-300 text-golf-700 hover:bg-golf-50 transition-colors cursor-pointer"
                title="Pick a custom time"
              >
                <Plus size={14} />
              </label>
              <input
                id="buddy-time-picker"
                type="time"
                style={{ position: 'fixed', top: '-200px', left: '-200px', opacity: 0 }}
                tabIndex={-1}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) return;
                  const [h, m] = raw.split(':').map(Number);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const h12 = h % 12 || 12;
                  const formatted = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
                  if (!selTimes.includes(formatted)) {
                    setSelTimes(prev => prev.length >= 3 ? [...prev.slice(1), formatted] : [...prev, formatted]);
                  }
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(time => {
                const isSelected = selTimes.includes(time);
                const atLimit = selTimes.length >= 3 && !isSelected;
                return (
                  <button
                    key={time}
                    onClick={() => setSelTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : prev.length < 3 ? [...prev, time] : prev)}
                    disabled={atLimit}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-golf-600 bg-golf-50 text-golf-700'
                        : atLimit
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
              {/* Show custom-picked times not in preset list */}
              {selTimes.filter(t => !timeSlots.includes(t)).map(time => (
                <button
                  key={time}
                  onClick={() => setSelTimes(prev => prev.filter(t => t !== time))}
                  className="px-3 py-2 rounded-xl border border-golf-600 bg-golf-50 text-golf-700 text-xs font-medium transition-all flex items-center gap-1"
                >
                  {time} <X size={10} />
                </button>
              ))}
            </div>
            {selTimes.length >= 3 && (
              <p className="text-[10px] text-amber-600 mt-1">Maximum 3 times selected. Remove one to add another.</p>
            )}
          </div>

          {/* Preferred Course */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Star size={14} className="inline mr-1 -mt-0.5" /> Preferred Course
            </label>
            {!courseSearchActive && (
              <p className="text-xs text-gray-500 mb-2">Nearest {nearest5.length} course{nearest5.length !== 1 ? 's' : ''}{userCoords.zip ? ` near ${userCoords.zip}` : ' to your location'}</p>
            )}
            {/* Course search input */}
            <div className="flex gap-2 mb-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or zip code"
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCourseSearchActive(courseSearchQuery);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-golf-500 bg-white"
                />
              </div>
              <button
                onClick={() => setCourseSearchActive(courseSearchQuery)}
                className="px-3 py-2 bg-golf-700 text-white text-xs font-semibold rounded-xl hover:bg-golf-800 transition-colors"
              >
                <Search size={14} />
              </button>
              {courseSearchActive && (
                <button
                  onClick={() => { setCourseSearchActive(''); setCourseSearchQuery(''); }}
                  className="px-2 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {courseSearchActive && (
              <p className="text-xs text-gray-500 mb-2">
                {filteredCourseList.length > 0
                  ? `${filteredCourseList.length} course${filteredCourseList.length !== 1 ? 's' : ''} found`
                  : 'No courses found in our list'}
              </p>
            )}
            {prefCourse && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-golf-50 border border-golf-600">
                <Check size={14} className="text-golf-600 shrink-0" />
                <span className="text-sm font-medium text-golf-800 flex-1 truncate">{getCourseName(prefCourse)}</span>
                <button onClick={() => setPrefCourse('')} className="p-0.5 rounded-full hover:bg-golf-200 transition-colors">
                  <X size={14} className="text-golf-600" />
                </button>
              </div>
            )}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredCourseList.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPrefCourse(prefCourse === c.id ? '' : c.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                    prefCourse === c.id
                      ? 'border-golf-600 bg-golf-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.city}, {c.state} · {c.distance} mi</p>
                  </div>
                  {prefCourse === c.id && <X size={16} className="text-golf-600" />}
                </button>
              ))}
              {/* Google fallback banner — selectable as preferred course */}
              {courseSearchIsName && (() => {
                const customId = `custom:${courseSearchActive.trim()}`;
                const isSelected = prefCourse === customId;
                return (
                  <div
                    onClick={() => setPrefCourse(prefCourse === customId ? '' : customId)}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'border-golf-600 ring-2 ring-golf-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="h-20 bg-gradient-to-br from-golf-600 to-emerald-500 relative flex items-center justify-center">
                      <Search size={28} className="text-white/30" />
                      <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Web Result
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white text-golf-700 rounded-full p-0.5">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm capitalize">{courseSearchActive}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isSelected ? 'Selected as preferred course' : 'Tap to select as preferred course'}
                          </p>
                        </div>
                        {isSelected && <Check size={16} className="text-golf-600 shrink-0" />}
                      </div>
                      <a
                        href={courseGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink size={12} />
                        View on Google
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            onClick={handleSaveAvailability}
            className="w-full py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors"
          >
            {selDates.length === 0 && selTimes.length === 0 && !prefCourse ? 'Clear Availability' : 'Save Availability'}
          </button>
        </div>
      </div>
    );
  }

  // ——— Create Group Sheet ———
  if (showCreateGroup) {
    return (
      <div className="px-4 pt-4 pb-28 animate-fade-in">
        <button onClick={() => setShowCreateGroup(false)} className="flex items-center gap-1 text-golf-700 text-sm font-medium mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Create Chat Group</h2>
        <p className="text-sm text-gray-500 mb-5">Pick your favorite golf buddies to chat with.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Weekend Warriors"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Members</label>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {otherUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedMembers(prev =>
                    prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]
                  )}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${
                    selectedMembers.includes(user.id)
                      ? 'border-golf-600 bg-golf-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Avatar firstName={user.firstName} lastName={user.lastName} profilePicture={user.profilePicture} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.skillLevel}</p>
                  </div>
                  {selectedMembers.includes(user.id) && <Check size={16} className="text-golf-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="w-full py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Group ({selectedMembers.length} members)
          </button>
        </div>
      </div>
    );
  }

  // ——— Active Chat View ———
  if (activeGroupId) {
    const group = chatGroups.find(g => g.id === activeGroupId);
    if (!group) { setActiveGroupId(null); return null; }

    const groupBuddies = getGroupAvailBuddies(group, groupAvailFilter);
    const groupCommonDates = getCommonDates(groupBuddies);
    const groupCommonTimes = getCommonTimes(groupBuddies);

    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Chat Header */}
        <div className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => { setActiveGroupId(null); setShowGroupAvailability(false); setShowGroupSettings(false); setShowAddMember(false); }} className="text-golf-700">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
              <p className="text-xs text-gray-500">
                {group.memberIds.map(id => getUserById(id)?.firstName).filter(Boolean).join(', ')}
              </p>
              {(group.teeDate || group.teeTime) && (
                <div className="flex items-center gap-2 mt-1">
                  {group.teeDate && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-golf-700 bg-golf-50 border border-golf-200 rounded px-1.5 py-0.5">
                      <Calendar size={10} /> {formatDate(group.teeDate)}
                    </span>
                  )}
                  {group.teeTime && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-golf-700 bg-golf-50 border border-golf-200 rounded px-1.5 py-0.5">
                      <Clock size={10} /> {group.teeTime}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (group.teeDate && group.teeTime) {
                  downloadTeeTimeReminder(group.name, group.teeDate, group.teeTime);
                } else {
                  setReminderDate(group.teeDate || '');
                  setReminderTime(group.teeTime || '');
                  setShowReminderPicker(!showReminderPicker);
                }
              }}
              className={`p-2 rounded-xl border transition-all ${showReminderPicker ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
              title="Set 30-min reminder before tee time"
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => setShowGroupAvailability(!showGroupAvailability)}
              className={`p-2 rounded-xl border transition-all ${showGroupAvailability ? 'border-golf-600 bg-golf-50 text-golf-700' : 'border-gray-200 text-gray-500'}`}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={() => setShowGroupSettings(!showGroupSettings)}
              className={`p-2 rounded-xl border transition-all ${showGroupSettings ? 'border-golf-600 bg-golf-50 text-golf-700' : 'border-gray-200 text-gray-500'}`}
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Group Availability Filter */}
          {showGroupAvailability && (
            <div className="pb-2 animate-fade-in">
              <AvailabilityFilterTabs filter={groupAvailFilter} setFilter={setGroupAvailFilter} />
              {groupBuddies.length > 0 ? (
                <AvailabilityResults
                  buddies={groupBuddies}
                  commonDates={groupCommonDates}
                  commonTimes={groupCommonTimes}
                  nearbyDeals={nearbyDeals}
                  userZip={userCoords.zip}
                  formatDate={formatDate}
                  getCourseName={getCourseName}
                  groupCallMembers={groupCallMembers}
                  setGroupCallMembers={setGroupCallMembers}
                />
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No matching availability for this filter.</p>
              )}
            </div>
          )}

          {/* Reminder Picker Panel */}
          {showReminderPicker && (
            <div className="pb-3 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  <Bell size={14} className="text-amber-500" /> Set Tee Time Reminder
                </h4>
                <button onClick={() => setShowReminderPicker(false)} className="text-gray-400"><X size={16} /></button>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Pick date & time. You'll get an alarm 30 minutes before.</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-golf-400"
                />
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-golf-400"
                >
                  <option value="">Select time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button
                onClick={() => {
                  if (reminderDate && reminderTime) {
                    downloadTeeTimeReminder(group.name, reminderDate, reminderTime);
                    setShowReminderPicker(false);
                  }
                }}
                disabled={!reminderDate || !reminderTime}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  reminderDate && reminderTime
                    ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Bell size={16} /> Set 30-Min Reminder
              </button>
            </div>
          )}
        </div>

        {/* Group Settings Panel */}
        {showGroupSettings && (
          <div className="px-4 py-3 bg-white border-b border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">Group Settings</h4>
              <button onClick={() => { setShowGroupSettings(false); setShowAddMember(false); }} className="text-gray-400"><X size={16} /></button>
            </div>

            {/* Members List */}
            <div className="space-y-2 mb-3">
              {group.memberIds.map(memberId => {
                const member = getUserById(memberId);
                if (!member) return null;
                const isAdmin = (group.adminIds || []).includes(memberId);
                const currentIsAdmin = (group.adminIds || []).includes(currentUser.id);
                const isMe = memberId === currentUser.id;
                return (
                  <div key={memberId} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Avatar firstName={member.firstName} lastName={member.lastName} profilePicture={member.profilePicture} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{member.firstName} {member.lastName}{isMe ? ' (You)' : ''}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                            <Shield size={8} /> Admin
                          </span>
                        )}
                      </div>
                      {!isMe && member.phone && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <a href={`sms:${member.phone}`} className="p-1 rounded-full text-golf-600 hover:bg-golf-50 transition-colors" title={`Text ${member.firstName}`}>
                            <MessageCircle size={13} />
                          </a>
                          <a href={`tel:${member.phone}`} className="p-1 rounded-full text-blue-500 hover:bg-blue-50 transition-colors" title={`Call ${member.firstName}`}>
                            <Phone size={13} />
                          </a>
                        </div>
                      )}
                    </div>
                    {currentIsAdmin && !isMe && (
                      <div className="flex items-center gap-1">
                        {!isAdmin && (
                          <button
                            onClick={() => makeGroupAdmin(group.id, memberId)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Make admin"
                          >
                            <Shield size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => removeGroupMember(group.id, memberId)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove member"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Member (admin only) */}
            {(group.adminIds || []).includes(currentUser.id) && (
              <>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="w-full mb-2 py-2 rounded-xl border border-dashed border-golf-300 text-golf-700 text-xs font-semibold hover:bg-golf-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus size={14} /> Add Member
                </button>
                {showAddMember && (
                  <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                    {otherUsers.filter(u => !group.memberIds.includes(u.id)).map(user => (
                      <button
                        key={user.id}
                        onClick={() => { addGroupMember(group.id, user.id); setShowAddMember(false); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-golf-50 transition-colors"
                      >
                        <Avatar firstName={user.firstName} lastName={user.lastName} profilePicture={user.profilePicture} size="xs" />
                        <span className="text-xs font-medium text-gray-700">{user.firstName} {user.lastName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              {(group.adminIds || []).includes(currentUser.id) && (
                <button
                  onClick={() => {
                    deleteGroup(group.id);
                    setActiveGroupId(null);
                    setShowGroupSettings(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} /> Delete Group
                </button>
              )}
              <button
                onClick={() => {
                  leaveGroup(group.id);
                  setActiveGroupId(null);
                  setShowGroupSettings(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                <LogOut size={14} /> Leave Group
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons: Poll, Ride-sharing, Availability */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex gap-2">
          <button
            onClick={() => { setShowPollPanel(!showPollPanel); setShowAvailViewer(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${showPollPanel ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <BarChart3 size={14} /> Polls
          </button>
          <button
            onClick={() => { setShowAvailViewer(!showAvailViewer); setShowPollPanel(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${showAvailViewer ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Eye size={14} /> Who's Free?
          </button>
        </div>

        {/* Weekend Poll Panel */}
        {showPollPanel && (
          <WeekendPollPanel
            group={group}
            polls={weekendPolls.filter(p => p.groupId === group.id)}
            currentUserId={currentUser.id}
            getUserById={getUserById}
            formatDate={formatDate}
            availability={availability}
            onCreatePoll={(dates, times, message) => {
              const poll = createWeekendPoll(group.id, dates, times);
              if (message) {
                const dateInfo = poll.dateOptions.map(d => formatDate(d)).join(', ');
                const timeInfo = poll.timeOptions.join(', ');
                sendMessage(group.id, `📊 New Poll: ${message}\n📅 ${dateInfo}\n🕐 ${timeInfo}`);
              }
            }}
            onVote={(pollId) => {
              voteOnPoll(pollId, {
                selectedDates: pollSelDates,
                selectedTimes: pollSelTimes,
                needsRide: pollNeedsRide,
                canOfferRide: pollCanOffer,
              });
              setPollSelDates([]); setPollSelTimes([]); setPollNeedsRide(false); setPollCanOffer(false);
            }}
            onGroupChat={handleGroupChat}
            onGroupCall={handleGroupCall}
            pollSelDates={pollSelDates} setPollSelDates={setPollSelDates}
            pollSelTimes={pollSelTimes} setPollSelTimes={setPollSelTimes}
            pollNeedsRide={pollNeedsRide} setPollNeedsRide={setPollNeedsRide}
            pollCanOffer={pollCanOffer} setPollCanOffer={setPollCanOffer}
          />
        )}

        {/* Group Availability Viewer */}
        {showAvailViewer && (
          <GroupAvailabilityViewer
            group={group}
            availability={availability}
            getUserById={getUserById}
            currentUserId={currentUser.id}
            formatDate={formatDate}
            viewDate={viewDate} setViewDate={setViewDate}
            viewTime={viewTime} setViewTime={setViewTime}
            upcomingDates={upcomingDates}
            timeSlots={timeSlots}
            onGroupChat={handleGroupChat}
            onGroupCall={handleGroupCall}
          />
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {group.messages.map(msg => {
            const sender = getUserById(msg.senderId);
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                  {!isMe && (
                    <p className="text-[10px] text-gray-400 mb-0.5 ml-1">{sender?.firstName}</p>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-golf-700 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-gray-300 mt-0.5 mx-1">
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="p-2.5 rounded-xl bg-golf-700 text-white disabled:opacity-40 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Main View ———
  return (
    <div className="pb-28">
      {/* Banner */}
      <div className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-5 pt-6 pb-5 rounded-b-3xl shadow-md mb-4">
        <div className="absolute inset-0 opacity-10 rounded-b-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'8\' fill=\'%23fff\' fill-opacity=\'0.3\'/%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'3\' fill=\'%23fff\' fill-opacity=\'0.2\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'4\' fill=\'%23fff\' fill-opacity=\'0.2\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
        <div className="relative flex flex-col items-center text-center">
          <h1 className="text-xl font-bold text-white">Let's Play Buddy</h1>
          <p className="text-sm text-white/90 mt-1 font-medium">Your golf social network — connect, match & tee off</p>
        </div>
        <div className="relative mt-4">
          {needsAvailability && (
            <div className="absolute -inset-1 rounded-2xl bg-amber-400 animate-pulse opacity-50" />
          )}
          <button
            onClick={() => setShowSetAvailability(true)}
            className={`relative w-full py-3 rounded-xl text-white text-sm font-bold shadow-sm flex flex-col items-center justify-center gap-1 transition-colors ${
              needsAvailability
                ? 'animate-shimmer hover:brightness-110'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            <span className="flex items-center gap-2 text-base">
              <Calendar size={18} />
              Set Your Availability
            </span>
            {needsAvailability && (
              <span className="text-[11px] font-medium text-amber-100">
                👋 Your buddies are waiting!
              </span>
            )}
          </button>
        </div>

        {/* Senior Golf Concierge — Senior Assistant Tile */}
        <button
          onClick={() => navigate('/hey-caddie')}
          className="relative w-full mt-3 overflow-hidden rounded-xl shadow-lg group active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          <div className="relative z-10 flex items-center gap-3 px-4 py-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 flex-shrink-0">
              <Mic size={22} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Senior Golf Concierge</h3>
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[9px] font-bold text-white uppercase tracking-wider">Voice AI</span>
              </div>
              <p className="text-white/90 text-[11px] font-medium mt-0.5">SOS, rides, tee times & more — just speak!</p>
            </div>
            <ChevronRight size={18} className="text-white/60" />
          </div>
        </button>
      </div>

      <div className="px-4">

      {/* My Availability Summary */}
      {getMyAvailability() && (
        <div className="mb-4 p-3 rounded-xl bg-golf-50 border border-golf-200">
          <p className="text-sm font-bold text-golf-900 mb-1">Your Availability</p>
          <p className="text-sm font-semibold text-golf-800">
            {getMyAvailability()!.availableDates.map(d => formatDate(d)).join(', ')} · {getMyAvailability()!.availableTimes.join(', ')}
          </p>
          <p className="text-sm font-medium text-golf-700 mt-0.5">
            Preferred: {getCourseName(getMyAvailability()!.preferredCourseId)}
          </p>
        </div>
      )}

      {/* Main Tabs: Buddies | Chat */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setMainTab('buddies')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mainTab === 'buddies' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          <Users size={15} className="inline mr-1 -mt-0.5" />
          Buddies
        </button>
        <button
          onClick={() => setMainTab('chat')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mainTab === 'chat' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          <MessageCircle size={15} className="inline mr-1 -mt-0.5" />
          Chat Groups
        </button>
      </div>

      {mainTab === 'buddies' ? (
        <>
          {/* Availability Filter Tabs */}
          <AvailabilityFilterTabs filter={availFilter} setFilter={setAvailFilter} />

          {/* Buddy Search */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={buddySearch}
              onChange={e => setBuddySearch(e.target.value)}
              placeholder="Search buddies by name..."
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-golf-400 focus:ring-1 focus:ring-golf-200 outline-none transition-all"
            />
            {buddySearch && (
              <button onClick={() => setBuddySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results */}
          {filteredBuddies.length > 0 ? (
            <AvailabilityResults
              buddies={filteredBuddies}
              commonDates={commonDates}
              commonTimes={commonTimes}
              nearbyDeals={nearbyDeals}
              userZip={userCoords.zip}
              formatDate={formatDate}
              getCourseName={getCourseName}
              favoriteBuddyIds={favoriteBuddyIds}
              onToggleFavorite={toggleFavorite}
              groupCallMembers={groupCallMembers}
              setGroupCallMembers={setGroupCallMembers}
            />
          ) : (
            <div className="text-center py-8">
              <Users size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No buddies match this filter.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Chat Groups */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-full mb-4 py-3 rounded-xl border-2 border-dashed border-golf-300 text-golf-700 text-sm font-semibold hover:bg-golf-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create New Group
          </button>

          {chatGroups.filter(g => g.memberIds.includes(currentUser.id)).length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No chat groups yet. Create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatGroups
                .filter(g => g.memberIds.includes(currentUser.id))
                .map(group => {
                  const lastMsg = group.messages[group.messages.length - 1];
                  const lastSender = lastMsg ? getUserById(lastMsg.senderId) : null;
                  const isRevealed = deleteRevealedGroupId === group.id;
                  const unreadMsgCount = getUnreadMessageCount(group.id);
                  return (
                    <div key={group.id} className="relative overflow-hidden rounded-xl">
                      {/* Delete button behind the card */}
                      <div className="absolute right-0 top-0 bottom-0 flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGroup(group.id);
                            setDeleteRevealedGroupId(null);
                          }}
                          className="h-full px-5 bg-red-600 text-white flex flex-col items-center justify-center gap-1 hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                          <span className="text-[10px] font-semibold">Delete</span>
                        </button>
                      </div>
                      {/* Swipeable card */}
                      <button
                        onClick={() => {
                          if (isRevealed) { setDeleteRevealedGroupId(null); return; }
                          setActiveGroupId(group.id);
                        }}
                        onTouchStart={(e) => {
                          touchStartX.current = e.touches[0].clientX;
                          longPressTimer.current = setTimeout(() => {
                            setDeleteRevealedGroupId(isRevealed ? null : group.id);
                          }, 500);
                        }}
                        onTouchMove={(e) => {
                          if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                          const dx = e.touches[0].clientX - touchStartX.current;
                          if (dx < -50 && !isRevealed) setDeleteRevealedGroupId(group.id);
                          if (dx > 50 && isRevealed) setDeleteRevealedGroupId(null);
                        }}
                        onTouchEnd={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
                        onContextMenu={(e) => { e.preventDefault(); setDeleteRevealedGroupId(isRevealed ? null : group.id); }}
                        className={`w-full bg-green-700 rounded-xl shadow-sm p-4 text-left hover:bg-green-800 transition-all duration-200 relative ${isRevealed ? '-translate-x-20' : 'translate-x-0'}`}
                        style={{ transition: 'transform 0.2s ease-out' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{group.name}</h3>
                            {unreadMsgCount > 0 && (
                              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                                {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                              </span>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-green-200" />
                        </div>
                        <p className="text-xs text-green-100 mb-1.5">
                          {group.memberIds.map(id => getUserById(id)?.firstName).filter(Boolean).join(', ')}
                        </p>
                        {(group.teeDate || group.teeTime) && (
                          <p className="text-[10px] text-green-200 mb-1 flex items-center gap-1">
                            {group.teeDate && <><Calendar size={10} /> {formatDate(group.teeDate)}</>}
                            {group.teeDate && group.teeTime && ' @ '}
                            {group.teeTime && <><Clock size={10} /> {group.teeTime}</>}
                          </p>
                        )}
                        {lastMsg && (
                          <p className="text-xs text-green-200 truncate">
                            <span className="font-medium">{lastSender?.firstName}:</span> {lastMsg.text}
                          </p>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

// ——— Availability Filter Tabs Component ———
function AvailabilityFilterTabs({ filter, setFilter }: { filter: AvailFilter; setFilter: (f: AvailFilter) => void }) {
  const tabs: { key: AvailFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Available', icon: <Users size={13} /> },
    { key: 'two', label: 'Two Available', icon: <Users2 size={13} /> },
    { key: 'four', label: 'Four Available', icon: <Users size={13} /> },
    { key: 'moreThanTwo', label: '2+ Available', icon: <UserCheck size={13} /> },
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setFilter(t.key)}
          className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === t.key
              ? 'bg-golf-700 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

// ——— Availability Results Component ———
function AvailabilityResults({
  buddies,
  commonDates,
  commonTimes,
  nearbyDeals,
  userZip,
  formatDate,
  getCourseName,
  favoriteBuddyIds = [],
  onToggleFavorite,
  groupCallMembers = [],
  setGroupCallMembers,
}: {
  buddies: { user: User; avail: BuddyAvailability | undefined; distance: number }[];
  commonDates: string[];
  commonTimes: string[];
  nearbyDeals: (typeof hotDeals[number] & { distance: number })[];
  userZip: string;
  formatDate: (iso: string) => string;
  getCourseName: (id: string) => string;
  favoriteBuddyIds?: string[];
  onToggleFavorite?: (userId: string) => void;
  groupCallMembers?: User[];
  setGroupCallMembers?: (members: User[]) => void;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Common dates/times */}
      {commonDates.length > 0 && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-1">Common Available Dates</p>
          <p className="text-xs text-blue-700">{commonDates.map(d => formatDate(d)).join(', ')}</p>
          {commonTimes.length > 0 && (
            <p className="text-xs text-blue-600 mt-0.5">Common Times: {commonTimes.join(', ')}</p>
          )}
        </div>
      )}

      {/* Buddy list */}
      <div className="space-y-3">
        {buddies.map(({ user, avail, distance }) => {
          const isFav = favoriteBuddyIds.includes(user.id);
          return (
          <div key={user.id} className={`bg-white rounded-xl border shadow-sm p-4 ${isFav ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Avatar firstName={user.firstName} lastName={user.lastName} profilePicture={user.profilePicture} size="lg" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5"><MapPin size={10} /> {distance} mi</span>
                  <span>·</span>
                  <span>{user.skillLevel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(user.id)}
                    className={`p-2 rounded-full transition-colors ${isFav ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                )}
                {user.phone && (
                  <a href={`sms:${user.phone}`} className="p-2 rounded-full bg-golf-50 text-golf-700 hover:bg-golf-100 transition-colors" title={`Text ${user.firstName}`}>
                    <MessageCircle size={16} />
                  </a>
                )}
                {user.phone && (
                  <a href={`tel:${user.phone}`} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title={`Call ${user.firstName}`}>
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </div>
            {avail && (
              <div className="space-y-1 ml-[52px]">
                <p className="text-xs text-gray-600">
                  <Calendar size={11} className="inline mr-1 -mt-0.5" />
                  {avail.availableDates.map(d => formatDate(d)).join(', ')}
                </p>
                <p className="text-xs text-gray-600">
                  <Clock size={11} className="inline mr-1 -mt-0.5" />
                  {avail.availableTimes.join(', ')}
                </p>
                <p className="text-xs text-gray-500">
                  <Star size={11} className="inline mr-1 -mt-0.5" />
                  {getCourseName(avail.preferredCourseId)}
                  {avail.alternateCourseIds.length > 0 && (
                    <span className="text-gray-400"> · +{avail.alternateCourseIds.length} alternates</span>
                  )}
                </p>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Top 3 Golf Course Deals – Google AI Overview style */}
      {nearbyDeals.length > 0 && (
        <div className="rounded-2xl border border-[#d3e3fd] bg-gradient-to-b from-[#eef4ff] to-[#f8faff] overflow-hidden">
          {/* ── AI Overview header ── */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <Sparkles size={16} className="text-blue-500" style={{ filter: 'drop-shadow(0 0 2px rgba(99,102,241,.4))' }} />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              AI Overview
            </span>
          </div>

          {/* ── Summary sentence ── */}
          <p className="px-4 pb-3 text-xs text-gray-700 leading-relaxed">
            Top <span className="font-semibold">golf course deals</span> within <span className="font-semibold">50 miles</span>{userZip ? <> of <span className="font-semibold">{userZip}</span></> : ' of you'} — available today with the best rates.
          </p>

          {/* ── Result tiles ── */}
          <div className="flex gap-2 px-3 pb-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {nearbyDeals.map(deal => {
              const discount = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);
              return (
                <button
                  key={deal.id}
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(deal.courseName + ' tee time deals')}`, '_blank')}
                  className="min-w-[170px] flex-1 bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden snap-start text-left hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  {/* Course hero */}
                  <div className={`h-[60px] bg-gradient-to-br ${deal.imageGradient} relative flex items-end p-2`}>
                    <div className="absolute top-1.5 right-1.5 bg-white/90 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                      -{discount}%
                    </div>
                    <p className="text-white font-semibold text-[11px] leading-snug drop-shadow-md line-clamp-2 pr-8">{deal.courseName}</p>
                  </div>

                  {/* Card body */}
                  <div className="p-2.5 space-y-1">
                    {/* Source row (Google-style favicon + domain) */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Globe size={9} className="text-green-700" />
                      </span>
                      <span className="text-[10px] text-green-700 truncate">{deal.courseName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>

                    {/* Title (Google blue link style) */}
                    <p className="text-[13px] font-medium text-[#1a0dab] leading-tight group-hover:underline line-clamp-1">
                      {deal.holes}H · {deal.teeTime} Tee Time
                    </p>

                    {/* Snippet */}
                    <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                      {deal.city}, {deal.state} · <span className="text-blue-600 font-medium">{deal.distance} mi away</span>
                      {deal.includesCart && ' · Cart included'}
                    </p>

                    {/* Price row */}
                    <div className="flex items-baseline gap-1.5 pt-1 border-t border-gray-100 mt-1">
                      <span className="text-[15px] font-bold text-green-600">${deal.dealPrice}</span>
                      <span className="text-[11px] text-gray-400 line-through">${deal.originalPrice}</span>
                      <Flame size={10} className="text-orange-400 ml-auto" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Footer (Google-style) ── */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#d3e3fd]/60 bg-white/40">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Sparkles size={10} />
              <span>Generative AI is experimental</span>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent('golf course deals near me')}`, '_blank')}
              className="text-[11px] text-blue-600 font-medium hover:underline"
            >
              Show more ›
            </button>
          </div>
        </div>
      )}

      {/* Group Call Sheet */}
      {groupCallMembers.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setGroupCallMembers?.([])}>
          <div className="w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-base font-bold text-gray-900">Group Call</h3>
              <button onClick={() => setGroupCallMembers?.([])} className="p-1 rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="px-5 text-xs text-gray-500 mb-3">Tap a member to call them</p>
            <div className="px-5 pb-5 space-y-2 max-h-72 overflow-y-auto">
              {groupCallMembers.map(member => (
                <a
                  key={member.id}
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Avatar firstName={member.firstName} lastName={member.lastName} profilePicture={member.profilePicture} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </div>
                  <Phone size={18} className="text-blue-600" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ——— Weekend Poll Panel Component ———
function WeekendPollPanel({
  group, polls: _polls, currentUserId: _currentUserId, getUserById, formatDate, availability,
  onCreatePoll: _onCreatePoll, onVote: _onVote, onGroupChat: _onGroupChat, onGroupCall: _onGroupCall,
  pollSelDates: _pollSelDates, setPollSelDates: _setPollSelDates, pollSelTimes: _pollSelTimes, setPollSelTimes: _setPollSelTimes,
  pollNeedsRide: _pollNeedsRide, setPollNeedsRide: _setPollNeedsRide, pollCanOffer: _pollCanOffer, setPollCanOffer: _setPollCanOffer,
}: {
  group: ChatGroup;
  polls: WeekendPoll[];
  currentUserId: string;
  getUserById: (id: string) => User | undefined;
  formatDate: (iso: string) => string;
  availability: BuddyAvailability[];
  onCreatePoll: (dates?: string[], times?: string[], message?: string) => void;
  onVote: (pollId: string) => void;
  onGroupChat: (memberIds: string[], dateStr?: string, timeStr?: string) => void;
  onGroupCall: (memberIds: string[]) => void;
  pollSelDates: string[]; setPollSelDates: (d: string[]) => void;
  pollSelTimes: string[]; setPollSelTimes: (t: string[]) => void;
  pollNeedsRide: boolean; setPollNeedsRide: (v: boolean) => void;
  pollCanOffer: boolean; setPollCanOffer: (v: boolean) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate next 6 weekend dates (3 weekends: Sat + Sun each)
  const weekendDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    const d = new Date(today);
    // Move to next Saturday
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    for (let i = 0; i < 3; i++) {
      const sat = new Date(d);
      sat.setDate(d.getDate() + i * 7);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      dates.push(sat.toISOString().split('T')[0]);
      dates.push(sun.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Get group member availability for the selected date
  const membersForDate = useMemo(() => {
    if (!selectedDate) return [];
    return group.memberIds.map(memberId => {
      const user = getUserById(memberId);
      const avail = availability.find(a => a.userId === memberId);
      const isAvailable = avail?.availableDates?.includes(selectedDate) || false;
      const times = isAvailable ? (avail?.availableTimes || []) : [];
      return { user, avail, isAvailable, times };
    }).filter(m => m.user);
  }, [selectedDate, group.memberIds, availability, getUserById]);

  const availableCount = membersForDate.filter(m => m.isAvailable).length;

  const getDayLabel = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    return d.getDay() === 0 ? 'Sun' : 'Sat';
  };

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100 max-h-[55vh] overflow-y-auto animate-fade-in shrink-0">
      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-1">
        <BarChart3 size={15} className="text-green-700" /> Weekend Polls
      </h4>
      <p className="text-[11px] text-gray-500 mb-3">Pick a weekend date to see who's available</p>

      {/* Weekend date buttons - 2 columns (Sat | Sun) per weekend */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {weekendDates.map(date => {
          const dayLabel = getDayLabel(date);
          const isSelected = selectedDate === date;
          // Count available members for this date
          const availCount = group.memberIds.filter(id => {
            const a = availability.find(av => av.userId === id);
            return a?.availableDates?.includes(date);
          }).length;
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(isSelected ? null : date)}
              className={`px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.97] ${
                isSelected
                  ? 'bg-green-700 text-white shadow-md'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{dayLabel} {formatDate(date)}</span>
                {availCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                    {availCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Show availability results for selected date */}
      {selectedDate && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-900">
              {formatDate(selectedDate)} — {availableCount} of {membersForDate.length} available
            </p>
          </div>

          {membersForDate.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No members in this group</p>
          ) : (
            <div className="space-y-1.5">
              {/* Available members first, then unavailable */}
              {membersForDate
                .sort((a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0))
                .map(({ user, avail, isAvailable, times }) => (
                <div
                  key={user!.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isAvailable ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100 opacity-60'
                  }`}
                >
                  <Avatar firstName={user!.firstName} lastName={user!.lastName} profilePicture={user!.profilePicture} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900">{user!.firstName} {user!.lastName}</p>
                      {isAvailable ? (
                        <span className="text-[9px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full">Available</span>
                      ) : (
                        <span className="text-[9px] font-bold bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded-full">Not set</span>
                      )}
                    </div>
                    {isAvailable && times.length > 0 && (
                      <p className="text-[10px] text-green-700 mt-0.5">
                        <Clock size={9} className="inline mr-0.5 -mt-0.5" /> {times.join(', ')}
                      </p>
                    )}
                    {isAvailable && (avail?.needsRide || avail?.canOfferRide) && (
                      <div className="flex gap-1 mt-0.5">
                        {avail?.needsRide && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Needs ride</span>}
                        {avail?.canOfferRide && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Can drive</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {availableCount >= 2 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 text-center">
                {availableCount >= 4 ? 'Full foursome ready!' : `${availableCount} players ready — find ${4 - availableCount} more!`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ——— Group Availability Viewer Component ———
function GroupAvailabilityViewer({
  group, availability, getUserById, currentUserId: _currentUserId, formatDate,
  viewDate, setViewDate, viewTime, setViewTime,
  upcomingDates, timeSlots, onGroupChat, onGroupCall,
}: {
  group: ChatGroup;
  availability: BuddyAvailability[];
  getUserById: (id: string) => User | undefined;
  currentUserId: string;
  formatDate: (iso: string) => string;
  viewDate: string; setViewDate: (d: string) => void;
  viewTime: string; setViewTime: (t: string) => void;
  upcomingDates: string[];
  timeSlots: string[];
  onGroupChat: (memberIds: string[], dateStr?: string, timeStr?: string) => void;
  onGroupCall: (memberIds: string[]) => void;
}) {
  const availableMembers = group.memberIds
    .map(id => ({ user: getUserById(id), avail: availability.find(a => a.userId === id) }))
    .filter(({ user, avail }) => {
      if (!user || !avail) return false;
      const dateMatch = !viewDate || avail.availableDates.includes(viewDate);
      const timeMatch = !viewTime || avail.availableTimes.includes(viewTime);
      return dateMatch && timeMatch;
    });

  const unavailableMembers = group.memberIds
    .map(id => ({ user: getUserById(id), avail: availability.find(a => a.userId === id) }))
    .filter(({ user, avail }) => {
      if (!user) return false;
      if (!avail) return true;
      if (viewDate && !avail.availableDates.includes(viewDate)) return true;
      if (viewTime && !avail.availableTimes.includes(viewTime)) return true;
      return false;
    });

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100 max-h-[50vh] overflow-y-auto animate-fade-in shrink-0">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
        <Eye size={15} className="text-green-700" /> Who's Free for Tee Time?
      </h4>

      {/* Date picker */}
      <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Select a Day</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {upcomingDates.map(date => (
          <button
            key={date}
            onClick={() => setViewDate(viewDate === date ? '' : date)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${viewDate === date ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {/* Time picker */}
      <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Select a Time</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {timeSlots.map(time => (
          <button
            key={time}
            onClick={() => setViewTime(viewTime === time ? '' : time)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${viewTime === time ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {time}
          </button>
        ))}
      </div>

      {!viewDate && !viewTime ? (
        <p className="text-xs text-gray-400 text-center py-2">Pick a day or time to see who's available.</p>
      ) : (
        <>
          {/* Available members */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-green-800 flex items-center gap-1">
                <Check size={13} /> Available ({availableMembers.length})
              </p>
              {availableMembers.length > 0 && (
                <div className="flex gap-1.5">
                  <button onClick={() => onGroupChat(availableMembers.map(m => m.user!.id), viewDate || undefined, viewTime || undefined)} className="flex items-center gap-0.5 text-[9px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition-colors">
                    <MessageCircle size={11} /> Group Chat
                  </button>
                  <button onClick={() => onGroupCall(availableMembers.map(m => m.user!.id))} className="flex items-center gap-0.5 text-[9px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-100 transition-colors">
                    <Phone size={11} /> Group Call
                  </button>
                </div>
              )}
            </div>
            {availableMembers.length === 0 ? (
              <p className="text-xs text-gray-400 ml-5">No one is free at this time.</p>
            ) : (
              <div className="space-y-2">
                {availableMembers.map(({ user, avail }) => (
                  <div key={user!.id} className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <Avatar firstName={user!.firstName} lastName={user!.lastName} profilePicture={user!.profilePicture} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{user!.firstName} {user!.lastName}</p>
                      <p className="text-[10px] text-gray-500">{user!.skillLevel}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {avail?.needsRide && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Needs ride</span>}
                      {avail?.canOfferRide && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Can drive</span>}
                      {user!.id !== _currentUserId && user!.phone && (
                        <>
                          <a href={`sms:${user!.phone}`} className="p-1 rounded-full text-golf-600 hover:bg-golf-100 transition-colors" title={`Text ${user!.firstName}`}>
                            <MessageCircle size={14} />
                          </a>
                          <a href={`tel:${user!.phone}`} className="p-1 rounded-full text-blue-500 hover:bg-blue-100 transition-colors" title={`Call ${user!.firstName}`}>
                            <Phone size={14} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unavailable members */}
          {unavailableMembers.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-700 mb-2">Not Available ({unavailableMembers.length})</p>
              <div className="space-y-1.5">
                {unavailableMembers.map(({ user }) => (
                  <div key={user!.id} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 opacity-60">
                    <Avatar firstName={user!.firstName} lastName={user!.lastName} profilePicture={user!.profilePicture} size="sm" />
                    <p className="flex-1 text-xs text-gray-500">{user!.firstName} {user!.lastName}</p>
                    {user!.id !== _currentUserId && user!.phone && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <a href={`sms:${user!.phone}`} className="p-1 rounded-full text-gray-400 hover:text-golf-600 transition-colors" title={`Text ${user!.firstName}`}>
                          <MessageCircle size={13} />
                        </a>
                        <a href={`tel:${user!.phone}`} className="p-1 rounded-full text-gray-400 hover:text-blue-500 transition-colors" title={`Call ${user!.firstName}`}>
                          <Phone size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tee time suggestion */}
          {availableMembers.length >= 2 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-800">
                {availableMembers.length >= 4 ? 'Full foursome ready!' : `${availableMembers.length} players ready!`}
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {viewDate && formatDate(viewDate)} {viewTime && `at ${viewTime}`} — Send a message to confirm the tee time.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
