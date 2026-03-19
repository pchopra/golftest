export type SkillLevel = 'Beginner' | 'Average' | 'Skilled' | 'Casual/Sporty';
export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skillLevel: SkillLevel;
  gender: Gender;
  address: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface BuddyAvailability {
  userId: string;
  availableDates: string[]; // ISO date strings
  availableTimes: string[]; // e.g. '7:00 AM', '9:30 AM'
  preferredCourseId: string;
  alternateCourseIds: string[]; // up to 3 alternates
}

export interface ChatGroup {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// Pre-registered mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@email.com',
    skillLevel: 'Skilled',
    gender: 'Male',
    address: '123 Market St, San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    createdAt: '2026-01-15',
  },
  {
    id: 'user-2',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@email.com',
    skillLevel: 'Average',
    gender: 'Female',
    address: '456 University Ave, Berkeley, CA',
    lat: 37.8716,
    lng: -122.2727,
    createdAt: '2026-02-01',
  },
  {
    id: 'user-3',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'jwilson@email.com',
    skillLevel: 'Beginner',
    gender: 'Male',
    address: '789 El Camino Real, Palo Alto, CA',
    lat: 37.4419,
    lng: -122.1430,
    createdAt: '2026-02-10',
  },
  {
    id: 'user-4',
    firstName: 'Emily',
    lastName: 'Park',
    email: 'emily.park@email.com',
    skillLevel: 'Casual/Sporty',
    gender: 'Female',
    address: '321 Broadway, Burlingame, CA',
    lat: 37.5841,
    lng: -122.3660,
    createdAt: '2026-02-20',
  },
  {
    id: 'user-5',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'dmartinez@email.com',
    skillLevel: 'Skilled',
    gender: 'Male',
    address: '555 Main St, Alameda, CA',
    lat: 37.7652,
    lng: -122.2416,
    createdAt: '2026-03-01',
  },
  {
    id: 'user-6',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'lisa.t@email.com',
    skillLevel: 'Average',
    gender: 'Female',
    address: '100 Pacific Ave, Pacifica, CA',
    lat: 37.6138,
    lng: -122.4869,
    createdAt: '2026-03-05',
  },
  {
    id: 'user-7',
    firstName: 'Ryan',
    lastName: 'Kim',
    email: 'ryan.kim@email.com',
    skillLevel: 'Beginner',
    gender: 'Male',
    address: '222 Grand Ave, South San Francisco, CA',
    lat: 37.6547,
    lng: -122.4077,
    createdAt: '2026-03-10',
  },
  {
    id: 'user-8',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.p@email.com',
    skillLevel: 'Casual/Sporty',
    gender: 'Female',
    address: '400 Castro St, Mountain View, CA',
    lat: 37.3861,
    lng: -122.0839,
    createdAt: '2026-03-12',
  },
];

// Generate dates for next 7 days
function getUpcomingDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const upcoming = getUpcomingDates();

export const mockAvailability: BuddyAvailability[] = [
  {
    userId: 'user-1',
    availableDates: [upcoming[0], upcoming[1], upcoming[3]],
    availableTimes: ['7:00 AM', '9:30 AM', '2:00 PM'],
    preferredCourseId: '2',
    alternateCourseIds: ['3', '7', '11'],
  },
  {
    userId: 'user-2',
    availableDates: [upcoming[0], upcoming[2], upcoming[4]],
    availableTimes: ['9:30 AM', '11:00 AM'],
    preferredCourseId: '10',
    alternateCourseIds: ['11', '3', '14'],
  },
  {
    userId: 'user-3',
    availableDates: [upcoming[1], upcoming[2], upcoming[5]],
    availableTimes: ['7:00 AM', '11:00 AM', '3:00 PM'],
    preferredCourseId: '14',
    alternateCourseIds: ['12', '10', '7'],
  },
  {
    userId: 'user-4',
    availableDates: [upcoming[0], upcoming[1], upcoming[2], upcoming[3]],
    availableTimes: ['9:30 AM', '2:00 PM'],
    preferredCourseId: '12',
    alternateCourseIds: ['3', '14', '7'],
  },
  {
    userId: 'user-5',
    availableDates: [upcoming[0], upcoming[3], upcoming[5], upcoming[6]],
    availableTimes: ['7:00 AM', '9:30 AM'],
    preferredCourseId: '11',
    alternateCourseIds: ['2', '10', '14'],
  },
  {
    userId: 'user-6',
    availableDates: [upcoming[1], upcoming[4], upcoming[6]],
    availableTimes: ['11:00 AM', '2:00 PM', '3:00 PM'],
    preferredCourseId: '12',
    alternateCourseIds: ['7', '3', '14'],
  },
  {
    userId: 'user-7',
    availableDates: [upcoming[0], upcoming[2], upcoming[3], upcoming[6]],
    availableTimes: ['9:30 AM', '11:00 AM'],
    preferredCourseId: '7',
    alternateCourseIds: ['3', '12', '10'],
  },
  {
    userId: 'user-8',
    availableDates: [upcoming[2], upcoming[4], upcoming[5]],
    availableTimes: ['7:00 AM', '2:00 PM'],
    preferredCourseId: '14',
    alternateCourseIds: ['11', '10', '12'],
  },
];

export const mockChatGroups: ChatGroup[] = [
  {
    id: 'group-1',
    name: 'Weekend Warriors',
    memberIds: ['user-1', 'user-2', 'user-5'],
    createdBy: 'user-1',
    createdAt: '2026-03-15T10:00:00Z',
    messages: [
      { id: 'msg-1', senderId: 'user-1', text: 'Anyone free this Saturday for a round?', timestamp: '2026-03-15T10:00:00Z' },
      { id: 'msg-2', senderId: 'user-2', text: 'I\'m in! Presidio or Harding?', timestamp: '2026-03-15T10:05:00Z' },
      { id: 'msg-3', senderId: 'user-5', text: 'Harding works for me. 9:30 AM?', timestamp: '2026-03-15T10:10:00Z' },
    ],
  },
  {
    id: 'group-2',
    name: 'Beginner Buddies',
    memberIds: ['user-3', 'user-7', 'user-4'],
    createdBy: 'user-3',
    createdAt: '2026-03-16T14:00:00Z',
    messages: [
      { id: 'msg-4', senderId: 'user-3', text: 'Let\'s find a beginner-friendly course!', timestamp: '2026-03-16T14:00:00Z' },
      { id: 'msg-5', senderId: 'user-7', text: 'Lincoln Park is great and cheap!', timestamp: '2026-03-16T14:15:00Z' },
    ],
  },
];
