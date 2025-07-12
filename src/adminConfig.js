const emails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
export const isAdminEmail = email => email && emails.includes(email);

