'use client';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    try {
      const result = await signIn('pilot', { email, password, redirect: false, callbackUrl: '/app' });
      if (result?.ok && !result.error) { router.replace('/app'); router.refresh(); return; }
      setError('Sign-in failed. Check your approved email and pilot passphrase.');
    } catch { setError('Sign-in is unavailable. Try again after the administrator checks the server configuration.'); }
    finally { setPending(false); }
  }
  return <div className="sa-workspace">
    <header className="sa-header"><Link href="/" className="sa-identity"><Image src="/sairam-mark.svg" alt="" width={38} height={38}/><span><strong>Sairam Certify</strong><small>INNOVATION ECOSYSTEM</small></span></Link><nav className="sa-header-links"><Link href="/">Home</Link><Link href="/app">Guest workspace</Link></nav></header>
    <main className="sa-login-frame">
      <div className="sa-eyebrow">OWNER PILOT ACCESS</div>
      <h1 style={{fontSize:33,letterSpacing:'-.04em',margin:'17px 0 9px'}}>Sign in to issue.</h1>
      <p className="sa-muted">The pilot is restricted to an approved email and a private passphrase. Guests can generate unverified PDFs without signing in.</p>
      <form onSubmit={submit}>
        <label className="sa-field" htmlFor="email">Approved email</label>
        <input className="sa-input" id="email" type="email" required maxLength={254} autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/>
        <label className="sa-field" htmlFor="password">Pilot passphrase</label>
        <input className="sa-input" id="password" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="sa-button sa-button-primary" style={{width:'100%',marginTop:23}} type="submit" disabled={pending}>{pending?'Checking access…':'Sign in to workspace'}</button>
        {error && <p className="sa-feedback sa-error" role="alert">{error}</p>}
      </form>
      <p className="sa-muted" style={{fontSize:12,marginTop:20}}>This owner-only login is temporary. Institutional email sign-in can replace it after the sender domain is verified.</p>
    </main>
  </div>;
}
