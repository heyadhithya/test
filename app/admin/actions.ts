"use server";
export async function requestAdminOtp(_email: string) { return {success: false, error: "Administration is not configured."}; }
export async function verifyAdminOtp(_otp: string) { return {success: false, error: "Administration is not configured."}; }
export async function logoutAdmin() { return {success: true}; }
