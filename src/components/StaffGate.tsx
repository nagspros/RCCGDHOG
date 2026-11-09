import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { RccgLogo } from './RccgLogo';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { StaffSite } from '../data/adminStore';
import { ApiError, api, errorMessage } from '../data/api';
import { FormError, useServerForm } from './ServerForm';

type Account = { email: string; role: 'admin' | 'pastor' };

export function StaffGate({ children }: {
  children: (site: StaffSite, account: Account, signOut: () => Promise<void>, returnToSignIn: (updatedEmail?: string) => void) => ReactNode;
}) {
  const [account, setAccount] = useState<Account>();
  const [site, setSite] = useState<StaffSite>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const login = useServerForm();

  useEffect(() => {
    const controller = new AbortController();
    api<Account>('/auth/me', 'GET', undefined, controller.signal)
      .then(async user => {
        const state = await api<StaffSite>('/admin/site', 'GET', undefined, controller.signal);
        setAccount(user);
        setSite(state);
      })
      .catch(cause => {
        if (!controller.signal.aborted && !(cause instanceof ApiError && cause.status === 401)) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (account && site) {
    return children(site, account, async () => {
      await api('/auth/logout', 'POST');
      setEmail('');
      setSite(undefined);
      setAccount(undefined);
    }, updatedEmail => {
      setEmail('');
      setNotice(updatedEmail
        ? 'Sign-in details updated. Sign in again to continue.'
        : 'Your session has ended. Sign in again, then return to Account Settings.');
      setSite(undefined);
      setAccount(undefined);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f0e5] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#e2d8c2] bg-[#fffcf6] shadow-xl md:grid-cols-[0.95fr_1fr]">
        <section className="relative isolate flex flex-col justify-between overflow-hidden bg-[#05291f] p-6 text-[#fff1d4] sm:p-9 lg:min-h-[560px] lg:p-12">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#05291f_35%,#05291fb3),url('/assets/extracted/hero_worship.jpg')] bg-cover bg-right" />
          <div className="flex items-center gap-3">
            <RccgLogo size={52} />
            <div className="text-sm leading-tight"><span className="block font-bold">RCCG</span>Dominion Hope of Glory</div>
          </div>
          <div className="mt-8 space-y-3 md:mt-0">
            <div className="h-px w-14 bg-[#e6ba6a]" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#fae19c]">Church administration</p>
            <p className="font-serif-heading text-3xl leading-tight sm:text-4xl">Welcome to the staff portal.</p>
            <p className="max-w-xs text-sm leading-relaxed text-[#f6ebd5]">Manage members, plan services, and stay in touch with the church.</p>
          </div>
          <a className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#fae19c] hover:underline" href="/">
            <ArrowLeft size={16} aria-hidden="true" /> Return to church website
          </a>
        </section>

        <section className="flex flex-col justify-center gap-5 p-6 sm:p-9 lg:p-12" aria-labelledby="staff-title">
          <div className="grid size-11 place-items-center rounded-xl bg-[#e7efe7] text-[#174b35]"><LockKeyhole size={20} aria-hidden="true" /></div>
          <div>
            <h1 id="staff-title" className="font-serif-heading text-4xl text-[#05291f]">Staff sign-in</h1>
            <p className="mt-2 text-sm text-stone-600">Enter your staff email and password to continue.</p>
          </div>
          {notice && <p role="status" className="rounded-lg bg-[#e7efe7] p-3 text-sm text-[#174b35]">{notice}</p>}
          <FormError error={error || login.error} />
          {loading ? <p className="text-sm" role="status">Checking staff session…</p> : (
            <form className="space-y-4" onSubmit={async event => {
              event.preventDefault();
              setError('');
              setNotice('');
              const user = await login.submit<Account>('/auth/login', { email: email.trim(), password });
              setPassword('');
              setShowPassword(false);
              if (!user) return;
              setLoading(true);
              try {
                const state = await api<StaffSite>('/admin/site');
                setAccount(user);
                setSite(state);
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setLoading(false);
              }
            }}>
              <label className="block text-sm font-semibold text-[#18382a]" htmlFor="staff-email">Staff email</label>
              <div className="relative -mt-2">
                <Mail size={17} className="pointer-events-none absolute top-3.5 left-3 text-[#53645a]" aria-hidden="true" />
                <input id="staff-email" className="w-full rounded-xl border border-[#d8d1c2] bg-white py-3 pr-3 pl-10 text-sm focus-visible:outline-2 focus-visible:outline-[#38684b]"
                  type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required />
              </div>
              <label className="block text-sm font-semibold text-[#18382a]" htmlFor="staff-password">Password</label>
              <div className="relative -mt-2">
                <LockKeyhole size={17} className="pointer-events-none absolute top-3.5 left-3 text-[#53645a]" aria-hidden="true" />
                <input id="staff-password" className="w-full rounded-xl border border-[#d8d1c2] bg-white py-3 pr-12 pl-10 text-sm focus-visible:outline-2 focus-visible:outline-[#38684b]"
                  type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" value={password} onChange={event => setPassword(event.target.value)} required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(visible => !visible)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-[#53645a] hover:bg-[#edf3ec]">
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              <button disabled={login.busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#05291f] px-5 py-3 font-semibold text-[#fae19c] hover:bg-[#174b35] disabled:opacity-50 cursor-pointer">
                {login.busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
          )}
          <p className="border-t border-[#e7dfce] pt-4 text-sm text-stone-600">Need access? <a href="/contact" className="font-semibold text-[#174b35] underline">Contact the church office</a>.</p>
        </section>
      </div>
    </main>
  );
}
