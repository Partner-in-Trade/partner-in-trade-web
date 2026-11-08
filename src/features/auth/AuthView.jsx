import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  ShieldCheck,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login,
  register,
  bypassAuth,
  loginWithGoogle,
  clearAuthError,
  selectAuthError,
  selectAuthLoading,
  selectIsDevBypassEnabled,
} from '@/app/store';
import { LOGO_ALT, LOGO_SRC } from '@/constants/branding';
import { GoogleIcon } from '@/components/ui/GoogleIcon';

export function AuthView() {
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const authLoading = useSelector(selectAuthLoading);
  const isDevBypassEnabled = selectIsDevBypassEnabled();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState(null);

  const switchMode = (next) => {
    setMode(next);
    setLocalError(null);
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearAuthError());
    if (mode === 'login') {
      await dispatch(login({ email: form.email.trim(), password: form.password }));
    } else {
      const fullName = form.fullName.trim();
      const email = form.email.trim();
      if (!fullName) {
        setLocalError('Full name is required.');
        return;
      }
      if (fullName.length < 3) {
        setLocalError('Name must be at least 3 characters (required for billing).');
        return;
      }
      if (fullName.length > 25) {
        setLocalError('Name must be 25 characters or fewer.');
        return;
      }
      if (form.password.length < 10) {
        setLocalError('Password must be at least 10 characters.');
        return;
      }
      if (form.password.length > 128) {
        setLocalError('Password must be 128 characters or fewer.');
        return;
      }
      await dispatch(
        register({
          fullName,
          email,
          password: form.password,
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-pit-bg text-slate-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-pit-card border-r border-pit-border p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <img
            src={LOGO_SRC}
            alt={LOGO_ALT}
            className="h-40 w-auto max-w-full object-contain object-left"
          />
        </div>

        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Built for Disciplined Manual Execution
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Turn your trading data into a repeatable edge.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Log manual executions, track exact R-Multiples, uncover costly behavioral
            mistakes, and review your daily P&L calendar—all in one institutional-grade
            workspace.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-pit-bg/70 border border-pit-border">
              <BarChart2 className="w-5 h-5 text-pit-profit mb-2" />
              <div className="text-sm font-semibold text-white">Playbook Expectancy</div>
              <p className="text-xs text-slate-400 mt-1">
                Know exactly which setups generate your highest R-Multiple.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-pit-bg/70 border border-pit-border">
              <Calendar className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="text-sm font-semibold text-white">P&L Calendar</div>
              <p className="text-xs text-slate-400 mt-1">
                Visualize daily consistency and session win rates at a glance.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          © {new Date().getFullYear()} Partner in Trade. Spring Boot + Neon Postgres Ready.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-5">
          <div className="flex justify-center lg:hidden">
            <img
              src={LOGO_SRC}
              alt={LOGO_ALT}
              className="h-36 w-auto max-w-[320px] object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-pit-card border border-pit-border text-sm font-semibold">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2.5 rounded-lg transition ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2.5 rounded-lg transition ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="bg-pit-card border border-pit-border rounded-2xl p-8 shadow-2xl space-y-5">
            {isDevBypassEnabled && (
              <>
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
                  <div className="text-xs text-indigo-200">
                    <span className="font-semibold block text-indigo-300">Dev only</span>
                    Mock login without API (no live data).
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(bypassAuth())}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Bypass
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(loginWithGoogle())}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 border border-slate-200/20 shadow-sm transition"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  Continue with Google (dev)
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-pit-border" />
                  <span className="mx-3 text-[11px] uppercase tracking-wide text-slate-500">
                    or email
                  </span>
                  <div className="flex-grow border-t border-pit-border" />
                </div>
              </>
            )}

            {(localError || authError) && (
              <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                {localError || authError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Alex Mercer"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-pit-bg border border-pit-border text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="trader@partnerintrade.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-pit-bg border border-pit-border text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400">Password</label>
                  {mode === 'login' && isDevBypassEnabled && (
                    <button
                      type="button"
                      onClick={() => dispatch(bypassAuth())}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Dev bypass
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={mode === 'register' ? 10 : undefined}
                    maxLength={mode === 'register' ? 128 : undefined}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-pit-bg border border-pit-border text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {mode === 'register' && (
                  <p className="text-[11px] text-slate-500 mt-1.5">Use at least 10 characters.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                {authLoading
                  ? 'Please wait…'
                  : mode === 'login'
                    ? 'Sign In to Dashboard'
                    : 'Create Partner in Trade Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
