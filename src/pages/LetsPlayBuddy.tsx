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
  UserCheck, Users2, Filter, Flame,
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

  // Compute available buddies with their availability and distance
  const buddiesWithAvail = otherUsers.map(user => {
    const avail = availability.find(a => a.userId === user.id);
    const dist = getDistanceMiles(currentUser.lat, currentUser.lng, user.lat, user.lng);
    return { user, avail, distance: dist };
  }).filter(b => b.avail).sort((a, b) => a.distance - b.distance);

  // Hot deals near user
  const nearbyDeals = hotDeals
    .map(d => ({ ...d, distance: getDistanceMiles(currentUser.lat, currentUser.lng, d.lat, d.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  // Filter by availability count
  const getFilteredBuddies = (filter: AvailFilter) => {
    const withAvail = buddiesWithAvail.filter(b => b.avail && b.avail.availableDates.length > 0);
    switch (filter) {
      case 'two': return withAvail.filter((_b, _i, arr) => arr.length >= 2).slice(0, 2);
      case 'four': return withAvail.filter((_b, _i, arr) => arr.length >= 4).slice(0, 4);
      case 'moreThanTwo': return withAvail.filter((_b, _i, arr) => arr.length > 2);
      default: return withAvail;
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1 -mt-0.5" /> Available Dates
            </label>
            <div className="flex flex-wrap gap-2">
              {upcomingDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date])}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    selDates.includes(date)
                      ? 'border-golf-600 bg-golf-50 text-golf-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock size={14} className="inline mr-1 -mt-0.5" /> Available Times
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    selTimes.includes(time)
                      ? 'border-golf-600 bg-golf-50 text-golf-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Course */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Star size={14} className="inline mr-1 -mt-0.5" /> Preferred Course
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyCourses.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPrefCourse(c.id)}
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
                  {prefCourse === c.id && <Check size={16} className="text-golf-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Alternate Courses */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={14} className="inline mr-1 -mt-0.5" /> Alternate Courses (up to 3)
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                    altCourses.includes(c.id)
                      ? 'border-golf-600 bg-golf-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.city}, {c.state} · {c.distance} mi</p>
                  </div>
                  {altCourses.includes(c.id) && <Check size={16} className="text-golf-600" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveAvailability}
            disabled={selDates.length === 0 || selTimes.length === 0 || !prefCourse}
            className="w-full py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-golf-400 to-golf-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
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
            <button onClick={() => { setActiveGroupId(null); setShowGroupAvailability(false); }} className="text-golf-700">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
              <p className="text-xs text-gray-500">
                {group.memberIds.map(id => getUserById(id)?.firstName).filter(Boolean).join(', ')}
              </p>
            </div>
            <button
              onClick={() => setShowGroupAvailability(!showGroupAvailability)}
              className={`p-2 rounded-xl border transition-all ${showGroupAvailability ? 'border-golf-600 bg-golf-50 text-golf-700' : 'border-gray-200 text-gray-500'}`}
            >
              <Filter size={18} />
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
                  formatDate={formatDate}
                  getCourseName={getCourseName}

                />
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No matching availability for this filter.</p>
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
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Let's Play Buddy</h1>
            <p className="text-xs text-green-100 mt-0.5">Find partners, plan tee times together</p>
          </div>
        </div>
        <button
          onClick={() => setShowSetAvailability(true)}
          className="relative mt-4 w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Calendar size={16} />
          Set Availability
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
            mainTab === 'buddies' ? 'bg-white text-golf-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Users size={15} className="inline mr-1 -mt-0.5" />
          Buddies
        </button>
        <button
          onClick={() => setMainTab('chat')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mainTab === 'chat' ? 'bg-white text-golf-700 shadow-sm' : 'text-gray-500'
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

          {/* Results */}
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
                  return (
                    <button
                      key={group.id}
                      onClick={() => setActiveGroupId(group.id)}
                      className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left hover:border-golf-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{group.name}</h3>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        {group.memberIds.map(id => getUserById(id)?.firstName).filter(Boolean).join(', ')}
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 truncate">
                          <span className="font-medium">{lastSender?.firstName}:</span> {lastMsg.text}
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
        {buddies.map(({ user, avail, distance }) => (
          <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-golf-400 to-golf-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5"><MapPin size={10} /> {distance} mi</span>
                  <span>·</span>
                  <span>{user.skillLevel}</span>
                </div>
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
        ))}
      </div>

      {/* Top 3 Hot Deal Courses */}
      {nearbyDeals.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Flame size={14} className="text-orange-500" /> Top 3 Hot Deals Nearby
          </h3>
          <div className="space-y-2">
            {nearbyDeals.map(deal => (
              <div key={deal.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deal.imageGradient} flex items-center justify-center shrink-0`}>
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.courseName}</p>
                  <p className="text-xs text-gray-500">{deal.city}, {deal.state} · {deal.distance} mi</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-golf-700">${deal.dealPrice}</span>
                    <span className="text-xs text-gray-400 line-through">${deal.originalPrice}</span>
                    <span className="text-[10px] text-gray-500">· {deal.teeTime} · {deal.holes}H</span>
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
