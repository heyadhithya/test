import {NextRequest,NextResponse} from 'next/server';
// Legacy APIs are deliberately unavailable until their own security review.
export function proxy(request:NextRequest){
 const p=request.nextUrl.pathname;
 const allowed=p==='/api/generate'||p.startsWith('/api/verify/')||p.startsWith('/api/private-pdf/')||/^\/api\/auth\/(session|providers|csrf|signin|signout|callback|verify-request|error)(\/|$)/.test(p);
 if(!allowed)return NextResponse.json({error:'This service is not enabled for the isolated project.'},{status:503});
 return NextResponse.next();
}
export const config={matcher:'/api/:path*'};
