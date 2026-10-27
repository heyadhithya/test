import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('lib/dashboard-data.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const mod={exports:{}};new Function('require','module','exports',code)(()=>({}),mod,mod.exports);
const {ownerDashboard}=mod.exports;
test('dashboard scopes every aggregate and recent-record read to the session owner, bounds results and UTC year',async()=>{
 const rows=[{userId:'owner',status:'issued',revoked:false,pdfUrl:'private',createdAt:new Date('2026-10-27')},{userId:'other',status:'issued',revoked:false,pdfUrl:'private',createdAt:new Date('2026-10-27')},{userId:'owner',status:'pending',revoked:false,pdfUrl:'',createdAt:new Date('2026-10-27')},{userId:'owner',status:'issued',revoked:false,pdfUrl:'private',createdAt:new Date('2025-10-27')},{userId:'owner',status:'failed',revoked:false,pdfUrl:'',createdAt:new Date('2026-10-27')}];
 const reads=[];
 const filter=where=>{assert.equal(where.userId,'owner');return rows.filter(r=>r.userId===where.userId&&(!where.status||r.status===where.status)&&(where.revoked===undefined||r.revoked===where.revoked)&&(!where.pdfUrl||r.pdfUrl!==where.pdfUrl.not)&&(!where.createdAt||(r.createdAt>=where.createdAt.gte&&r.createdAt<where.createdAt.lt)));};
 const db={certificate:{count:async({where})=>{reads.push(where);return filter(where).length;},findMany:async({where,take,orderBy})=>{assert.equal(take,30);assert.deepEqual(orderBy,{createdAt:'desc'});reads.push(where);return filter(where).slice(0,take);}}};
 const result=await ownerDashboard('owner',new Date('2026-10-27'),db);
 assert.equal(reads.length,7);assert.equal(result.total,4);assert.equal(result.issued,2);assert.equal(result.thisMonth,1);assert.equal(result.pending,1);assert.equal(result.failed,1);assert(result.certificates.every(r=>r.userId==='owner'));
 await assert.rejects(()=>ownerDashboard('',new Date(),db),/Authentication required/);assert.equal(reads.length,7);
});
