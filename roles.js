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

    if (requiredRole === 'admin') { await loadAdminProfiles(); await loadAdminAccess(); }
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

  const LESSON_LEVELS = [
    'Beginner-1', 'Beginner-2', 'Beginner-3',
    'Elementary-1', 'Elementary-2', 'Elementary-3',
    'Intermediate', 'Upper-Intermediate', 'Advanced'
  ];

  async function loadAdminAccess() {
    const body = document.getElementById('access-body');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="9">Loading registered users…</td></tr>';
    const { data, error } = await client.rpc('admin_list_lesson_access');
    if (error) {
      body.innerHTML = '<tr><td colspan="9">Could not load users. Apply the lesson access migration in Supabase and verify that your profile role is admin.</td></tr>';
      setMessage(document.getElementById('access-message'), error.message, true);
      return;
    }
    body.replaceChildren();
    if (!data || !data.length) {
      body.innerHTML = '<tr><td colspan="9">No registered users found.</td></tr>';
      return;
    }

    data.forEach(user => {
      const row = document.createElement('tr');
      row.dataset.userId = user.user_id;

      const identity = document.createElement('td');
      const name = document.createElement('strong');
      name.textContent = user.full_name || 'Student';
      const email = document.createElement('div');
      email.className = 'access-user-email';
      email.textContent = user.email || '(email unavailable)';
      identity.append(name, email);
      row.appendChild(identity);

      const planCell = document.createElement('td');
      const plan = document.createElement('select');
      plan.setAttribute('aria-label', 'Plan for ' + (user.email || user.user_id));
      [
        ['beginner', 'Beginner — $10/month'],
        ['elementary', 'Elementary — $15/month'],
        ['all_lessons', 'All lessons — $20/month']
      ].forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        plan.appendChild(option);
      });
      plan.value = user.requested_plan || 'all_lessons';
      planCell.appendChild(plan);
      row.appendChild(planCell);

      const requestedCell = document.createElement('td');
      requestedCell.textContent = (user.requested_levels || []).join(', ') || 'No level request yet';
      row.appendChild(requestedCell);

      const paymentCell = document.createElement('td');
      const payment = document.createElement('input');
      payment.type = 'checkbox';
      payment.checked = Boolean(user.payment_confirmed);
      payment.setAttribute('aria-label', 'Payment confirmed for ' + (user.email || user.user_id));
      paymentCell.appendChild(payment);
      row.appendChild(paymentCell);

      const levelsCell = document.createElement('td');
      const levelsBox = document.createElement('div');
      levelsBox.className = 'access-levels';
      const selected = new Set(user.approved_levels || []);
      LESSON_LEVELS.forEach(level => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = level;
        checkbox.checked = selected.has(level);
        label.append(checkbox, document.createTextNode(level));
        levelsBox.appendChild(label);
      });
      levelsCell.appendChild(levelsBox);
      row.appendChild(levelsCell);

      const statusCell = document.createElement('td');
      const status = document.createElement('select');
      status.setAttribute('aria-label', 'Access status for ' + (user.email || user.user_id));
      ['pending', 'approved', 'revoked'].forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
        status.appendChild(option);
      });
      status.value = user.status || 'pending';
      statusCell.appendChild(status);
      const pill = document.createElement('div');
      pill.className = 'status-pill';
      pill.textContent = status.value;
      status.addEventListener('change', () => { pill.textContent = status.value; });
      statusCell.appendChild(pill);
      row.appendChild(statusCell);

      const expiryCell = document.createElement('td');
      const expiry = document.createElement('input');
      expiry.type = 'date';
      expiry.setAttribute('aria-label', 'Access expiry for ' + (user.email || user.user_id));
      if (user.expires_at) expiry.value = new Date(user.expires_at).toISOString().slice(0, 10);
      expiryCell.appendChild(expiry);
      row.appendChild(expiryCell);

      const noteCell = document.createElement('td');
      const note = document.createElement('input');
      note.type = 'text';
      note.maxLength = 500;
      note.placeholder = 'Optional note';
      note.value = user.admin_note || '';
      note.setAttribute('aria-label', 'Admin note for ' + (user.email || user.user_id));
      noteCell.appendChild(note);
      row.appendChild(noteCell);

      const actionCell = document.createElement('td');
      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'button button-primary';
      save.textContent = 'Save access';
      save.addEventListener('click', async () => {
        const approvedLevels = [...levelsBox.querySelectorAll('input:checked')].map(input => input.value);
        if (status.value === 'approved' && !payment.checked) {
          setMessage(document.getElementById('access-message'), 'Confirm the payment before approving ' + (user.email || 'this user') + '.', true);
          return;
        }
        if (status.value === 'approved' && !approvedLevels.length) {
          setMessage(document.getElementById('access-message'), 'Choose at least one lesson level before approving access.', true);
          return;
        }
        save.disabled = true;
        save.textContent = 'Saving…';
        const expiryValue = expiry.value ? new Date(expiry.value + 'T23:59:59').toISOString() : null;
        const { error: saveError } = await client.rpc('admin_update_lesson_access', {
          p_user_id: user.user_id,
          p_requested_plan: plan.value,
          p_requested_levels: user.requested_levels || [],
          p_approved_levels: approvedLevels,
          p_status: status.value,
          p_payment_confirmed: payment.checked,
          p_expires_at: expiryValue,
          p_admin_note: note.value.trim() || null
        });
        save.disabled = false;
        save.textContent = 'Save access';
        if (saveError) {
          setMessage(document.getElementById('access-message'), saveError.message, true);
          return;
        }
        setMessage(document.getElementById('access-message'), 'Saved access settings for ' + (user.email || user.user_id) + '.');
        await loadAdminAccess();
      });
      actionCell.appendChild(save);
      row.appendChild(actionCell);
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
  document.getElementById('access-refresh-btn')?.addEventListener('click', loadAdminAccess);
  client.auth.onAuthStateChange(() => { void renderSession(); });
  void renderSession();
})();