(() => {
  const SUPABASE_URL = 'https://dtgspwsxwslntlayqcbe.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';

  document.addEventListener('DOMContentLoaded', async () => {
    const actions = document.querySelector('.sidebar-auth-actions');
    if (!actions || !window.supabase?.createClient) return;

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const signIn = actions.querySelector('.sidebar-signin');
    const signUp = actions.querySelector('.sidebar-signup');

    let cabinet = actions.querySelector('.sidebar-cabinet');
    if (!cabinet) {
      cabinet = document.createElement('a');
      cabinet.className = 'sidebar-auth-btn sidebar-cabinet';
      cabinet.href = 'account.html';
      cabinet.innerHTML = '<i class="fa fa-user-circle"></i> My Cabinet';
      cabinet.hidden = true;
      actions.appendChild(cabinet);
    }

    async function updateAccountLinks(session) {
      if (!session?.user) {
        signIn?.removeAttribute('hidden');
        signUp?.removeAttribute('hidden');
        cabinet.hidden = true;
        return;
      }

      if (signIn) signIn.hidden = true;
      if (signUp) signUp.hidden = true;
      cabinet.hidden = false;
      cabinet.href = 'account.html';

      const { data: profile } = await client
        .from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      const destinations = { admin: 'admin.html', teacher: 'teacher.html', student: 'student.html' };
      if (profile?.role && destinations[profile.role]) {
        cabinet.href = destinations[profile.role];
      }
    }

    const { data: { session } } = await client.auth.getSession();
    await updateAccountLinks(session);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => updateAccountLinks(session), 0);
    });
  });
})();