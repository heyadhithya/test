import Link from 'next/link';
import {lookupCredential} from '@/lib/registry';
export const dynamic='force-dynamic';
export default async function Verify({params}:{params:Promise<{id:string}>}) {
 const result=await lookupCredential((await params).id);
 const labels: Record<string,string> = {certificateId:'Certificate ID',name:'Recipient',course:'Programme',issueDate:'Issue date'};
 return <main className="verification-shell"><Link className="font-semibold tracking-tight" href="/">Sairam Certify</Link><section className="verification-card"><span className="verification-state">Certificate registry</span><h1>{result.state==='verified'?'Verified credential':result.state==='revoked'?'Credential revoked':result.state==='missing'?'Credential not found':'Verification unavailable'}</h1>{result.state==='verified'?<><p>This certificate has an active record in the issuing registry.</p><dl>{Object.entries(result.credential).map(([key,value])=><div key={key}><dt>{labels[key] || key}</dt><dd>{value}</dd></div>)}</dl></>:<p>Guest PDFs are not verified credentials. Only successfully issued, active records can be verified.</p>}</section><Link className="inline-block mt-6 text-sm underline underline-offset-4" href="/">Back to Sairam Certify</Link></main>;
}
