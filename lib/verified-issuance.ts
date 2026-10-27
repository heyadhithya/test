import prisma from './prisma';
import {issueCertificate, issuanceId, requestDigest, type IssuanceRecord} from './issuance';
import {uploadPrivatePdf} from './private-storage';
import {generateCertificate} from './generateCertificate';
export async function issueBatch(userId:string, template:ArrayBuffer, dataset:ArrayBuffer, settings:unknown, rows:Record<string,unknown>[]) {
 const origin=new URL(process.env.NEXTAUTH_URL || '');
 if(origin.protocol!=='https:' && origin.hostname!=='localhost') throw new Error('Trusted verification origin is required');
 const secret=process.env.ISSUANCE_ID_SECRET || '';
 const digest=requestDigest(new Uint8Array(template),new Uint8Array(dataset),{settings,origin:origin.origin,rendererVersion:1});
 const certificates=[];
 for (const [index,row] of rows.entries()) {
  const normalized=Object.fromEntries(Object.entries(row).map(([k,v])=>[k.toLowerCase().replace(/[^a-z0-9]/g,''),v]));
  const record:IssuanceRecord={certificateId:issuanceId(userId,digest,index,secret),userId,name:String(normalized.name||''),course:String(normalized.course||''),issueDate:String(normalized.issuedate||''),revoked:false,pdfUrl:'',status:'pending'};
  const result=await issueCertificate(record,{
   reserve:async data=>{
    await prisma.certificate.createMany({data:[{...data,templateUrl:'',batchId:digest}],skipDuplicates:true});
    const found=await prisma.certificate.findUniqueOrThrow({where:{certificateId:data.certificateId}});
    return {...found,userId:found.userId!};
   },
   complete:async(id,key)=>{
    await prisma.certificate.updateMany({where:{certificateId:id,userId,revoked:false,status:'pending'},data:{pdfUrl:key,status:'issued',failureReason:null}});
    const completed=await prisma.certificate.findUniqueOrThrow({where:{certificateId:id}});
    if (completed.revoked || completed.status !== 'issued') throw new Error('Issuance no longer eligible');
    return {...completed,userId:completed.userId!};
   }
  },id=>generateCertificate(template,{...record,certificateId:id},settings,origin.origin),uploadPrivatePdf);
  certificates.push({certificateId:result.certificateId,name:result.name,course:result.course,issueDate:result.issueDate,status:result.status,pdfUrl:`/api/private-pdf/${result.certificateId}`,recipientEmail:null,failureReason:null,sentAt:null});
 }
 return {success:true,count:certificates.length,batchId:digest,certificates};
}
