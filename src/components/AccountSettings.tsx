import { LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../data/api';
import { FormError, useServerForm } from './ServerForm';

const inputClass = 'mt-1 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-[#38684b]';

export function AccountSettings({ email, saving, returnToSignIn }: {
  email: string;
  saving: boolean;
  returnToSignIn: (updatedEmail?: string) => void;
}) {
  const form = useServerForm();
  const [validation, setValidation] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const newPassword = String(fields.get('newPassword'));
    if (newPassword !== fields.get('confirmPassword')) {
      setValidation('The new passwords must match.');
      return;
    }
    setValidation('');
    const updated = await form.submit<{ email: string }>('/auth/credentials', {
      email: String(fields.get('email')).trim(),
      currentPassword: fields.get('currentPassword'),
      newPassword: newPassword || undefined,
    }, cause => {
      if (cause instanceof ApiError && cause.status === 401) returnToSignIn();
    });
    if (updated) returnToSignIn(updated.email);
  }

  return (
    <section className="max-w-xl rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="account-sign-in">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-[#e7efe7] text-[#174b35]">
          <LockKeyhole size={19} aria-hidden="true" />
        </div>
        <h2 id="account-sign-in" className="font-serif-heading text-2xl text-[#08281d]">Sign-in details</h2>
      </div>
      <p className="mt-3 text-sm text-stone-600">Change the email or password for your account. Saving signs you out on all devices.</p>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <FormError error={validation || form.error} />
        <fieldset disabled={form.busy} className="space-y-4">
          <label className="block text-sm font-medium">
            Sign-in email
            <input className={inputClass} name="email" type="email" autoComplete="username" defaultValue={email} required />
          </label>
          <label className="block text-sm font-medium">
            Current password
            <input className={inputClass} name="currentPassword" type="password" autoComplete="current-password" maxLength={512} required />
          </label>
          <div>
            <label className="block text-sm font-medium" htmlFor="account-new-password">New password</label>
            <input id="account-new-password" className={inputClass} name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={512} aria-describedby="new-password-help" />
            <span id="new-password-help" className="mt-1.5 block text-xs text-stone-600">Use at least 12 characters, or leave blank to keep your password.</span>
          </div>
          <label className="block text-sm font-medium">
            Confirm new password
            <input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" maxLength={512} />
          </label>
          <button type="submit" disabled={saving || form.busy} className="rounded-xl bg-[#08281d] px-5 py-2.5 text-sm font-semibold text-[#fae19c] hover:bg-[#174b35] disabled:opacity-50">
            {form.busy ? 'Saving…' : 'Save sign-in details'}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
