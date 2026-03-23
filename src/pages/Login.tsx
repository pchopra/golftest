import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { getCoordinatesForZip } from '../data/zipCoordinates';
import type { SkillLevel, Gender } from '../data/mockUsers';
import Avatar from '../components/Avatar';

type Tab = 'login' | 'register';

export default function Login() {
  const {
    login, register, loginWithSupabase, registerWithSupabase,
    currentUser, allUsers, session, loading: authLoading, logout,
    updateProfilePicture,
  } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [supaLoading, setSupaLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const goToBuddy = () => { window.location.hash = '/buddy'; };

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Beginner');
  const [gender, setGender] = useState<Gender>('Prefer not to say');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const skillLevels: SkillLevel[] = ['Beginner', 'Average', 'Skilled', 'Casual/Sporty'];
  const genders: Gender[] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  // Legacy demo login
  const handleDemoLogin = (demoEmail: string) => {
    setError('');
    setSuccessMsg('');
    const foundUser = allUsers.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
    if (!foundUser) {
      setError('Demo account not found');
      return;
    }
    login(foundUser.email);
    goToBuddy();
  };

  // Quick test account
  const handleQuickRegister = () => {
    const ts = Date.now().toString().slice(-4);
    register({
      firstName: 'Test',
      lastName: `User${ts}`,
      email: `test${ts}@demo.com`,
      phone: `(415) 555-${ts}`,
      skillLevel: 'Beginner',
      gender: 'Prefer not to say',
      address: '123 Market St, San Francisco, CA 94105',
      lat: 37.7749 + (Math.random() - 0.5) * 0.2,
      lng: -122.4194 + (Math.random() - 0.5) * 0.2,
    });
    goToBuddy();
  };

  // Supabase login handler
  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!loginEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!loginPassword.trim()) {
      setError('Please enter your password');
      return;
    }
    setSupaLoading(true);
    try {
      const { error: err } = await loginWithSupabase(loginEmail.trim(), loginPassword);
      setSupaLoading(false);
      if (err) {
        setError(err);
        return;
      }
      goToBuddy();
    } catch (e) {
      setSupaLoading(false);
      setError('Login failed. Please try again.');
      console.error('[GolfBuddy] Login error:', e);
    }
  };

  // Supabase register handler
  const handleSupabaseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const missing: string[] = [];
    if (!firstName.trim()) missing.push('First Name');
    if (!lastName.trim()) missing.push('Last Name');
    if (!email.trim()) missing.push('Email');
    if (!password.trim()) missing.push('Password');
    if (!phone.trim()) missing.push('Phone Number');
    if (!zip.trim()) missing.push('ZIP Code');
    if (!city.trim()) missing.push('City');
    if (!state.trim()) missing.push('State');
    if (missing.length > 0) {
      setError(`Required: ${missing.join(', ')}`);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const fullAddress = [street.trim(), city.trim(), `${state.trim()} ${zip.trim()}`.trim()]
      .filter(Boolean)
      .join(', ');
    // Derive coordinates from zip code
    const zipCoords = getCoordinatesForZip(zip.trim());
    const userLat = zipCoords?.lat ?? 37.7749;
    const userLng = zipCoords?.lng ?? -122.4194;
    setSupaLoading(true);
    const { error: err } = await registerWithSupabase(email.trim(), password, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      skillLevel,
      gender,
      address: fullAddress,
      lat: userLat,
      lng: userLng,
    });
    setSupaLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setSuccessMsg('Account created successfully!');
  };

  // If already logged in, show profile
  if (currentUser) {
    return (
      <div className="px-4 pt-6 pb-28">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                alert('Image must be under 5 MB');
                return;
              }
              // Compress and resize image to keep the stored data small
              const img = new Image();
              img.onload = () => {
                const MAX = 256;
                let w = img.width, h = img.height;
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                updateProfilePicture(dataUrl);
                URL.revokeObjectURL(img.src);
              };
              img.src = URL.createObjectURL(file);
              e.target.value = '';
            }}
          />
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              firstName={currentUser.firstName}
              lastName={currentUser.lastName}
              profilePicture={currentUser.profilePicture}
              size="xl"
              editable
              onEdit={() => fileInputRef.current?.click()}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              {currentUser.phone && <p className="text-xs text-gray-400">{currentUser.phone}</p>}
              {session && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-golf-100 text-golf-700 text-[10px] font-semibold">
                  Supabase Auth
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {currentUser.phone && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Phone</span>
                <span className="text-sm font-medium text-gray-900">{currentUser.phone}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Skill Level</span>
              <span className="text-sm font-medium text-gray-900">{currentUser.skillLevel}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="text-sm font-medium text-gray-900">{currentUser.gender}</span>
            </div>
            {currentUser.address && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">{currentUser.address}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Member Since</span>
              <span className="text-sm font-medium text-gray-900">{currentUser.createdAt}</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-golf-600" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-36 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-golf-600 to-golf-800 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to GolfBuddy</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in or create an account to find playing partners</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'login' ? 'bg-white text-golf-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          <LogIn size={16} className="inline mr-1.5 -mt-0.5" />
          Sign In
        </button>
        <button
          onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'register' ? 'bg-white text-golf-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          <UserPlus size={16} className="inline mr-1.5 -mt-0.5" />
          Register
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {tab === 'login' ? (
        <div className="space-y-4">
        <form onSubmit={handleSupabaseLogin} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sign In</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="text"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={supaLoading}
            className="w-full py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {supaLoading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>

        {/* Quick Demo Login */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <p className="text-xs font-bold text-amber-800 mb-3">Quick Demo Login (no password needed)</p>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('mike.j@email.com')}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              Sign in as Mike Johnson
            </button>
            <button
              onClick={() => handleDemoLogin('sarah.chen@email.com')}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              Sign in as Sarah Chen
            </button>
          </div>
        </div>
        </div>
      ) : (
        <div className="space-y-4">
        <form onSubmit={handleSupabaseRegister} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create Account</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="email"
                autoCapitalize="off"
                autoCorrect="off"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(415) 555-0100"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Level</label>
              <div className="grid grid-cols-2 gap-2">
                {skillLevels.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillLevel(level)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      skillLevel === level
                        ? 'border-golf-600 bg-golf-50 text-golf-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {genders.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      gender === g
                        ? 'border-golf-600 bg-golf-50 text-golf-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Home Address <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-400 mb-2">Used to find courses and buddies near you</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Street address (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  placeholder="ZIP Code *"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={supaLoading}
            className="w-full mt-5 py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {supaLoading && <Loader2 size={16} className="animate-spin" />}
            Create Account
          </button>
        </form>

        {/* Quick Register for Testing */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <p className="text-xs font-bold text-blue-800 mb-2">Quick Test Account</p>
          <p className="text-[10px] text-blue-600 mb-3">Create a test account instantly without filling out the form (local only)</p>
          <button
            onClick={handleQuickRegister}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Create Test Account & Start
          </button>
        </div>
        </div>
      )}
    </div>
  );
}
