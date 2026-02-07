import React, { useState } from 'react';
import { User } from '../types';
import { persistence } from '../services/persistenceService';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';
// @ts-ignore
import mosandLogo from '../assets/mosand_logo_v2.svg';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isLogin) {
      const result = persistence.login(username, password);
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onLogin(result.user);
      }
    } else {
      const result = persistence.register(username, password);
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onLogin(result.user);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
            <img src={mosandLogo} alt="MoSand" className="h-20 mb-6 drop-shadow-sm" />
            <h2 className="text-2xl font-serif text-slate-800 text-center">
              {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
            </h2>
            <p className="text-slate-500 text-center mt-2 text-sm">
              {isLogin ? 'Enter your sanctuary of memory.' : 'Create a space for your inner world.'}
            </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder={isLogin ? "Your secret key" : "Create a secret key"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 group"
            >
              {isLogin ? 'Enter Journal' : 'Create Account'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {isLogin ? "First time here?" : "Already have a space?"}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="ml-2 font-bold text-slate-800 hover:text-indigo-600 transition-colors underline decoration-slate-300 underline-offset-4"
            >
              {isLogin ? "Create account" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
