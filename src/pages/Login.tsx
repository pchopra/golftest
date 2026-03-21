import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import type { SkillLevel, Gender } from '../data/mockUsers';

type Tab = 'login' | 'register';

export default function Login() {
  const { login, register, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Beginner');
  const [gender, setGender] = useState<Gender>('Prefer not to say');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const skillLevels: SkillLevel[] = ['Beginner', 'Average', 'Skilled', 'Casual/Sporty'];
  const genders: Gender[] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    const success = login(loginEmail.trim());
    if (success) {
      navigate('/buddy');
    } else {
      setError('No account found with that email. Please register first.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const missing: string[] = [];
    if (!firstName.trim()) missing.push('First Name');
    if (!lastName.trim()) missing.push('Last Name');
    if (!email.trim()) missing.push('Email');
    if (!street.trim()) missing.push('Street Address');
    if (!city.trim()) missing.push('City');
    if (!state.trim()) missing.push('State');
    if (!zip.trim()) missing.push('ZIP Code');
    if (missing.length > 0) {
      setError(`Required: ${missing.join(', ')}`);
      return;
    }
    const fullAddress = `${street.trim()}, ${city.trim()}, ${state.trim()} ${zip.trim()}`;
    register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      skillLevel,
      gender,
      address: fullAddress,
      lat: 37.7749 + (Math.random() - 0.5) * 0.2,
      lng: -122.4194 + (Math.random() - 0.5) * 0.2,
    });
    navigate('/buddy');
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
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Location</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">{currentUser.address}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Member Since</span>
              <span className="text-sm font-medium text-gray-900">{currentUser.createdAt}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const handleDemoLogin = (demoEmail: string) => {
    setError('');
    const success = login(demoEmail);
    if (success) {
      navigate('/buddy');
    } else {
      setError('Demo account not found');
    }
  };

  const handleQuickRegister = () => {
    const ts = Date.now().toString().slice(-4);
    register({
      firstName: 'Test',
      lastName: `User${ts}`,
      email: `test${ts}@demo.com`,
      skillLevel: 'Beginner',
      gender: 'Prefer not to say',
      address: '123 Market St, San Francisco, CA 94105',
      lat: 37.7749 + (Math.random() - 0.5) * 0.2,
      lng: -122.4194 + (Math.random() - 0.5) * 0.2,
    });
    navigate('/buddy');
  };

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
          onClick={() => { setTab('login'); setError(''); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'login' ? 'bg-white text-golf-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          <LogIn size={16} className="inline mr-1.5 -mt-0.5" />
          Sign In
        </button>
        <button
          onClick={() => { setTab('register'); setError(''); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'register' ? 'bg-white text-golf-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          <UserPlus size={16} className="inline mr-1.5 -mt-0.5" />
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {tab === 'login' ? (
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs font-bold text-amber-800 mb-3">Quick Demo Login</p>
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
          <form onSubmit={handleRegister} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Account</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
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
                    required
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
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Level <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
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

              {/* Address Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Home Address <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-400 mb-2">Used to find courses and buddies near you</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    placeholder="ZIP Code"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-5 py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors"
            >
              Create Account
            </button>
          </form>

          {/* Quick Register for Testing */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
            <p className="text-xs font-bold text-blue-800 mb-2">Quick Test Account</p>
            <p className="text-[10px] text-blue-600 mb-3">Create a test account instantly without filling out the form</p>
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
