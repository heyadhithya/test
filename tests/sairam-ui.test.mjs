import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const read = p => fs.readFileSync(p, 'utf8');

test('clean home routes to simple certificate workspace', () => {
  const src=read('app/page.tsx');
  assert.match(src,/href="\/app\/simple"/);
  assert.match(src,/Certificates,/);
  assert.doesNotMatch(src, /Testimonials|500\+ certificates took literally 2 seconds/);
});
test('simple editor exposes guest PDFs and explicit server-gated issuance', () => {
  const page=read('app/app/simple/page.tsx');
  const editor=read('app/app/simple/SairamWorkspace.tsx');
  assert.match(page,/isApprovedIssuer\(session\.user\.id/);
  assert.match(page,/VERIFIED_ISSUANCE_ENABLED/);
  assert.match(editor,/\/api\/generate/);
  assert.match(editor,/previewOnly/);
  assert.match(editor,/new JSZip\(\)/);
  assert.match(editor,/String\(!previewOnly && verified && canIssue\)/);
});
test('new TSX pages transpile',()=>{
  for(const file of ['app/page.tsx','app/app/simple/page.tsx','app/app/simple/SairamWorkspace.tsx']){
    const compiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
    assert.equal(compiled.diagnostics?.length||0,0,file);
  }
});
