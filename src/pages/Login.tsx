import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Phone, ShieldCheck } from 'lucide-react';
import type { SkillLevel, Gender } from '../data/mockUsers';

type Tab = 'login' | 'register';
type VerifyMethod = 'email' | 'phone';

export default function Login() {
  const { login, register, currentUser, allUsers, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');

  // Verification state (shared by login & register)
  const [showVerify, setShowVerify] = useState(false);
  const [verifyFlow, setVerifyFlow] = useState<'login' | 'register'>('register');
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>('email');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [pendingRegData, setPendingRegData] = useState<Parameters<typeof register>[0] | null>(null);
  const [pendingLoginEmail, setPendingLoginEmail] = useState('');
  const [pendingLoginPhone, setPendingLoginPhone] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    // Find user to check if account exists and get their phone
    const foundUser = allUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (!foundUser) {
      setError('No account found with that email. Please register first.');
      return;
    }
    // Show OTP verification for login
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedCode(code);
    setEnteredCode('');
    setPendingLoginEmail(foundUser.email);
    setPendingLoginPhone(foundUser.phone || '');
    setVerifyFlow('login');
    setShowVerify(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const missing: string[] = [];
    if (!firstName.trim()) missing.push('First Name');
    if (!lastName.trim()) missing.push('Last Name');
    if (!email.trim()) missing.push('Email');
    if (!phone.trim()) missing.push('Phone Number');
    if (!street.trim()) missing.push('Street Address');
    if (!city.trim()) missing.push('City');
    if (!state.trim()) missing.push('State');
    if (!zip.trim()) missing.push('ZIP Code');
    if (missing.length > 0) {
      setError(`Required: ${missing.join(', ')}`);
      return;
    }
    const fullAddress = `${street.trim()}, ${city.trim()}, ${state.trim()} ${zip.trim()}`;
    // Generate a 5-digit code and show verification screen
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedCode(code);
    setEnteredCode('');
    setPendingRegData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      skillLevel,
      gender,
      address: fullAddress,
      lat: 37.7749 + (Math.random() - 0.5) * 0.2,
      lng: -122.4194 + (Math.random() - 0.5) * 0.2,
    });
    setShowVerify(true);
  };

  const handleVerifyCode = () => {
    setError('');
    if (enteredCode.trim() !== generatedCode) {
      setError('Invalid code. Please try again.');
      return;
    }
    if (verifyFlow === 'register' && pendingRegData) {
      register(pendingRegData);
      setShowVerify(false);
      navigate('/buddy');
    } else if (verifyFlow === 'login') {
      const success = login(pendingLoginEmail);
      setShowVerify(false);
      if (success) {
        navigate('/buddy');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleResendCode = () => {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedCode(code);
    setEnteredCode('');
    setError('');
  };

  // Verification screen
  if (showVerify) {
    return (
      <div className="px-4 pt-6 pb-36 overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-golf-600 to-golf-800 flex items-center justify-center">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {verifyFlow === 'login' ? 'Sign In Verification' : 'Verify Your Account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Choose how to receive your 5-digit OTP code</p>
        </div>

        {/* Method selection */}
        {(() => {
          const displayEmail = verifyFlow === 'login' ? pendingLoginEmail : pendingRegData?.email;
          const displayPhone = verifyFlow === 'login' ? pendingLoginPhone : pendingRegData?.phone;
          return (
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => { setVerifyMethod('email'); setError(''); }}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                  verifyMethod === 'email' ? 'border-golf-600 bg-golf-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Mail size={24} className={verifyMethod === 'email' ? 'text-golf-700' : 'text-gray-400'} />
                <span className={`text-sm font-semibold ${verifyMethod === 'email' ? 'text-golf-700' : 'text-gray-500'}`}>Email</span>
                <span className="text-[10px] text-gray-400 px-2 text-center truncate w-full">{displayEmail}</span>
              </button>
              <button
                onClick={() => { setVerifyMethod('phone'); setError(''); }}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                  verifyMethod === 'phone' ? 'border-golf-600 bg-golf-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Phone size={24} className={verifyMethod === 'phone' ? 'text-golf-700' : 'text-gray-400'} />
                <span className={`text-sm font-semibold ${verifyMethod === 'phone' ? 'text-golf-700' : 'text-gray-500'}`}>Phone</span>
                <span className="text-[10px] text-gray-400 px-2 text-center truncate w-full">{displayPhone}</span>
              </button>
            </div>
          );
        })()}

        {/* Simulated code sent banner */}
        <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200">
          <p className="text-xs font-semibold text-green-800">
            Code sent to {verifyMethod === 'email'
              ? (verifyFlow === 'login' ? pendingLoginEmail : pendingRegData?.email)
              : (verifyFlow === 'login' ? pendingLoginPhone : pendingRegData?.phone)}
          </p>
          <p className="text-[10px] text-green-600 mt-0.5">
            Demo code: <span className="font-mono font-bold text-green-800">{generatedCode}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Code entry */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter 5-digit code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={enteredCode}
            onChange={e => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="00000"
            className="w-full px-4 py-4 rounded-xl border border-gray-300 text-center text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-golf-500 focus:border-transparent"
          />
          <button
            onClick={handleVerifyCode}
            disabled={enteredCode.length !== 5}
            className="w-full mt-4 py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors disabled:opacity-40"
          >
            {verifyFlow === 'login' ? 'Verify & Sign In' : 'Verify & Create Account'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleResendCode}
            className="text-xs font-semibold text-golf-700 hover:text-golf-800"
          >
            Resend Code
          </button>
          <button
            onClick={() => { setShowVerify(false); setError(''); }}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            {verifyFlow === 'login' ? 'Back to Sign In' : 'Back to Registration'}
          </button>
        </div>
      </div>
    );
  }

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
    const foundUser = allUsers.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
    if (!foundUser) {
      setError('Demo account not found');
      return;
    }
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedCode(code);
    setEnteredCode('');
    setPendingLoginEmail(foundUser.email);
    setPendingLoginPhone(foundUser.phone || '');
    setVerifyFlow('login');
    setShowVerify(true);
  };

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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(415) 555-0100"
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
