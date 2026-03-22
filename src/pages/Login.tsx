import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

type Tab = 'login' | 'register';

export default function Login() {
  const {
    loginWithSupabase, registerWithSupabase,
    currentUser, session, loading: authLoading, logout,
  } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [supaLoading, setSupaLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    const { error: err } = await loginWithSupabase(loginEmail.trim(), loginPassword);
    setSupaLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigate('/buddy');
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
    setSupaLoading(true);
    const { error: err } = await registerWithSupabase(email.trim(), password, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: '',
      skillLevel: 'Beginner',
      gender: 'Prefer not to say',
      address: '',
      lat: 37.7749,
      lng: -122.4194,
    });
    setSupaLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setSuccessMsg('Account created successfully! You can now sign in.');
    setTab('login');
    setLoginEmail(email.trim());
    setLoginPassword('');
  };

  // If already logged in, show profile
  if (currentUser) {
    return (
      <div className="px-4 pt-6 pb-28">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-golf-600 to-golf-800 flex items-center justify-center text-white text-xl font-bold">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
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
      ) : (
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
      )}
    </div>
  );
}
