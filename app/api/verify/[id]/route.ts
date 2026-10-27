import {NextResponse} from 'next/server';
import {lookupCredential} from '@/lib/registry';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}) {
 const result=await lookupCredential((await params).id);
 return NextResponse.json({verified:result.state==='verified',...result},{status:result.state==='verified'?200:result.state==='unavailable'?503:result.state==='revoked'?403:404,headers:{'Cache-Control':'no-store'}});
}
