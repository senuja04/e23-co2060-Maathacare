import { useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = (((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_URL)
  || 'https://e23-co2060-maathacare-production.up.railway.app').replace(/\/$/, '');
const LOGIN_ENDPOINT = '/api/users/staff/login';

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonRecord
    : {};

const decodeJwtRole = (token: string): string => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return '';
    const normalised = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '='))) as JsonRecord;
    return String(decoded.role || decoded.authority || '').toUpperCase();
  } catch {
    return '';
  }
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanStaffId = staffId.trim();
    if (!cleanStaffId || !password) {
      setErrorMsg('Enter your Admin ID and password.');
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId: cleanStaffId, password }),
        signal: controller.signal,
      });

      const rawBody = await response.text();
      let payload: unknown = rawBody;
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        // Keep a plain-text backend response as-is.
      }

      if (!response.ok) {
        const backendMessage = typeof payload === 'string'
          ? payload
          : String(asRecord(payload).message || asRecord(payload).error || '');
        throw new Error(backendMessage || `Login failed with HTTP ${response.status}.`);
      }

      const root = asRecord(payload);
      const data = asRecord(root.data);
      const token = String(
        root.token
        || root.accessToken
        || root.jwt
        || root.jwtToken
        || data.token
        || data.accessToken
        || data.jwt
        || data.jwtToken
        || '',
      ).trim();

      const responseRole = String(
        root.role
        || data.role
        || asRecord(root.user).role
        || asRecord(data.user).role
        || '',
      ).toUpperCase();
      const role = responseRole || decodeJwtRole(token);

      if (!token) {
        throw new Error('The backend accepted the login but returned no JWT token. Check AuthResponse field names.');
      }
      if (role && !role.includes('ADMIN')) {
        throw new Error(`Access denied. This account has role ${role}, not ADMIN.`);
      }

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRole', role || 'ADMIN');
      localStorage.setItem('adminStaffId', cleanStaffId);
      setStatusMsg('Login successful. Opening dashboard…');

      navigate('/dashboard', { replace: true });

      // Fallback in case React Router navigation is interrupted by stale application state.
      window.setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.assign('/dashboard');
        }
      }, 300);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setErrorMsg(`The backend did not respond within 15 seconds. Check that ${API_URL} is running.`);
      } else if (error instanceof TypeError) {
        setErrorMsg(`Cannot connect to ${API_URL}. Check the backend, CORS settings, and VITE_API_URL.`);
      } else {
        setErrorMsg(error instanceof Error ? error.message : 'Unable to authenticate.');
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.brandMark}>MC</div>
        <p style={styles.eyebrow}>MINISTRY OF HEALTH · SRI LANKA</p>
        <h1 style={styles.title}>MaathaCare Admin</h1>
        <p style={styles.subtitle}>Secure workforce and maternal-care operations portal</p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        {statusMsg && <div style={styles.success}>{statusMsg}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>
            Admin ID
            <input
              autoComplete="username"
              required
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              style={styles.input}
              placeholder="e.g. ADMIN-MASTER"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={styles.input}
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating…' : 'Secure login'}
          </button>
        </form>

        <p style={styles.apiNote}>API: {API_URL}</p>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: 24,
    display: 'grid',
    placeItems: 'center',
    background: 'radial-gradient(circle at 80% 0%, #2967aa 0, #122f59 35%, #0b1f3c 78%)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    width: 'min(440px, 100%)',
    padding: '38px 36px',
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: 20,
    background: 'rgba(255,255,255,.97)',
    boxShadow: '0 28px 80px rgba(0,0,0,.28)',
    textAlign: 'left',
  },
  brandMark: {
    width: 46,
    height: 46,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 13,
    background: '#155da9',
    color: '#fff',
    fontWeight: 900,
    marginBottom: 20,
  },
  eyebrow: { margin: '0 0 7px', color: '#52779f', fontSize: 10, fontWeight: 850, letterSpacing: '.12em' },
  title: { margin: 0, color: '#15253d', fontSize: 30, letterSpacing: '-.04em' },
  subtitle: { margin: '8px 0 26px', color: '#718096', fontSize: 13, lineHeight: 1.5 },
  form: { display: 'grid', gap: 16 },
  label: { display: 'grid', gap: 7, color: '#40536a', fontSize: 12, fontWeight: 800 },
  input: {
    width: '100%',
    padding: '12px 13px',
    border: '1px solid #d8e2ec',
    borderRadius: 9,
    background: '#fff',
    color: '#24364e',
    fontSize: 14,
    outlineColor: '#5b9bd3',
  },
  button: {
    marginTop: 4,
    padding: '13px 15px',
    border: 0,
    borderRadius: 9,
    background: '#1766b3',
    color: '#fff',
    fontSize: 14,
    fontWeight: 850,
    cursor: 'pointer',
  },
  error: {
    margin: '0 0 18px',
    padding: 12,
    border: '1px solid #efc9cd',
    borderRadius: 9,
    background: '#fff2f3',
    color: '#a63e4b',
    fontSize: 12,
    lineHeight: 1.45,
  },
  success: {
    margin: '0 0 18px',
    padding: 12,
    border: '1px solid #bde4cf',
    borderRadius: 9,
    background: '#eefaf3',
    color: '#24734b',
    fontSize: 12,
    lineHeight: 1.45,
  },
  apiNote: { margin: '18px 0 0', color: '#9aa5b2', fontSize: 10, textAlign: 'center' },
};