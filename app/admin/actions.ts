"use server";
export async function requestAdminOtp(_email: string) { void _email; return {success: false, error: "Administration is not configured."}; }
export async function verifyAdminOtp(_otp: string) { void _otp; return {success: false, error: "Administration is not configured."}; }
export async function logoutAdmin() { return {success: true}; }
