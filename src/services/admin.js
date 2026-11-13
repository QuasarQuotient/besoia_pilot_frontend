// Shared by the passcode-protected pages (/reports, /content).
const STORAGE_KEY = 'besoia_reports_passcode';

export function readPasscode() {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
}

export function writePasscode(value) {
  try { value ? localStorage.setItem(STORAGE_KEY, value) : localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function saveFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Resolves to { body } or { status, error: { code, message } }
export async function adminRequest(path, { method = 'POST', passcode, ...body }) {
  try {
    const response = await fetch(`/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, ...body })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return { body: data };
    return { status: response.status, error: { code: data.code || (response.status >= 500 ? 'server' : 'request_failed'), message: data.error } };
  } catch {
    return { error: { code: 'network' } };
  }
}
