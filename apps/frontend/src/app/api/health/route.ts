import { NextResponse } from 'next/server';

export function GET() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  let passwordStatus = 'missing';
  try {
    const url = new URL(dbUrl);
    const pw = url.password;
    if (pw === '') passwordStatus = 'empty';
    else if (pw) passwordStatus = `present (length ${decodeURIComponent(pw).length})`;
  } catch {
    passwordStatus = 'url-parse-error';
  }
  return NextResponse.json({
    status: 'ok',
    db_url_set: !!dbUrl,
    db_url_prefix: dbUrl.slice(0, 20) || null,
    password_status: passwordStatus,
  });
}
