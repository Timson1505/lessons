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

  if (!createClient) {
    setMessage('Unable to load the account service. Check your connection and reload.', true);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  function setMessage(text, error = false) {
    message.textContent = text || '';
    message.classList.toggle('error', error);
    message.classList.toggle('success', Boolean(text) && !error);
  }

  function showTab(tab) {
    const isSignIn = tab === 'signin';
    signInForm.classList.toggle('hidden', !isSignIn);
    signUpForm.classList.toggle('hidden', isSignIn);
    signInTab.classList.toggle('active', isSignIn);
    signUpTab.classList.toggle('active', !isSignIn);
    signInTab.setAttribute('aria-selected', String(isSignIn));
    signUpTab.setAttribute('aria-selected', String(!isSignIn));
    history.replaceState(null, '', isSignIn ? '#signin' : '#signup');
    setMessage('');
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

    const destinations = { admin: 'admin.html', teacher: 'teacher.html', student: 'student.html' };
    if (destinations[profile.role]) {
      window.location.href = destinations[profile.role];
    } else {
      setMessage('Your account is awaiting role assignment by the administrator. Please contact the site administrator.');
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

    const chosenRole = requestedRole === 'teacher' ? 'Teacher' : 'Student';
    if (data.session) {
      setMessage(`Account created as a ${chosenRole} request. Your actual role and access must be approved by the administrator before you can use the role dashboard.`);
    } else {
      setMessage(`Registration submitted as a ${chosenRole} request. Check your email for a confirmation link. The administrator must approve your role before dashboard access is granted.`);
    }
    signUpForm.reset();
  });

  showTab(window.location.hash.toLowerCase() === '#signup' ? 'signup' : 'signin');
});