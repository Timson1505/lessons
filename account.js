const SUPABASE_URL = 'https://dtgspwsxwslntlayqcbe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const { createClient } = window.supabase || {};
  const message = document.getElementById('account-message');
  const signInForm = document.getElementById('signin-form');
  const signUpForm = document.getElementById('signup-form');
  const signInTab = document.getElementById('signin-tab');
  const signUpTab = document.getElementById('signup-tab');
  const urlParams = new URLSearchParams(window.location.search);
  const inviteFromUrl = urlParams.get('invite');
  const roleInviteFromUrl = urlParams.get('role_invite');
  if (roleInviteFromUrl) { try { localStorage.setItem('lesson_role_invite_code', roleInviteFromUrl); } catch (_) {} }
  if (inviteFromUrl) {
    try { localStorage.setItem('lesson_invite_code', inviteFromUrl); } catch (_) {}
  }
  async function applyPendingInvite() {
    let code = inviteFromUrl;
    try { code = code || localStorage.getItem('lesson_invite_code'); } catch (_) {}
    if (!code) return true;
    const { error } = await supabase.rpc('join_teacher_by_invite', { p_invite_code: code });
    if (error) {
      setMessage('Your account is signed in, but the invitation could not be applied: ' + error.message, true);
      return false;
    }
    try { localStorage.removeItem('lesson_invite_code'); } catch (_) {}
    return true;
  }

  function setMessage(text, error = false) {
    if (!message) return;
    message.textContent = text || '';
    message.classList.toggle('error', error);
    message.classList.toggle('success', Boolean(text) && !error);
  }

  if (!createClient) {
    setMessage('Unable to load the account service. Check your connection and reload.', true);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  function showTab(tab) {
    const isSignIn = tab === 'signin';
    signInForm.classList.toggle('hidden', !isSignIn);
    signUpForm.classList.toggle('hidden', isSignIn);
    signInTab.classList.toggle('active', isSignIn);
    signUpTab.classList.toggle('active', !isSignIn);
    signInTab.setAttribute('aria-selected', String(isSignIn));
    signUpTab.setAttribute('aria-selected', String(!isSignIn));
    const inviteQuery = roleInviteFromUrl ? '?role_invite=' + encodeURIComponent(roleInviteFromUrl) : (inviteFromUrl ? '?invite=' + encodeURIComponent(inviteFromUrl) : '');
    history.replaceState(null, '', window.location.pathname + inviteQuery + (isSignIn ? '#signin' : '#signup'));
    setMessage('');
  }

  const invitedEmail = urlParams.get('invite_email') || '';
  const invitedPhone = urlParams.get('invite_phone') || '';
  if (invitedEmail) {
    const emailInput = signUpForm?.querySelector('input[name="email"]');
    if (emailInput) emailInput.value = invitedEmail;
  }
  if (invitedPhone) {
    const phoneInput = signUpForm?.querySelector('input[name="phone"]');
    if (phoneInput) phoneInput.value = invitedPhone;
  }
  if (inviteFromUrl || roleInviteFromUrl || invitedEmail || invitedPhone || window.location.hash === '#signup') {
    showTab('signup');
  }

  function setBusy(form, busy, text) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = busy;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = text;
    } else {
      button.textContent = button.dataset.originalText || (form === signInForm ? 'Sign in' : 'Create account');
    }
  }

  async function goToRoleDashboard(user) {
    const { data: profile, error } = await supabase
      .from('profiles').select('role, phone').eq('id', user.id).maybeSingle();

    if (error || !profile) {
      setMessage('Your account exists, but its profile is not ready. Please try again shortly or contact the administrator.', true);
      return false;
    }
    const destinations = { admin: 'admin.html', teacher: 'teacher.html', student: 'student.html' };
    const roleInvite = roleInviteFromUrl || (() => { try { return localStorage.getItem('lesson_role_invite_code'); } catch (_) { return null; } })();
    if (roleInvite) {
      const { data: invitedRole, error: roleInviteError } = await supabase.rpc('admin_accept_role_invite', { p_invite_code: roleInvite });
      if (roleInviteError) { setMessage('Your account is signed in, but the role invitation could not be applied: ' + roleInviteError.message, true); return false; }
      try { localStorage.removeItem('lesson_role_invite_code'); } catch (_) {}
      if (invitedRole === 'teacher') { window.location.replace('teacher.html'); return true; }
    } else if (inviteFromUrl || (() => { try { return Boolean(localStorage.getItem('lesson_invite_code')); } catch (_) { return false; } })()) {
      const joined = await applyPendingInvite();
      if (!joined) return;
    }
    if (destinations[profile.role]) {
      window.location.replace(destinations[profile.role]);
      return true;
    }
    setMessage('Your account is saved. The administrator must assign your role before dashboard access is available.');
    return false;
  }

  signInTab.addEventListener('click', () => showTab('signin'));
  signUpTab.addEventListener('click', () => showTab('signup'));

  signInForm.addEventListener('submit', async event => {
    event.preventDefault();
    setBusy(signInForm, true, 'Signing in…');
    setMessage('');
    const email = signInForm.elements.email.value.trim();
    const phone = signInForm.elements.phone.value.trim();
    const password = signInForm.elements.password.value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(signInForm, false);

    if (error) {
      setMessage(error.message, true);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('role, phone').eq('id', data.user.id).maybeSingle();

    if (profileError || !profile) {
      setMessage('You are signed in, but your profile is not available yet. Contact the administrator.', true);
      return;
    }

    const normalizePhone = value => value.replace(/[^+\d]/g, '').replace(/^00/, '+');
    if (!profile.phone || normalizePhone(profile.phone) !== normalizePhone(phone)) {
      await supabase.auth.signOut();
      setMessage('The phone number does not match this account. Please check it or contact the administrator.', true);
      return;
    }

    const roleInvite = roleInviteFromUrl || (() => { try { return localStorage.getItem('lesson_role_invite_code'); } catch (_) { return null; } })();
    if (roleInvite) {
      const { data: invitedRole, error: roleInviteError } = await supabase.rpc('admin_accept_role_invite', { p_invite_code: roleInvite });
      if (roleInviteError) { setMessage('Your account is signed in, but the role invitation could not be applied: ' + roleInviteError.message, true); return; }
      try { localStorage.removeItem('lesson_role_invite_code'); } catch (_) {}
      if (invitedRole === 'teacher') { window.location.replace('teacher.html'); return; }
    }
    const hasInvite = !roleInvite && (inviteFromUrl || (() => { try { return Boolean(localStorage.getItem('lesson_invite_code')); } catch (_) { return false; } })());
    if (hasInvite) {
      const joined = await applyPendingInvite();
      if (!joined) return;
    }
    const destinations = { admin: 'admin.html', teacher: 'teacher.html', student: 'student.html' };
    if (destinations[profile.role]) {
      window.location.replace(destinations[profile.role]);
    } else {
      setMessage('Your account is saved, but its role is awaiting administrator assignment.');
    }
  });

  signUpForm.addEventListener('submit', async event => {
    event.preventDefault();
    setBusy(signUpForm, true, 'Creating account…');
    setMessage('');
    const name = signUpForm.elements.name.value.trim();
    const email = signUpForm.elements.email.value.trim();
    const phone = signUpForm.elements.phone.value.trim();
    const requestedRole = signUpForm.elements.requested_role.value;
    const password = signUpForm.elements.password.value;

    if (!['student', 'teacher'].includes(requestedRole)) {
      setBusy(signUpForm, false);
      setMessage('Please choose Student or Teacher.', true);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, requested_role: requestedRole } }
    });
    setBusy(signUpForm, false);

    if (error) {
      setMessage(error.message, true);
      return;
    }

    signUpForm.reset();

    if (data.session && data.user) {
      if (roleInviteFromUrl) {
        const { data: invitedRole, error: roleInviteError } = await supabase.rpc('admin_accept_role_invite', { p_invite_code: roleInviteFromUrl });
        if (roleInviteError) { setMessage('Account created, but the invitation could not be applied: ' + roleInviteError.message, true); return; }
        try { localStorage.removeItem('lesson_role_invite_code'); } catch (_) {}
        if (invitedRole === 'teacher') { setMessage('Teacher invitation accepted. Opening dashboard…'); window.location.replace('teacher.html'); return; }
        setMessage('Student invitation accepted. Opening dashboard…'); window.location.replace('student.html'); return;
      }
      if (requestedRole === 'student') {
        if (inviteFromUrl) {
          const joined = await applyPendingInvite();
          if (!joined) return;
        }
        setMessage('Account created. Opening your student dashboard…');
        await goToRoleDashboard(data.user);
      } else {
        setMessage('Your account is saved. Your teacher role request must be approved by the administrator before the teacher dashboard is available.');
      }
    } else {
      const roleLabel = requestedRole === 'teacher' ? 'teacher' : 'student';
      setMessage(`Registration saved as a ${roleLabel} request. Check your email to confirm the account. After confirmation, sign in to open your assigned dashboard. Teacher access requires administrator approval.`);
    }
  });

  showTab(window.location.hash.toLowerCase() === '#signup' ? 'signup' : 'signin');

  // A returning user with a valid saved session should go straight to their dashboard.
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await goToRoleDashboard(session.user);
  })();
});