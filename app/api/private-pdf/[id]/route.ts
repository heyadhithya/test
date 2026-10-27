import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import prisma from '@/lib/prisma';
import {downloadPrivatePdf} from '@/lib/private-storage';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}) {
 if(process.env.VERIFIED_ISSUANCE_ENABLED!=='true') return new Response('Unavailable',{status:503});
 const session=await getServerSession(authOptions);
 if(!session?.user?.id) return new Response('Unauthorized',{status:401});
 const {id}=await params;
 const record=await prisma.certificate.findFirst({where:{certificateId:id,userId:session.user.id,status:'issued',revoked:false}});
 if(!record) return new Response('Not found',{status:404});
 const bytes=await downloadPrivatePdf(record.pdfUrl);
 return new Response(bytes,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${record.certificateId}.pdf"`,'Cache-Control':'private, no-store'}});
}
