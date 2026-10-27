import Link from 'next/link';
import {lookupCredential} from '@/lib/registry';
export const dynamic='force-dynamic';
export default async function Verify({params}:{params:Promise<{id:string}>}) {
 const result=await lookupCredential((await params).id);
 return <main className="max-w-xl mx-auto p-8 py-20"><Link href="/">Sairam Certify</Link><h1 className="text-3xl my-8">{result.state==='verified'?'Verified credential':result.state==='revoked'?'Credential revoked':result.state==='missing'?'Credential not found':'Verification unavailable'}</h1>{result.state==='verified'?<dl>{Object.entries(result.credential).map(([key,value])=><div className="mb-5" key={key}><dt>{key}</dt><dd className="font-semibold break-all">{value}</dd></div>)}</dl>:<p>Guest PDFs are not verified credentials. Only successfully issued, active records can be verified.</p>}</main>;
}
