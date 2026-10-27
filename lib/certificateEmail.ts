type SendCertificateEmailInput = {
    recipientEmail: string;
    recipientName: string;
    certificateId: string;
    verifyUrl: string;
    subject?: string;
    cc?: string;
    body?: string;
    theme?: string;
    course?: string;
};

type SendPasswordResetEmailInput = {
    email: string;
    resetUrl: string;
};

// Outbound mail is intentionally unavailable until sender/provider approval and delivery tests.
export async function sendCertificateEmail(input: SendCertificateEmailInput): Promise<never> {
    void input;
    throw new Error("Certificate email delivery is not configured");
}
export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<never> {
    void input;
    throw new Error("Password reset email delivery is not configured");
}
