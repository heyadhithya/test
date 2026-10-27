import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="sa-page">
      <header className="sa-header">
        <Link className="sa-identity" href="/" aria-label="Sairam Certify home">
          <Image src="/sairam-mark.svg" alt="" width={38} height={38} priority />
          <span><strong>Sairam Certify</strong><small>INNOVATION ECOSYSTEM</small></span>
        </Link>
        <nav className="sa-header-links" aria-label="Main navigation">
          <Link href="#process">How it works</Link>
          <Link href="/docs">Guide</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/app/simple" className="sa-nav-cta">Open workspace <ArrowRight size={15} /></Link>
        </nav>
      </header>
      <main>
        <section className="sa-hero sa-container">
          <div className="sa-hero-copy">
            <div className="sa-eyebrow"><span className="sa-dot"/> SAIRAM INNOVATION ECOSYSTEM</div>
            <h1>Certificates, <em>made simple.</em></h1>
            <p>Turn a certificate template and participant spreadsheet into a complete batch of PDFs. Preview the result before you generate.</p>
            <div className="sa-hero-actions">
              <Link className="sa-button sa-button-primary" href="/app/simple">Create certificates <ArrowRight size={18} /></Link>
              <Link className="sa-button sa-button-quiet" href="/docs">View the guide</Link>
            </div>
            <div className="sa-hero-foot"><CheckCircle2 size={17} /> Start with a PDF and an Excel or CSV file. No account needed for guest downloads.</div>
          </div>
          <div className="sa-preview-wrap" aria-label="Illustrative example certificate">
            <div className="sa-preview-caption"><span>DOCUMENT PREVIEW</span><span>01 / 01</span></div>
            <div className="sa-sample-cert">
              <div className="sa-cert-inner">
                <div className="sa-cert-top"><Image src="/sairam-mark.svg" alt="" width={34} height={34}/><span>SAIRAM<br/>INNOVATION ECOSYSTEM</span></div>
                <div className="sa-cert-rule" />
                <p className="sa-cert-kicker">CERTIFICATE OF PARTICIPATION</p>
                <h2>Certificate<br/>of Achievement</h2>
                <p className="sa-cert-label">Presented to</p>
                <p className="sa-cert-name">Alex Morgan</p>
                <p className="sa-cert-copy">For participation in the<br/><strong>Innovation & Technology Workshop</strong></p>
                <div className="sa-cert-bottom"><span>27 OCTOBER 2026<br/><small>DATE OF ISSUE</small></span><span className="sa-cert-seal">S</span><span>SAIRAM ECOSYSTEM<br/><small>PROGRAMME TEAM</small></span></div>
              </div>
            </div>
            <p className="sa-preview-disclaimer">Illustrative layout. Your uploaded PDF controls the final design.</p>
          </div>
        </section>
        <section className="sa-value-strip sa-container" aria-label="Features">
          <div><FileSpreadsheet size={22}/><span>Excel &amp; CSV import</span></div>
          <div><FileText size={22}/><span>Individual PDF or ZIP</span></div>
          <div><ShieldCheck size={22}/><span>Registry-backed QR for approved issuers</span></div>
        </section>
        <section className="sa-process sa-container" id="process">
          <div className="sa-section-heading"><div className="sa-eyebrow">THE WORKFLOW</div><h2>Three steps. One clear result.</h2><p>Prepare guest PDFs without an account. Approved issuers can sign in to create registry-backed certificates once enabled.</p></div>
          <div className="sa-steps">
            <article><span>01</span><h3>Choose a template</h3><p>Upload a finished PDF and use the preview to check your layout.</p></article>
            <article><span>02</span><h3>Add your participants</h3><p>Import an Excel or CSV sheet with names, programmes and issue dates.</p></article>
            <article><span>03</span><h3>Generate your batch</h3><p>Review one sample, then download each PDF or the complete ZIP.</p></article>
          </div>
        </section>
        <section className="sa-bottom-cta sa-container"><div><div className="sa-eyebrow">GET STARTED</div><h2>Your next event deserves an easier workflow.</h2><p>Use sample files first, then replace them with your own.</p></div><Link href="/app/simple" className="sa-button sa-button-primary">Open certificate workspace <ArrowRight size={17}/></Link></section>
      </main>
      <footer className="sa-footer sa-container"><span>© Sairam Innovation Ecosystem · Certificate tools</span><span>Guest PDFs are unverified. A QR is valid only when it links to an active registry entry.</span></footer>
    </div>
  );
}
