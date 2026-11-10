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
      cabinet.innerHTML = '<i class="fa fa-user-circle" aria-hidden="true"></i><span>My Cabinet</span>';
      cabinet.hidden = true;
      actions.appendChild(cabinet);
    }

    const heroImage = document.querySelector('.home-img img');
    const defaultHeroImage = heroImage?.getAttribute('src') || 'hero.jpg';

    function updateHeroPhoto(user, role) {
      if (!heroImage) return;
      const photo = role === 'teacher' || role === 'student'
        ? user?.user_metadata?.avatar_url
        : null;
      // Profile uploads use unique Storage paths; use the stored URL directly.
      if (photo) {
        try {
          const parsed = new URL(photo);
          if (parsed.protocol === 'https:') {
            heroImage.src = parsed.href;
            heroImage.alt = role === 'teacher' ? 'Teacher profile photo' : 'Student profile photo';
            heroImage.dataset.profilePhoto = 'true';
            return;
          }
        } catch (_) {}
      }
      heroImage.src = defaultHeroImage;
      heroImage.alt = 'English learning at Timson’s English Lessons';
      delete heroImage.dataset.profilePhoto;
    }

    async function updateAccountLinks(session) {
      // Keep a single account entry in the sidebar for both guests and signed-in users.
      if (signIn) signIn.hidden = true;
      if (signUp) signUp.hidden = true;
      cabinet.hidden = false;
      cabinet.href = 'account.html';
      if (!session?.user) {
        updateHeroPhoto(null, null);
        return;
      }

      const { data: profile } = await client
        .from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      const destinations = { admin: 'admin.html', teacher: 'teacher.html', student: 'student.html' };
      if (profile?.role && destinations[profile.role]) {
        cabinet.href = destinations[profile.role];
      }
      updateHeroPhoto(session.user, profile?.role);
    }

    const { data: { session } } = await client.auth.getSession();
    await updateAccountLinks(session);
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => updateAccountLinks(session), 0);
    });
  });
})();