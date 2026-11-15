import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectAnalytics, selectRawTrades, selectMarkets, selectSelectedMarketId, setUser } from '@/app/store';
import { authApi } from '@/features/auth/api/authApi';
import { UserRound, Trophy, Target, Activity, CalendarDays, TrendingUp, Pencil, Save, X } from 'lucide-react';

const money = (value, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));
const fieldClass = 'mt-1 w-full rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500';
const labelClass = 'text-xs font-medium text-slate-400';
const valueText = (value) => value == null || value === '' ? 'Not set' : value;

function Metric({ label, value, note }) {
  return <div className="rounded-xl border border-pit-border bg-pit-card p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div>;
}

export function ProfileView({ mode = 'profile' }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  useEffect(() => {
    authApi.getCurrentProfile().then((response) => {
      const data = response.data?.data || response.data?.user || response.data;
      if (!data || !data.id) return;
      dispatch(setUser({
        ...user,
        ...data,
        id: String(data.id),
        fullName: data.name ?? user?.fullName,
        markets: data.tradingMarkets ?? user?.markets,
        baseCurrency: data.accountCurrency ?? user?.baseCurrency,
        timezone: data.timeZone ?? user?.timezone,
        usualSession: [data.usualSessionStart, data.usualSessionEnd].filter(Boolean).join(' to '),
      }));
    }).catch(() => {});
  }, [dispatch]);
  const analytics = useSelector(selectAnalytics);
  const trades = useSelector(selectRawTrades);
  const markets = useSelector(selectMarkets);
  const selectedMarketId = useSelector(selectSelectedMarketId);
  const market = markets.find((item) => item.id === selectedMarketId);
  const currency = analytics?.currency || market?.currency || user?.baseCurrency || 'USD';
  const name = user?.fullName || 'Your profile';
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const closed = trades.filter((trade) => trade.status === 'CLOSED' || trade.exitPrice != null);
  const wins = closed.filter((trade) => Number(trade.netPnl ?? trade.pnl ?? 0) > 0).length;
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : null;
  const [editing, setEditing] = useState(mode === 'settings');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const initialForm = useMemo(() => ({
    name: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    location: user?.location || '',
    tradingExperience: user?.tradingExperience || '',
    tradingMarkets: Array.isArray(user?.markets) ? user.markets.join(', ') : user?.markets || user?.tradingMarkets || '',
    tradingStyle: user?.tradingStyle || '',
    usualSessionStart: user?.usualSessionStart || user?.usualSession?.split(' to ')[0] || '',
    usualSessionEnd: user?.usualSessionEnd || user?.usualSession?.split(' to ')[1]?.replace(/\s*IST$/,'') || '',
    riskPerTrade: user?.riskPerTrade || '',
    accountCurrency: user?.baseCurrency || user?.accountCurrency || currency,
    timeZone: user?.timezone || user?.timeZone || 'Asia/Kolkata',
  }), [user, currency]);
  const [form, setForm] = useState(initialForm);
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = { ...form, tradingMarkets: form.tradingMarkets, riskPerTrade: form.riskPerTrade === '' ? null : Number(form.riskPerTrade) };
      const response = await authApi.updateProfile(payload);
      const data = response.data?.data || response.data?.user || response.data;
      const nextUser = {
        ...user,
        ...data,
        fullName: data?.name ?? form.name,
        name: data?.name ?? form.name,
        email: data?.email ?? form.email,
        username: data?.username ?? form.username.replace(/^@/, ''),
        markets: data?.tradingMarkets ?? form.tradingMarkets,
        tradingMarkets: data?.tradingMarkets ?? form.tradingMarkets,
        baseCurrency: data?.accountCurrency ?? form.accountCurrency,
        accountCurrency: data?.accountCurrency ?? form.accountCurrency,
        timezone: data?.timeZone ?? form.timeZone,
        timeZone: data?.timeZone ?? form.timeZone,
        usualSession: [data?.usualSessionStart ?? form.usualSessionStart, data?.usualSessionEnd ?? form.usualSessionEnd].filter(Boolean).join(' to ') + (form.usualSessionEnd ? ' IST' : ''),
      };
      dispatch(setUser(nextUser));
      setForm((current) => ({ ...current, ...form }));
      setEditing(false); setSuccess('Profile saved successfully.');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally { setSaving(false); }
  };

  if (mode === 'settings') {
    return <section className="mx-auto max-w-4xl space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Account</p><h1 className="mt-2 text-2xl font-semibold text-white">Account settings</h1><p className="mt-1 text-sm text-slate-400">Update your account details and trading preferences.</p></div>
      <ProfileEditor form={form} change={change} save={save} saving={saving} error={error} success={success} />
    </section>;
  }

  return <section className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Account</p><h1 className="mt-2 text-2xl font-semibold text-white">Profile</h1></div><button onClick={() => { setForm(initialForm); setEditing(true); setError(''); setSuccess(''); }} className="inline-flex items-center gap-2 rounded-lg border border-pit-border px-3 py-2 text-sm text-slate-200 hover:bg-pit-bg"><Pencil className="h-4 w-4"/> Edit profile</button></div>
    {success && <p role="status" className="text-sm text-emerald-400">{success}</p>}
    {editing ? <ProfileEditor form={form} change={change} save={save} saving={saving} error={error} success={success} onCancel={() => { setEditing(false); setForm(initialForm); }} /> : <>
      <div className="rounded-2xl border border-pit-border bg-pit-card p-6"><div className="flex flex-wrap items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-500/15 text-xl font-semibold text-indigo-300">{initials || <UserRound/>}</div><div className="min-w-0 flex-1"><h2 className="text-xl font-semibold text-white">{name}</h2><p className="mt-1 text-sm text-slate-400">{user?.username ? '@' + user.username : user?.email || 'Add a username in profile settings'}</p><p className="mt-2 text-sm text-slate-300">{user?.bio || 'Add a short bio to tell your trading story.'}</p></div><div className="text-sm text-slate-400">{user?.location || ''}</div></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Net P&L" value={analytics ? money(analytics.totalNetPnl, currency) : '—'} note="Current selected market"/><Metric label="Win rate" value={analytics ? String(analytics.winRate ?? winRate ?? 0) + '%' : winRate == null ? '—' : winRate + '%'} note="Closed trades"/><Metric label="Profit factor" value={analytics?.profitFactor ?? '—'} note="Current selected market"/><Metric label="Trades logged" value={analytics?.totalTrades ?? trades.length} note="Loaded trading history"/></div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-pit-border bg-pit-card p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-400"/><h2 className="font-semibold text-white">Trading profile</h2></div><button onClick={() => { setForm(initialForm); setEditing(true); }} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button></div><dl className="mt-5 grid gap-5 sm:grid-cols-2">{[['Experience',user?.tradingExperience],['Markets',Array.isArray(user?.markets)?user.markets.join(', '):user?.markets || user?.tradingMarkets],['Style',user?.tradingStyle],['Usual session',user?.usualSession || [user?.usualSessionStart,user?.usualSessionEnd].filter(Boolean).join(' to ')],['Risk per trade',user?.riskPerTrade],['Account currency',user?.baseCurrency || currency],['Time zone',user?.timezone || user?.timeZone]].map(([label,value])=><div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-200">{valueText(value)}</dd></div>)}</dl></div>
        <div className="rounded-xl border border-pit-border bg-pit-card p-5"><div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400"/><h2 className="font-semibold text-white">Achievements</h2></div><p className="mt-2 text-sm text-slate-400">Milestones based on your trading activity.</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-pit-bg p-3"><TrendingUp className="h-4 w-4 text-emerald-400"/><p className="mt-2 text-xs text-slate-400">Winning trades</p><p className="mt-1 text-lg font-semibold text-white">{wins}</p></div><div className="rounded-lg bg-pit-bg p-3"><CalendarDays className="h-4 w-4 text-indigo-400"/><p className="mt-2 text-xs text-slate-400">Closed trades</p><p className="mt-1 text-lg font-semibold text-white">{closed.length}</p></div></div></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2"><div className="rounded-xl border border-pit-border bg-pit-card p-5"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-indigo-400"/><h2 className="font-semibold text-white">Goals</h2></div><p className="mt-3 text-sm text-slate-400">Your personal trading goals will appear here.</p></div><div className="rounded-xl border border-pit-border bg-pit-card p-5"><h2 className="font-semibold text-white">Recent activity</h2>{trades.slice(0,5).length ? <ul className="mt-3 divide-y divide-pit-border">{trades.slice(0,5).map((trade,index)=><li key={trade.id ?? index} className="flex justify-between gap-3 py-3 text-sm"><span className="text-slate-300">{trade.symbol || trade.marketName || 'Trade'} · {trade.direction || trade.side || '—'}</span><span className="text-slate-400">{trade.netPnl == null ? '—' : money(trade.netPnl,currency)}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-400">Your recent trades will appear here once loaded.</p>}</div></div>
    </>}
  </section>;
}

function ProfileEditor({ form, change, save, saving, error, success, onCancel }) {
  const input = (key, label, placeholder = '') => <label className="block"><span className={labelClass}>{label}</span><input className={fieldClass} value={form[key] ?? ''} onChange={change(key)} placeholder={placeholder}/></label>;
  const select = (key, label, options) => <label className="block"><span className={labelClass}>{label}</span><select className={fieldClass} value={form[key] ?? ''} onChange={change(key)}><option value="">Select…</option>{options.map((option)=><option key={option} value={option}>{option}</option>)}</select></label>;
  return <form onSubmit={save} className="rounded-2xl border border-pit-border bg-pit-card p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-white">Edit profile</h2><p className="mt-1 text-xs text-slate-400">Changes are saved to your account.</p></div>{onCancel && <button type="button" onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-pit-bg"><X className="h-4 w-4"/></button>}</div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{input('name','Full name')}{input('username','Username','your-handle')}{input('email','Email address')}{input('location','Location','City, Country')}<label className="block sm:col-span-2"><span className={labelClass}>Bio</span><textarea className={fieldClass} rows={3} maxLength={280} value={form.bio} onChange={change('bio')} placeholder="A short introduction about your trading journey"/></label>{select('tradingExperience','Trading experience',['Less than 1 year','1 to 2 years','2 to 3 years','3 to 5 years','5+ years'])}{select('tradingStyle','Trading style',['Scalping','Intraday','Swing','Position'])}{input('tradingMarkets','Markets','Futures, Stocks, Options, Crypto')}{input('usualSessionStart','Usual session start','09:15')}{input('usualSessionEnd','Usual session end','11:30')}{input('riskPerTrade','Risk per trade (%)','1')}{select('accountCurrency','Account currency',['USD','INR','EUR','GBP','AED'])}{input('timeZone','Time zone','Asia/Kolkata')}</div>
    {error && <p role="alert" className="mt-4 text-sm text-rose-400">{error}</p>}{success && <p role="status" className="mt-4 text-sm text-emerald-400">{success}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3">{onCancel && <button type="button" onClick={onCancel} className="rounded-lg border border-pit-border px-4 py-2 text-sm text-slate-300">Cancel</button>}<button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"><Save className="h-4 w-4"/>{saving ? 'Saving…' : 'Save changes'}</button></div>
  </form>;
}
