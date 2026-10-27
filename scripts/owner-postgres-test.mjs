// Fixed disposable local database; never accepts hosted credentials or a user password.
import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';import {createRequire} from 'node:module';import {randomBytes,createHash} from 'node:crypto';
const require=createRequire(import.meta.url);const {PrismaClient}=require('@prisma/client');
const url='postgresql://postgres:local-disposable-test-only@127.0.0.1:55432/sairam_auth_guards?connection_limit=4';const db=new PrismaClient({datasources:{db:{url}}});
function load(file,overrides={}){const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const loaded={exports:{}};new Function('require','module','exports',code)(id=>id in overrides?overrides[id]:require(id),loaded,loaded.exports);return loaded.exports;}
const config=load('lib/database-config.ts'),email=load('lib/email-auth.ts',{'./database-config':config});
const auth=load('lib/owner-auth.ts',{'./database-config':config,'./email-auth':email,'./auth-admission':{admitEmail:async()=>true},'./prisma':{__esModule:true,default:db}});
const code=randomBytes(48).toString('base64url'),password=randomBytes(24).toString('base64url');
Object.assign(process.env,{AUTH_MODE:'password',AUTH_ENABLED:'true',AUTH_GUARDS_READY:'true',AUTH_EMAIL_ALLOWLIST:'local-owner@example.com',NEXTAUTH_URL:'https://certify.example',NEXTAUTH_SECRET:randomBytes(48).toString('hex'),DATABASE_URL:url,OWNER_SETUP_ENABLED:'true',OWNER_SETUP_EXPIRES_AT:new Date(Date.now()+900000).toISOString(),OWNER_SETUP_TOKEN_SHA256:createHash('sha256').update(`local-owner@example.com\0${code}`).digest('hex')});
try{
 await db.verificationToken.deleteMany();await db.user.deleteMany();
 const failingDb={user:db.user,$transaction:(callback,options)=>db.$transaction(tx=>callback(new Proxy(tx,{get(target,key){if(key==='user')return {...target.user,create:async()=>{throw Error('synthetic failure');}};return Reflect.get(target,key);}})),options)};
 const failing=load('lib/owner-auth.ts',{'./database-config':config,'./email-auth':email,'./auth-admission':{admitEmail:async()=>true},'./prisma':{__esModule:true,default:failingDb}});
 assert.equal(await failing.provisionOwner(code,password),false);assert.equal(await db.verificationToken.count(),0);assert.equal(await db.user.count(),0);console.log('PASS account-write failure rolls back invitation consumption');
 const results=await Promise.all([auth.provisionOwner(code,password),auth.provisionOwner(code,password)]);assert.equal(results.filter(Boolean).length,1);assert.equal(await db.user.count(),1);assert.equal(await db.verificationToken.count(),1);console.log('PASS racing provision: exactly one account and one consumed invitation');
 const user=await db.user.findUnique({where:{email:'local-owner@example.com'}});assert.equal(user.emailVerified,null);assert.notEqual(user.password,password);assert(await require('bcryptjs').compare(password,user.password));console.log('PASS bcrypt hash and no false email verification');
 assert.equal(await auth.provisionOwner(code,password+'new'),false);assert.equal((await db.user.findUnique({where:{id:user.id}})).password,user.password);console.log('PASS existing account not reset');
 assert.equal((await auth.authorizeOwner({email:'local-owner@example.com',password})).id,user.id);assert.equal(await auth.authorizeOwner({email:'local-owner@example.com',password:'Incorrect synthetic password'}),null);console.log('PASS real password validation yields immutable session identity only');
 await db.user.delete({where:{id:user.id}});assert.equal(await auth.provisionOwner(code,password),false);assert.equal(await db.user.count(),0);console.log('PASS consumed invite cannot recreate account after local deletion');
 console.log('PASS disposable PostgreSQL owner setup tests; no actual user password, hosted writes, mail or issuer grant');
}finally{await db.$disconnect();}
