import prisma from './prisma';
export async function lookupCredential(id:string) {
 if(process.env.VERIFIED_ISSUANCE_ENABLED!=='true') return {state:'unavailable' as const};
 if(!/^CERT-[A-F0-9]{32}$/.test(id)) return {state:'missing' as const};
 const certificate=await prisma.certificate.findUnique({where:{certificateId:id},select:{certificateId:true,name:true,course:true,issueDate:true,revoked:true,status:true,pdfUrl:true}});
 if(!certificate || certificate.status!=='issued' || !certificate.pdfUrl) return {state:'missing' as const};
 if(certificate.revoked) return {state:'revoked' as const};
 return {state:'verified' as const,credential:{certificateId:certificate.certificateId,name:certificate.name,course:certificate.course,issueDate:certificate.issueDate}};
}
