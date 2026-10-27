// Disposable local PostgreSQL only. Never accepts an external database URL.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {PrismaAdapter} from '@auth/prisma-adapter';
const require=createRequire(import.meta.url);
const {PrismaClient}=require('@prisma/client');
const url='postgresql://postgres:local-disposable-test-only@127.0.0.1:55432/sairam_auth_guards?connection_limit=4';
const db=new PrismaClient({datasources:{db:{url}}});
const other=new PrismaClient({datasources:{db:{url}}});
function load(file,overrides={}){const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const loaded={exports:{}};new Function('require','module','exports',code)(id=>id in overrides?overrides[id]:require(id),loaded,loaded.exports);return loaded.exports;}
const email=load('lib/email-auth.ts');
const {admitEmail}=load('lib/auth-admission.ts',{'./prisma':{__esModule:true,default:db},'./email-auth':email});
Object.assign(process.env,{AUTH_GUARDS_READY:'true',AUTH_EMAIL_ALLOWLIST:'one@example.com,two@example.com',NEXTAUTH_SECRET:'local-fixture-not-a-deployed-secret'});
const global='system:auth:admission:global';
const reset=()=>db.verificationToken.deleteMany();
async function seed(count,identifier,expires){await db.verificationToken.createMany({data:Array.from({length:count},(_,i)=>({identifier,token:`${identifier}-${i}`,expires}))});}
try{
 const version=await db.$queryRaw`SELECT version()`;console.log(version[0].version);
 const index=await db.$queryRaw`SELECT indexdef FROM pg_indexes WHERE schemaname='public' AND indexname='VerificationToken_expires_token_idx'`;assert.equal(index.length,1);console.log(index[0].indexdef);
 await reset();
 const concurrent=await Promise.all(Array.from({length:12},(_,i)=>admitEmail('one@example.com',i%2?db:other)));
 assert.equal(concurrent.filter(Boolean).length,1);assert.equal(await db.verificationToken.count(),2);console.log('PASS two-client racing admission: exactly one success and two markers');
 await reset();await seed(9,global,new Date(Date.now()+3600000));
 const globalRace=await Promise.all([admitEmail('one@example.com',db),admitEmail('two@example.com',other)]);
 assert.equal(globalRace.filter(Boolean).length,1);assert.equal(await db.verificationToken.count({where:{identifier:global}}),10);console.log('PASS shared minute budget across recipients');
 await reset();await seed(60,global,new Date(Date.now()+1800000));assert.equal(await admitEmail('one@example.com',db),false);console.log('PASS hourly global budget');
 await reset();assert.equal(await admitEmail('one@example.com',db),true);
 const marker=await db.verificationToken.findFirst({where:{identifier:{not:global}}});assert(marker);assert(!marker.identifier.includes('@'));
 await db.verificationToken.updateMany({data:{expires:new Date(Date.now()+1800000)}});
 assert.equal(await admitEmail('one@example.com',db),true);await db.verificationToken.updateMany({data:{expires:new Date(Date.now()+1800000)}});
 assert.equal(await admitEmail('one@example.com',db),true);await db.verificationToken.updateMany({data:{expires:new Date(Date.now()+1800000)}});
 assert.equal(await admitEmail('one@example.com',db),false);
 await db.verificationToken.updateMany({data:{expires:new Date(0)}});assert.equal(await admitEmail('one@example.com',db),true);console.log('PASS recipient quota, cooldown aging and expired-budget recovery');
 await reset();await seed(250,'expired@example.com',new Date(0));await seed(1,'live@example.com',new Date(Date.now()+900000));
 assert.equal(await admitEmail('one@example.com',db),true);assert.equal(await db.verificationToken.count({where:{expires:{lt:new Date()}}}),150);assert.equal(await db.verificationToken.count({where:{identifier:'live@example.com'}}),1);console.log('PASS cleanup exactly100; unexpired token preserved');
 await reset();await seed(1,'rollback@example.com',new Date(0));
 const failing={$transaction:async(callback,options)=>db.$transaction(async tx=>{await callback(tx);throw Error('synthetic rollback');},options)};
 assert.equal(await admitEmail('one@example.com',failing),false);assert.equal(await db.verificationToken.count(),1);console.log('PASS rollback restores cleanup and removes budget markers');
 await reset();await seed(1,'locked@example.com',new Date(0));await seed(1,'free@example.com',new Date(0));
 let release;let ready;const started=new Promise(resolve=>{ready=resolve;});const held=new Promise(resolve=>{release=resolve;});
 const holding=other.$transaction(async tx=>{await tx.$queryRaw`SELECT token FROM "VerificationToken" WHERE identifier='locked@example.com' FOR UPDATE`;ready();await held;});
 await started;try{assert.equal(await admitEmail('one@example.com',db),true);assert.equal(await db.verificationToken.count({where:{identifier:'locked@example.com'}}),1);assert.equal(await db.verificationToken.count({where:{identifier:'free@example.com'}}),0);}finally{release();await holding;}console.log('PASS cleanup skips concurrently locked token');
 await reset();let unlock;let acquired;const lockReady=new Promise(resolve=>{acquired=resolve;});const lockHeld=new Promise(resolve=>{unlock=resolve;});
 const lock=other.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(1935763821,1701998433)::text`;acquired();await lockHeld;});
 await lockReady;try{assert.equal(await admitEmail('one@example.com',db),false);assert.equal(await db.verificationToken.count(),0);}finally{unlock();await lock;}console.log('PASS transaction lock contention denies without writes');
 await seed(1,'replay@example.com',new Date(Date.now()+900000));const adapter=PrismaAdapter(db);
 const replay=await Promise.all(Array.from({length:10},()=>adapter.useVerificationToken({identifier:'replay@example.com',token:'replay@example.com-0'})));assert.equal(replay.filter(Boolean).length,1);console.log('PASS real PostgreSQL atomic token consumption under10 racing consumers');
 await reset();await seed(250,'plan-expired@example.com',new Date(0));await seed(750,'plan-future@example.com',new Date(Date.now()+900000));await db.$executeRaw`ANALYZE "VerificationToken"`;
 const plan=await db.$queryRaw`EXPLAIN SELECT token FROM "VerificationToken" WHERE expires < CURRENT_TIMESTAMP ORDER BY expires, token LIMIT 100 FOR UPDATE SKIP LOCKED`;
 const planText=plan.map(row=>row['QUERY PLAN']).join('\n');assert.match(planText,/VerificationToken_expires_token_idx/);console.log(planText);console.log('PASS natural cleanup query plan uses proposed index');
 console.log('PASS all disposable PostgreSQL guard checks; no email or hosted data used');
}finally{await db.$disconnect();await other.$disconnect();}
