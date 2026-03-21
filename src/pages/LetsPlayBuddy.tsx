import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockCourses } from '../data/mockCourses';
import { hotDeals } from '../data/hotDeals';
import { getDistanceMiles } from '../utils/distance';
import type { BuddyAvailability, User, ChatGroup } from '../data/mockUsers';
import {
  Calendar, Clock, MapPin, Users, MessageCircle, Send,
  ChevronRight, Plus, Check, Star, DollarSign, ArrowLeft,
  UserCheck, Users2, Filter, Flame, Zap,
} from 'lucide-react';

type MainTab = 'buddies' | 'chat';
type AvailFilter = 'all' | 'two' | 'four' | 'moreThanTwo';

export default function LetsPlayBuddy() {
  const { currentUser, allUsers, availability, chatGroups, setMyAvailability, getMyAvailability, createChatGroup, sendMessage } = useAuth();
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState<MainTab>('buddies');
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all');
  const [showSetAvailability, setShowSetAvailability] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showGroupAvailability, setShowGroupAvailability] = useState(false);
  const [groupAvailFilter, setGroupAvailFilter] = useState<AvailFilter>('all');

  // Availability form state
  const [selDates, setSelDates] = useState<string[]>([]);
  const [selTimes, setSelTimes] = useState<string[]>([]);
  const [prefCourse, setPrefCourse] = useState('');
  const [altCourses, setAltCourses] = useState<string[]>([]);

  // Create group state
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroupId, chatGroups]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-orange-950 px-4 pt-12 pb-28 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <Users size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Sign In to Play</h2>
        <p className="text-sm text-fuchsia-200/70 mb-8">Find golf buddies and plan epic tee times together.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all active:scale-95"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

  const upcomingDates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    upcomingDates.push(d.toISOString().split('T')[0]);
  }

  const timeSlots = ['7:00 AM', '9:30 AM', '11:00 AM', '2:00 PM', '3:00 PM'];
  const nearbyCourses = mockCourses
    .map(c => ({ ...c, distance: getDistanceMiles(currentUser.lat, currentUser.lng, c.lat, c.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getUserById = (id: string) => allUsers.find(u => u.id === id);
  const getCourseName = (id: string) => mockCourses.find(c => c.id === id)?.name || 'Unknown';

  const buddiesWithAvail = otherUsers.map(user => {
    const avail = availability.find(a => a.userId === user.id);
    const dist = getDistanceMiles(currentUser.lat, currentUser.lng, user.lat, user.lng);
    return { user, avail, distance: dist };
  }).filter(b => b.avail).sort((a, b) => a.distance - b.distance);

  const nearbyDeals = hotDeals
    .map(d => ({ ...d, distance: getDistanceMiles(currentUser.lat, currentUser.lng, d.lat, d.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const getFilteredBuddies = (filter: AvailFilter) => {
    const withAvail = buddiesWithAvail.filter(b => b.avail && b.avail.availableDates.length > 0);
    switch (filter) {
      case 'two': return withAvail.filter((_b, _i, arr) => arr.length >= 2).slice(0, 2);
      case 'four': return withAvail.filter((_b, _i, arr) => arr.length >= 4).slice(0, 4);
      case 'moreThanTwo': return withAvail.filter((_b, _i, arr) => arr.length > 2);
      default: return withAvail;
    }
  };

  const getCommonDates = (buddies: typeof buddiesWithAvail) => {
    if (buddies.length === 0) return [];
    const myAvail = getMyAvailability();
    const allDates = buddies.map(b => b.avail?.availableDates || []);
    if (myAvail) allDates.push(myAvail.availableDates);
    if (allDates.length === 0) return [];
    return allDates[0].filter(date => allDates.every(dates => dates.includes(date)));
  };

  const getCommonTimes = (buddies: typeof buddiesWithAvail) => {
    if (buddies.length === 0) return [];
    const myAvail = getMyAvailability();
    const allTimes = buddies.map(b => b.avail?.availableTimes || []);
    if (myAvail) allTimes.push(myAvail.availableTimes);
    if (allTimes.length === 0) return [];
    return allTimes[0].filter(time => allTimes.every(times => times.includes(time)));
  };

  const handleSaveAvailability = () => {
    if (selDates.length === 0 || selTimes.length === 0 || !prefCourse) return;
    setMyAvailability({
      availableDates: selDates,
      availableTimes: selTimes,
      preferredCourseId: prefCourse,
      alternateCourseIds: altCourses,
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

  const filteredBuddies = getFilteredBuddies(availFilter);
  const commonDates = getCommonDates(filteredBuddies);
  const commonTimes = getCommonTimes(filteredBuddies);

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
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-orange-950 px-4 pt-4 pb-28 animate-fade-in">
        <button onClick={() => setShowSetAvailability(false)} className="flex items-center gap-1 text-fuchsia-300 text-sm font-medium mb-4 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-extrabold text-white mb-1">Set Your Availability</h2>
        <p className="text-sm text-fuchsia-200/60 mb-6">Choose when you're free to play and your preferred courses.</p>

        <div className="space-y-5">
          {/* Dates */}
          <div>
            <label className="block text-sm font-bold text-fuchsia-200 mb-2.5">
              <Calendar size={14} className="inline mr-1.5 -mt-0.5" /> Available Dates
            </label>
            <div className="flex flex-wrap gap-2">
              {upcomingDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date])}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selDates.includes(date)
                      ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-md shadow-fuchsia-500/25'
                      : 'bg-white/10 text-fuchsia-200 border border-white/10 hover:bg-white/15'
                  }`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div>
            <label className="block text-sm font-bold text-fuchsia-200 mb-2.5">
              <Clock size={14} className="inline mr-1.5 -mt-0.5" /> Available Times
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selTimes.includes(time)
                      ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-md shadow-fuchsia-500/25'
                      : 'bg-white/10 text-fuchsia-200 border border-white/10 hover:bg-white/15'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Course */}
          <div>
            <label className="block text-sm font-bold text-fuchsia-200 mb-2.5">
              <Star size={14} className="inline mr-1.5 -mt-0.5" /> Preferred Course
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyCourses.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPrefCourse(c.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    prefCourse === c.id
                      ? 'bg-gradient-to-r from-fuchsia-600/30 to-orange-600/20 border border-fuchsia-400/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-fuchsia-300/60">{c.city}, {c.state} · {c.distance} mi</p>
                  </div>
                  {prefCourse === c.id && <Check size={16} className="text-fuchsia-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Alternate Courses */}
          <div>
            <label className="block text-sm font-bold text-fuchsia-200 mb-2.5">
              <MapPin size={14} className="inline mr-1.5 -mt-0.5" /> Alternate Courses (up to 3)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyCourses.filter(c => c.id !== prefCourse).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setAltCourses(prev =>
                      prev.includes(c.id)
                        ? prev.filter(id => id !== c.id)
                        : prev.length < 3 ? [...prev, c.id] : prev
                    );
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    altCourses.includes(c.id)
                      ? 'bg-gradient-to-r from-fuchsia-600/30 to-orange-600/20 border border-fuchsia-400/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-fuchsia-300/60">{c.city}, {c.state} · {c.distance} mi</p>
                  </div>
                  {altCourses.includes(c.id) && <Check size={16} className="text-fuchsia-400" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveAvailability}
            disabled={selDates.length === 0 || selTimes.length === 0 || !prefCourse}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
          >
            Save Availability
          </button>
        </div>
      </div>
    );
  }

  // ——— Create Group Sheet ———
  if (showCreateGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-orange-950 px-4 pt-4 pb-28 animate-fade-in">
        <button onClick={() => setShowCreateGroup(false)} className="flex items-center gap-1 text-fuchsia-300 text-sm font-medium mb-4 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-extrabold text-white mb-1">Create Chat Group</h2>
        <p className="text-sm text-fuchsia-200/60 mb-6">Pick your favorite golf buddies to chat with.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-fuchsia-200 mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Weekend Warriors"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-fuchsia-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-400/50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-fuchsia-200 mb-2.5">Select Members</label>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {otherUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedMembers(prev =>
                    prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]
                  )}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                    selectedMembers.includes(user.id)
                      ? 'bg-gradient-to-r from-fuchsia-600/30 to-orange-600/20 border border-fuchsia-400/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-fuchsia-500/20">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-fuchsia-300/50">{user.skillLevel}</p>
                  </div>
                  {selectedMembers.includes(user.id) && <Check size={16} className="text-fuchsia-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
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
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-b from-violet-950 to-fuchsia-950">
        {/* Chat Header */}
        <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => { setActiveGroupId(null); setShowGroupAvailability(false); }} className="text-fuchsia-300 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">{group.name}</h3>
              <p className="text-xs text-fuchsia-300/50">
                {group.memberIds.map(id => getUserById(id)?.firstName).filter(Boolean).join(', ')}
              </p>
            </div>
            <button
              onClick={() => setShowGroupAvailability(!showGroupAvailability)}
              className={`p-2 rounded-xl transition-all ${showGroupAvailability ? 'bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-400/40' : 'bg-white/10 text-fuchsia-300/60 border border-white/10'}`}
            >
              <Filter size={18} />
            </button>
          </div>

          {showGroupAvailability && (
            <div className="pb-1 animate-fade-in">
              <AvailabilityFilterTabs filter={groupAvailFilter} setFilter={setGroupAvailFilter} />
              {groupBuddies.length > 0 ? (
                <AvailabilityResults
                  buddies={groupBuddies}
                  commonDates={groupCommonDates}
                  commonTimes={groupCommonTimes}
                  nearbyDeals={nearbyDeals}
                  formatDate={formatDate}
                  getCourseName={getCourseName}
                />
              ) : (
                <p className="text-xs text-fuchsia-300/40 text-center py-2">No matching availability for this filter.</p>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {group.messages.map(msg => {
            const sender = getUserById(msg.senderId);
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                  {!isMe && (
                    <p className="text-[10px] text-fuchsia-300/40 mb-0.5 ml-1">{sender?.firstName}</p>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white rounded-br-md shadow-md shadow-fuchsia-500/20'
                      : 'bg-white/10 text-white rounded-bl-md backdrop-blur-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-fuchsia-300/30 mt-0.5 mx-1">
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-violet-950/80 backdrop-blur-md border-t border-white/10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-fuchsia-300/30 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white disabled:opacity-30 transition-all shadow-md shadow-fuchsia-500/20 active:scale-95"
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
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-orange-950 pb-28">
      {/* Header */}
      <div className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Zap size={20} className="text-orange-400" />
              <h1 className="text-2xl font-extrabold text-white">Let's Play Buddy</h1>
            </div>
            <p className="text-xs text-fuchsia-200/50">Find partners, plan tee times together</p>
          </div>
          <button
            onClick={() => setShowSetAvailability(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all active:scale-95"
          >
            <Calendar size={14} className="inline mr-1 -mt-0.5" />
            Set Availability
          </button>
        </div>
      </div>

      <div className="px-4">
        {/* My Availability Summary */}
        {getMyAvailability() && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600/20 to-orange-600/15 border border-fuchsia-400/20 backdrop-blur-sm">
            <p className="text-xs font-bold text-fuchsia-300 mb-1.5">Your Availability</p>
            <p className="text-xs text-fuchsia-200/70">
              {getMyAvailability()!.availableDates.map(d => formatDate(d)).join(', ')} · {getMyAvailability()!.availableTimes.join(', ')}
            </p>
            <p className="text-xs text-fuchsia-300/50 mt-0.5">
              Preferred: {getCourseName(getMyAvailability()!.preferredCourseId)}
            </p>
          </div>
        )}

        {/* Main Tabs: Buddies | Chat */}
        <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1 mb-5 border border-white/5">
          <button
            onClick={() => setMainTab('buddies')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              mainTab === 'buddies'
                ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-lg shadow-fuchsia-500/25'
                : 'text-fuchsia-300/50 hover:text-fuchsia-200'
            }`}
          >
            <Users size={15} className="inline mr-1.5 -mt-0.5" />
            Buddies
          </button>
          <button
            onClick={() => setMainTab('chat')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              mainTab === 'chat'
                ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-lg shadow-fuchsia-500/25'
                : 'text-fuchsia-300/50 hover:text-fuchsia-200'
            }`}
          >
            <MessageCircle size={15} className="inline mr-1.5 -mt-0.5" />
            Chat Groups
          </button>
        </div>

        {mainTab === 'buddies' ? (
          <>
            <AvailabilityFilterTabs filter={availFilter} setFilter={setAvailFilter} />

            {filteredBuddies.length > 0 ? (
              <AvailabilityResults
                buddies={filteredBuddies}
                commonDates={commonDates}
                commonTimes={commonTimes}
                nearbyDeals={nearbyDeals}
                formatDate={formatDate}
                getCourseName={getCourseName}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <Users size={28} className="text-fuchsia-400/40" />
                </div>
                <p className="text-sm text-fuchsia-300/40">No buddies match this filter.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="w-full mb-4 py-3.5 rounded-xl border-2 border-dashed border-fuchsia-400/30 text-fuchsia-300 text-sm font-bold hover:bg-fuchsia-500/10 hover:border-fuchsia-400/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Plus size={16} /> Create New Group
            </button>

            {chatGroups.filter(g => g.memberIds.includes(currentUser.id)).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <MessageCircle size={28} className="text-fuchsia-400/40" />
                </div>
                <p className="text-sm text-fuchsia-300/40">No chat groups yet. Create one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatGroups
                  .filter(g => g.memberIds.includes(currentUser.id))
                  .map(group => {
                    const lastMsg = group.messages[group.messages.length - 1];
                    const lastSender = lastMsg ? getUserById(lastMsg.senderId) : null;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setActiveGroupId(group.id)}
                        className="w-full bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm p-4 text-left hover:bg-white/10 hover:border-fuchsia-400/30 transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-sm font-bold text-white">{group.name}</h3>
                          <ChevronRight size={16} className="text-fuchsia-400/40" />
                        </div>
                        <p className="text-xs text-fuchsia-300/40 mb-1.5">
                          {group.memberIds.map(id => getUserById(id)?.firstName).filter(Boolean).join(', ')}
                        </p>
                        {lastMsg && (
                          <p className="text-xs text-fuchsia-200/30 truncate">
                            <span className="font-medium text-fuchsia-200/50">{lastSender?.firstName}:</span> {lastMsg.text}
                          </p>
                        )}
                      </button>
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
          className={`shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === t.key
              ? 'bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-md shadow-fuchsia-500/20'
              : 'bg-white/8 text-fuchsia-300/50 hover:bg-white/12 hover:text-fuchsia-200 border border-white/5'
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
  formatDate,
  getCourseName,
}: {
  buddies: { user: User; avail: BuddyAvailability | undefined; distance: number }[];
  commonDates: string[];
  commonTimes: string[];
  nearbyDeals: (typeof hotDeals[number] & { distance: number })[];
  formatDate: (iso: string) => string;
  getCourseName: (id: string) => string;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Common dates/times */}
      {commonDates.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-400/20">
          <p className="text-xs font-bold text-cyan-300 mb-1">Common Available Dates</p>
          <p className="text-xs text-cyan-200/70">{commonDates.map(d => formatDate(d)).join(', ')}</p>
          {commonTimes.length > 0 && (
            <p className="text-xs text-cyan-300/50 mt-0.5">Common Times: {commonTimes.join(', ')}</p>
          )}
        </div>
      )}

      {/* Buddy list */}
      <div className="space-y-3">
        {buddies.map(({ user, avail, distance }) => (
          <div key={user.id} className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm p-4 hover:bg-white/8 transition-all">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-fuchsia-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-fuchsia-500/20">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">{user.firstName} {user.lastName}</h4>
                <div className="flex items-center gap-2 text-xs text-fuchsia-300/40">
                  <span className="flex items-center gap-0.5"><MapPin size={10} /> {distance} mi</span>
                  <span>·</span>
                  <span>{user.skillLevel}</span>
                </div>
              </div>
            </div>
            {avail && (
              <div className="space-y-1.5 ml-14">
                <p className="text-xs text-fuchsia-200/50">
                  <Calendar size={11} className="inline mr-1 -mt-0.5 text-fuchsia-400/50" />
                  {avail.availableDates.map(d => formatDate(d)).join(', ')}
                </p>
                <p className="text-xs text-fuchsia-200/50">
                  <Clock size={11} className="inline mr-1 -mt-0.5 text-fuchsia-400/50" />
                  {avail.availableTimes.join(', ')}
                </p>
                <p className="text-xs text-fuchsia-200/40">
                  <Star size={11} className="inline mr-1 -mt-0.5 text-orange-400/60" />
                  {getCourseName(avail.preferredCourseId)}
                  {avail.alternateCourseIds.length > 0 && (
                    <span className="text-fuchsia-300/30"> · +{avail.alternateCourseIds.length} alternates</span>
                  )}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top 3 Hot Deal Courses */}
      {nearbyDeals.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
            <Flame size={14} className="text-orange-400" /> Top 3 Hot Deals Nearby
          </h3>
          <div className="space-y-2">
            {nearbyDeals.map(deal => (
              <div key={deal.id} className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-3.5 flex items-center gap-3 hover:bg-white/8 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deal.imageGradient} flex items-center justify-center shrink-0 shadow-md`}>
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{deal.courseName}</p>
                  <p className="text-xs text-fuchsia-300/40">{deal.city}, {deal.state} · {deal.distance} mi</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-emerald-400">${deal.dealPrice}</span>
                    <span className="text-xs text-fuchsia-300/30 line-through">${deal.originalPrice}</span>
                    <span className="text-[10px] text-fuchsia-300/30">· {deal.teeTime} · {deal.holes}H</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
