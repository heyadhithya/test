'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Download, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { useState } from 'react';

type Certificate = {
  certificateId: string;
  name: string;
  course: string;
  issueDate: string;
  pdfUrl: string;
  status?: string;
};
type Output = {
  success?: boolean;
  count?: number;
  error?: string;
  certificates?: Certificate[];
};

const placement = {
  name: { enabled: true, x: 50, y: 42, size: 30, fontStyle: 'bold', hex: '#173448' },
  course: { enabled: true, x: 50, y: 56, size: 18, fontStyle: 'normal', hex: '#374F5E' },
  issueDate: { enabled: true, x: 50, y: 66, size: 13, fontStyle: 'normal', hex: '#526575' },
  qrCode: { enabled: false, x: 86, y: 85, scale: 0.45 },
};

export default function SairamWorkspace({ isSignedIn, canIssue }: { isSignedIn: boolean; canIssue: boolean }) {
  const [pdf, setPdf] = useState<File | null>(null);
  const [sheet, setSheet] = useState<File | null>(null);
  const [verified, setVerified] = useState(false);
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [results, setResults] = useState<Certificate[]>([]);
  const [working, setWorking] = useState<'preview' | 'generate' | 'zip' | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function choosePdf(file?: File) {
    setError(''); setMessage(''); setPreview(null); setResults([]);
    if (!file) { setPdf(null); return; }
    if (!file.name.toLowerCase().endsWith('.pdf') || file.size > 10 * 1024 * 1024) {
      setPdf(null); setError('Choose a PDF template smaller than 10 MB.'); return;
    }
    setPdf(file);
  }
  function chooseSheet(file?: File) {
    setError(''); setMessage(''); setPreview(null); setResults([]);
    if (!file) { setSheet(null); return; }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension || '') || file.size > 5 * 1024 * 1024) {
      setSheet(null); setError('Choose an Excel or CSV file smaller than 5 MB.'); return;
    }
    setSheet(file);
  }
  async function run(previewOnly: boolean) {
    if (!pdf || !sheet) { setError('Upload both a PDF template and a participant spreadsheet.'); return; }
    setError(''); setMessage('');
    setWorking(previewOnly ? 'preview' : 'generate');
    try {
      const form = new FormData();
      form.set('template', pdf);
      form.set('dataset', sheet);
      form.set('previewOnly', String(previewOnly));
      form.set('saveToDb', String(!previewOnly && verified && canIssue));
      form.set('sendEmails', 'false');
      form.set('settings', JSON.stringify({
        ...placement, qrCode: { ...placement.qrCode, enabled: !previewOnly && verified && canIssue }
      }));
      const response = await fetch('/api/generate', { method: 'POST', body: form, cache: 'no-store' });
      let data: Output;
      try { data = await response.json() as Output; } catch { throw new Error('The server did not return a valid response.'); }
      if (!response.ok || !data.success || !data.certificates) throw new Error(data.error || 'Certificate generation failed.');
      if (previewOnly) {
        setPreview(data.certificates[0] || null);
        setMessage('Preview ready. Check the text placement before generating the batch.');
      } else {
        setResults(data.certificates);
        setMessage(String(data.count ?? data.certificates.length) + ' certificate PDFs generated. Download them below.');
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The request failed. Try again.');
    } finally { setWorking(null); }
  }
  function filename(cert: Certificate, index: number) {
    const clean = (cert.name || 'certificate').replace(/[^a-z0-9-]/gi, '_').slice(0, 60);
    return clean + '-' + String(index + 1) + '.pdf';
  }
  async function downloadZip() {
    if (!results.length) return;
    setWorking('zip'); setError('');
    try {
      const zip = new JSZip();
      for (let i = 0; i < results.length; i++) {
        const cert = results[i];
        if (!cert.pdfUrl.startsWith('data:application/pdf;base64,') && !cert.pdfUrl.startsWith('/api/private-pdf/')) {
          throw new Error('The server returned an unexpected PDF address.');
        }
        const response = await fetch(cert.pdfUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error('A PDF download failed. Try the individual link.');
        zip.file(filename(cert, i), await response.arrayBuffer());
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'sairam-certificates.zip'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'ZIP creation failed.');
    } finally { setWorking(null); }
  }

  return <div className="sa-workspace">
    <header className="sa-header">
      <Link className="sa-identity" href="/"><Image src="/sairam-mark.svg" alt="" width={38} height={38}/><span><strong>Sairam Certify</strong><small>INNOVATION ECOSYSTEM</small></span></Link>
      <nav className="sa-header-links"><Link href="/"><ArrowLeft size={14}/> Home</Link><Link href="/docs">Guide</Link><Link href={isSignedIn ? '/dashboard' : '/login'}>{isSignedIn ? 'Dashboard' : 'Sign in'}</Link></nav>
    </header>
    <main className="sa-workspace-main">
      <div className="sa-workspace-top"><div className="sa-eyebrow">CERTIFICATE WORKSPACE</div><h1>Prepare a certificate batch.</h1><p className="sa-muted">Use your PDF template and spreadsheet. Preview one certificate, then generate the PDFs.</p></div>
      <div className="sa-workspace-grid">
        <section className="sa-panel" aria-labelledby="setup-heading">
          <h2 className="sa-panel-title" id="setup-heading">Your files</h2>
          <div className="sa-inline-steps"><span className="sa-step-num">01</span>Upload the certificate template</div>
          <label className="sa-field" htmlFor="sa-pdf">Template PDF</label>
          <div className="sa-file"><FileText size={21} color="#b88743"/><input id="sa-pdf" type="file" accept=".pdf,application/pdf" onChange={e => choosePdf(e.target.files?.[0])}/><small>{pdf ? pdf.name : 'PDF, up to 10 MB'}</small></div>
          <div className="sa-inline-steps" style={{ marginTop: 26 }}><span className="sa-step-num">02</span>Upload participant information</div>
          <label className="sa-field" htmlFor="sa-sheet">Spreadsheet</label>
          <div className="sa-file"><FileSpreadsheet size={21} color="#b88743"/><input id="sa-sheet" type="file" accept=".xlsx,.xls,.csv" onChange={e => chooseSheet(e.target.files?.[0])}/><small>{sheet ? sheet.name : 'XLSX, XLS or CSV with Name, Course and IssueDate columns'}</small></div>
          <div className="sa-link-row"><a href="/demo/template.pdf" download>Sample PDF template</a><a href="/demo/participants.xlsx" download>Sample Excel sheet</a></div>
          <div className="sa-divider"/>
          <div className="sa-inline-steps"><span className="sa-step-num">03</span>Preview, then generate</div>
          <p className="sa-muted">Text is placed at standard positions. For precise placement or custom fonts, use the advanced editor.</p>
          {canIssue ? <label className="sa-check"><input type="checkbox" checked={verified} onChange={e => {setVerified(e.target.checked);setPreview(null);setResults([]);}}/><span><strong>Issue registry-backed QR certificates</strong><br/>Use private storage and active public verification records. Turn off for guest PDF downloads.</span></label> :
            <p className="sa-muted" style={{ marginTop: 12 }}><ShieldCheck size={16} style={{ display: 'inline', marginRight: 6 }}/> Guest PDFs do not contain verification QR codes. {isSignedIn ? 'Issuer permission is required for verified certificates.' : 'Sign in as an approved issuer to use verified QR certificates.'}</p>}
          <button type="button" className="sa-button sa-button-quiet" style={{ width:'100%', marginTop: 17 }} disabled={!pdf || !sheet || !!working} onClick={() => run(true)}>{working === 'preview' ? 'Preparing preview…' : 'Preview one certificate'} <ArrowRight size={15}/></button>
          <button type="button" className="sa-button sa-button-primary" style={{ width:'100%', marginTop: 12 }} disabled={!pdf || !sheet || !!working} onClick={() => run(false)}>{working === 'generate' ? 'Generating…' : verified && canIssue ? 'Issue verified certificates' : 'Generate PDFs'} <ArrowRight size={16}/></button>
          <div className="sa-link-row"><Link href="/app/advanced">Advanced positioning and email settings</Link></div>
          {error && <p className="sa-feedback sa-error" role="alert">{error}</p>}
          {message && <p className="sa-feedback" role="status">{message}</p>}
        </section>
        <section className="sa-panel sa-preview-panel" aria-labelledby="preview-heading">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}><h2 className="sa-panel-title" id="preview-heading">Live preview</h2><span className="sa-muted" style={{fontSize:11}}>PDF OUTPUT</span></div>
          {preview?.pdfUrl ? <><iframe title="Certificate sample preview" className="sa-pdf-frame" src={preview.pdfUrl}/><div className="sa-link-row"><a href={preview.pdfUrl} download="sairam-preview.pdf">Download preview PDF</a></div></>:
            <div className="sa-preview-placeholder"><FileText size={37} color="#a6b6bc"/><strong>Preview your first certificate</strong><span>Upload a template and spreadsheet, then click Preview one certificate.</span></div>}
        </section>
      </div>
      {results.length > 0 && <section className="sa-panel sa-results" aria-labelledby="results-heading">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,flexWrap:'wrap'}}><div><h2 className="sa-panel-title" id="results-heading">Generated certificates</h2><p className="sa-muted">{results.length} documents · {verified && canIssue ? 'Registry-backed issuance' : 'Guest PDFs, not verifiable credentials'}</p></div><button type="button" className="sa-button sa-button-primary" onClick={downloadZip} disabled={!!working}>{working === 'zip' ? 'Creating ZIP…' : 'Download all as ZIP'} <Download size={16}/></button></div>
        <div>{results.map((cert,index)=><div className="sa-result" key={cert.certificateId}><div><strong>{cert.name}</strong><span>{cert.course} · {cert.issueDate}</span></div><div style={{display:'flex',gap:17,alignItems:'center',flexWrap:'wrap'}}><span className="sa-tag">{verified && canIssue ? 'Issued' : 'Guest'}</span>{verified && canIssue && <Link href={'/verify/'+encodeURIComponent(cert.certificateId)}>Verify QR</Link>}<a href={cert.pdfUrl} download={filename(cert,index)}>Download PDF</a></div></div>)}</div>
      </section>}
    </main>
  </div>;
}
