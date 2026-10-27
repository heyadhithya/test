'use client';
import {getProviders,signIn} from 'next-auth/react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
export default function LoginPage(){
 const router=useRouter();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [pending,setPending]=useState(false);const [message,setMessage]=useState('');
 async function submit(event:React.FormEvent){event.preventDefault();setPending(true);setMessage('');try{const providers=await getProviders();const result=providers?.credentials?await signIn('credentials',{email,password,redirect:false,callbackUrl:'/app'}):null;if(result?.ok&&!result.error){router.push('/app');router.refresh();return;}setMessage('Unable to sign in. Check your details or try again later.');}catch{setMessage('Unable to sign in. Check your details or try again later.');}finally{setPassword('');setPending(false);}}
 return <main className="auth-shell"><section className="auth-card"><Link href="/" className="font-semibold tracking-tight">Sairam Certify</Link><h1 className="text-3xl font-semibold mt-8 mb-3">Sign in</h1><p className="mb-6">Personal pilot access. Use your email and password.</p><form onSubmit={submit} className="flex flex-col gap-4"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="border rounded-lg p-3"/><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="border rounded-lg p-3"/><button disabled={pending} className="btn-primary">{pending?'Signing in…':'Sign in'}</button></form>{message&&<p role="status" className="mt-5">{message}</p>}<p className="mt-5 text-sm">No email link is sent. Password recovery is not enabled for this pilot.</p></section></main>;
}
