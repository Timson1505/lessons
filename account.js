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
    const password = signInForm.elements.password.value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(signInForm, false);

    if (error) {
      setMessage(error.message, true);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).maybeSingle();

    if (profileError || !profile) {
      setMessage('You are signed in, but your profile is not available yet. Contact the administrator.', true);
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
    const password = signUpForm.elements.password.value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    setBusy(signUpForm, false);

    if (error) {
      setMessage(error.message, true);
      return;
    }

    if (data.session) {
      setMessage('Account created. If your profile is ready, sign in to continue. The administrator must assign your student or teacher role.');
    } else {
      setMessage('Registration submitted. Check your email for a confirmation link. After confirmation, the administrator must assign your role.');
    }
    signUpForm.reset();
  });

  showTab(window.location.hash.toLowerCase() === '#signup' ? 'signup' : 'signin');
});