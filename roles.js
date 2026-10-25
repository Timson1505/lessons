/* Public frontend config. Publishable/anon keys are intended for browser use.
   Never place a Supabase service_role or secret key in GitHub Pages. */
const SUPABASE_URL = 'https://dtgspwsxwslntlayqcbe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';

(() => {
  const { createClient } = window.supabase || {};
  const requiredRole = document.body.dataset.requiredRole;
  const authPanel = document.getElementById('auth-panel');
  const dashboardPanel = document.getElementById('dashboard-panel');
  const loginForm = document.getElementById('login-form');
  const authMessage = document.getElementById('auth-message');
  const dashboardMessage = document.getElementById('dashboard-message');
  const logoutButton = document.getElementById('logout-btn');
  const emailLabel = document.getElementById('session-email');

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  if (!createClient) {
    setMessage(authMessage, 'Could not load Supabase. Check your internet connection and reload.', true);
    return;
  }

  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  function setMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message || '';
    element.classList.toggle('error', Boolean(isError));
    element.classList.toggle('success', Boolean(message) && !isError);
  }

  function showSignedOut(message = '') {
    authPanel?.classList.remove('hidden');
    dashboardPanel?.classList.add('hidden');
    logoutButton?.classList.add('hidden');
    if (emailLabel) emailLabel.textContent = '';
    setMessage(authMessage, message, Boolean(message));
  }

  async function renderSession() {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
      showSignedOut(sessionError.message);
      return;
    }
    if (!session) {
      showSignedOut();
      return;
    }

    if (emailLabel) emailLabel.textContent = session.user.email || '';
    logoutButton?.classList.remove('hidden');

    const { data: profile, error } = await client
      .from('profiles')
      .select('id, name, role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      showSignedOut('Could not read your profile. Check the profiles table and its RLS SELECT policy.');
      setMessage(authMessage, error.message, true);
      return;
    }

    if (!profile) {
      showSignedOut('Your account has no profile yet. Ask the administrator to create or link your profile.');
      return;
    }

    if (profile.role !== requiredRole) {
      await client.auth.signOut();
      showSignedOut('Access denied: this page is for the ' + requiredRole + ' role. Your account role is ' + profile.role + '.');
      return;
    }

    authPanel?.classList.add('hidden');
    dashboardPanel?.classList.remove('hidden');
    setMessage(authMessage, '');
    setMessage(dashboardMessage, 'Signed in as ' + (profile.name || session.user.email) + '.');

    if (requiredRole === 'admin') await loadAdminProfiles();
  }

  async function loadAdminProfiles() {
    const body = document.getElementById('profiles-body');
    const count = document.getElementById('profile-count');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="4">Loading profiles…</td></tr>';
    const { data, error } = await client
      .from('profiles')
      .select('name, role, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      body.innerHTML = '<tr><td colspan="4">Profiles could not be loaded. Check the admin SELECT policy.</td></tr>';
      setMessage(dashboardMessage, error.message, true);
      return;
    }
    if (count) count.textContent = String(data.length);
    if (!data.length) {
      body.innerHTML = '<tr><td colspan="4">No profiles found.</td></tr>';
      return;
    }
    body.replaceChildren();
    data.forEach(profile => {
      const row = document.createElement('tr');
      [profile.name || '—', profile.role || '—', profile.phone || '—',
        profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'
      ].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  loginForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in…';
    setMessage(authMessage, '');
    const { error } = await client.auth.signInWithPassword({ email, password });
    submitButton.disabled = false;
    submitButton.textContent = 'Sign in securely';
    if (error) {
      setMessage(authMessage, error.message, true);
      return;
    }
    await renderSession();
  });

  logoutButton?.addEventListener('click', async () => {
    const { error } = await client.auth.signOut();
    if (error) setMessage(dashboardMessage, error.message, true);
    showSignedOut();
  });

  document.getElementById('refresh-btn')?.addEventListener('click', loadAdminProfiles);
  client.auth.onAuthStateChange(() => { void renderSession(); });
  void renderSession();
})();