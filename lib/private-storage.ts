import {createHash} from 'node:crypto';
function config() {
 const origin=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY, bucket=process.env.SUPABASE_PRIVATE_BUCKET;
 if(!origin||!key||!bucket) throw new Error('Private storage is not configured');
 const url=new URL(origin);
 if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')) throw new Error('Invalid storage origin');
 return {origin:url.origin,key,bucket};
}
function path(key:string){return key.split('/').map(encodeURIComponent).join('/');}
export async function privateStorageReady(): Promise<boolean> {
 try {
  const c=config();
  const response=await fetch(`${c.origin}/storage/v1/bucket/${encodeURIComponent(c.bucket)}`,{headers:{Authorization:`Bearer ${c.key}`,apikey:c.key},cache:'no-store',signal:AbortSignal.timeout(10000)});
  return response.ok && (await response.json()).public === false;
 } catch { return false; }
}
export async function uploadPrivatePdf(key:string,pdf:Buffer){
 const c=config();const headers={Authorization:`Bearer ${c.key}`,apikey:c.key};
 const metadata=await fetch(`${c.origin}/storage/v1/bucket/${encodeURIComponent(c.bucket)}`,{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!metadata.ok || (await metadata.json()).public!==false) throw new Error('A verified private bucket is required');
 const response=await fetch(`${c.origin}/storage/v1/object/${encodeURIComponent(c.bucket)}/${path(key)}`,{method:'POST',headers:{...headers,'Content-Type':'application/pdf','x-upsert':'false'},body:new Uint8Array(pdf),signal:AbortSignal.timeout(30000)});
 if(response.ok)return;
 const error=await response.json().catch(()=>({}));
 if((response.status===400||response.status===409)&&['Duplicate','ResourceAlreadyExists','KeyAlreadyExists'].includes(error.error || error.code)){
  const existing=await downloadPrivatePdf(key);
  if(createHash('sha256').update(new Uint8Array(existing)).digest('hex')===createHash('sha256').update(pdf).digest('hex'))return;
 }
 throw new Error('Private PDF upload failed or conflicts with existing content');
}
export async function downloadPrivatePdf(key:string){
 const c=config();
 const response=await fetch(`${c.origin}/storage/v1/object/authenticated/${encodeURIComponent(c.bucket)}/${path(key)}`,{headers:{Authorization:`Bearer ${c.key}`,apikey:c.key},signal:AbortSignal.timeout(30000),cache:'no-store'});
 if(!response.ok)throw new Error('Private PDF unavailable');
 return response.arrayBuffer();
}
