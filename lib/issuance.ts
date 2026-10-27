import { createHash, createHmac } from 'node:crypto';

export type IssuanceRecord = { certificateId: string; userId: string; name: string; course: string; issueDate: string; revoked: boolean; pdfUrl: string; status: string };
export type IssuanceRepository = {
  reserve(record: IssuanceRecord): Promise<IssuanceRecord>;
  complete(id: string, objectKey: string): Promise<IssuanceRecord>;
};
export function issuanceId(issuer: string, requestDigest: string, row: number, secret: string) {
  if (secret.length < 32) throw new Error('Issuance identity secret must be configured');
  return 'CERT-' + createHmac('sha256', secret).update(JSON.stringify([issuer, requestDigest, row])).digest('hex').slice(0,32).toUpperCase();
}
export function requestDigest(template: Uint8Array, dataset: Uint8Array, settings: unknown) {
  return createHash('sha256').update(JSON.stringify([createHash('sha256').update(template).digest('hex'),createHash('sha256').update(dataset).digest('hex'),settings])).digest('hex');
}
export function isVerified(record: Pick<IssuanceRecord, 'revoked'|'pdfUrl'|'status'> | null) {
  return !!record && !record.revoked && record.status === 'issued' && !!record.pdfUrl;
}
/** Reserve a stable identity, upload privately, then activate verification. Retry uses the same identity. */
export async function issueCertificate(record: IssuanceRecord, repo: IssuanceRepository, render: (id: string) => Promise<Buffer>, upload: (key: string, pdf: Buffer) => Promise<void>) {
  const stored = await repo.reserve(record);
  if (stored.userId !== record.userId || stored.revoked) throw new Error('Certificate is not eligible for issuance');
  if (isVerified(stored)) return stored;
  const objectKey = `${record.userId}/${record.certificateId}.pdf`;
  const pdf = await render(record.certificateId);
  await upload(objectKey, pdf);
  return repo.complete(record.certificateId, objectKey);
}
