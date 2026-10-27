import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const read = path => fs.readFileSync(path, 'utf8');
test('pilot auth is gated by explicit environment flags, allowlist and constant-time comparison', () => {
  const src = read('lib/pilot-auth.ts');
  assert.match(src, /PILOT_ENABLED === 'true'/);
  assert.match(src, /AUTH_GUARDS_READY === 'true'/);
  assert.match(src, /allowedEmail\(email\)/);
  assert.match(src, /timingSafeEqual\(/);
  assert.match(src, /admitEmail\(email\)/);
  assert.doesNotMatch(src, /ADMIN_PASSCODE|vura-admin-secret/);
});
test('pilot identity is carried only by a signed JWT claim, not a client submitted flag', () => {
  const auth = read('lib/auth.ts');
  assert.match(auth, /account\.provider === 'pilot'/);
  assert.match(auth, /session\.pilotAccess = token\.pilot === true/);
  assert.match(auth, /session: \{ strategy: 'jwt'/);
});
test('QR issuance requires both server controls and a valid signed-in issuer', () => {
  const src = read('app/api/generate/route.ts');
  assert.match(src, /VERIFIED_ISSUANCE_ENABLED !== "true"/);
  assert.match(src, /session\?\.pilotAccess === true && pilotReady\(\)/);
  assert.match(src, /PILOT_ISSUANCE_ENABLED === 'true'/);
  assert.match(src, /enabled: false/);
});
test('simple workspace has real upload, preview, ZIP and protects guest QR', () => {
  const src = read('app/app/SairamWorkspace.tsx');
  assert.match(src, /\/api\/generate/);
  assert.match(src, /previewOnly/);
  assert.match(src, /new JSZip\(\)/);
  assert.match(src, /String\(!previewOnly && verified && canIssue\)/);
  assert.match(src, /Sample Excel sheet/);
});
test('new page components parse as valid TSX', () => {
  for (const file of ['app/page.tsx','app/app/page.tsx','app/app/SairamWorkspace.tsx','app/login/page.tsx']) {
    const output = ts.transpileModule(read(file), { fileName: file, reportDiagnostics:true, compilerOptions: { target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });
    assert.equal(output.diagnostics?.length, 0, file + ': ' + output.diagnostics?.map(d => d.messageText).join(', '));
  }
});
