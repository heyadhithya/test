import Link from 'next/link';
import { notFound } from 'next/navigation';
import samples from '@/public/demo/reference.json';

export function generateStaticParams() { return samples.map(sample => ({id: sample.id})); }
export default async function DemoReference({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const sample = samples.find(item => item.id === id);
  if (!sample) notFound();
  return <main className="mx-auto max-w-xl p-8 text-slate-900">
    <Link href="/" className="font-semibold">Sairam Certify</Link>
    <p className="mt-10 font-bold text-amber-900">DEMO ONLY — NOT AN OFFICIAL CREDENTIAL</p>
    <h1 className="mt-4 text-3xl font-semibold">Sample certificate reference</h1>
    <p className="my-5">This QR identifies a fictional example in the downloadable test kit. It does not prove participation, institutional approval or authenticated issuance.</p>
    <dl className="space-y-3 rounded-xl border border-slate-300 p-6">
      <dt>Demo ID</dt><dd className="font-mono">{sample.id}</dd>
      <dt>Fictional participant</dt><dd className="font-semibold">{sample.Name}</dd>
      <dt>Example activity</dt><dd>{sample.Course}</dd>
      <dt>Example date</dt><dd>{sample['Issue Date']}</dd>
    </dl>
    <p className="mt-6">Real saved credentials use the separate authenticated issuance and verification registry.</p>
    <Link className="mt-6 inline-block underline" href="/app">Open certificate generator</Link>
  </main>;
}
