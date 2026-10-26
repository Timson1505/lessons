/* Filter the sidebar Lessons section by the signed-in user's approved lesson access. */
(() => {
  const levels = [
    'Beginner-1', 'Beginner-2', 'Beginner-3',
    'Elementary-1', 'Elementary-2', 'Elementary-3',
    'Intermediate', 'Upper-Intermediate', 'Advanced'
  ];
  const labels = {
    'Beginner - 1': 'Beginner-1',
    'Beginner - 2': 'Beginner-2',
    'Beginner - 3': 'Beginner-3',
    'Elementary - 1': 'Elementary-1',
    'Elementary - 2': 'Elementary-2',
    'Elementary - 3': 'Elementary-3'
  };

  async function applyLessonAccess() {
    const container = document.getElementById('protectedContent');
    if (!container) return;
    const dropdowns = [...container.querySelectorAll('.dropdown')];
    let notice = document.getElementById('lesson-access-notice');
    if (!notice) {
      notice = document.createElement('p');
      notice.id = 'lesson-access-notice';
      notice.className = 'lesson-access-notice';
      container.prepend(notice);
    }
    const showNone = (message) => {
      dropdowns.forEach(item => { item.hidden = true; });
      notice.textContent = message;
      notice.hidden = false;
    };

    const clientFactory = window.supabase?.createClient;
    if (!clientFactory) {
      showNone('Lessons are unavailable right now. Please reload the page.');
      return;
    }
    const client = clientFactory(
      'https://dtgspwsxwslntlayqcbe.supabase.co',
      'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf',
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session) {
      showNone('Sign in to see the lessons available to your account.');
      return;
    }
    const { data, error } = await client.rpc('my_lesson_access');
    if (error) {
      showNone('We could not verify your lesson access. Please contact the administrator.');
      console.error('Lesson access lookup failed:', error);
      return;
    }
    const access = Array.isArray(data) ? data[0] : data;
    if (!access) {
      showNone('No lesson access is assigned to this account yet. Contact the administrator.');
      return;
    }
    const granted = new Set(access.role === 'admin' ? levels : (access.approved_levels || []));
    let visibleCount = 0;
    dropdowns.forEach(item => {
      const title = item.querySelector('.dropdown-title')?.textContent.trim();
      const level = labels[title];
      const allowed = Boolean(level && granted.has(level));
      item.hidden = !allowed;
      if (allowed) visibleCount++;
    });
    notice.hidden = false;
    notice.textContent = visibleCount
      ? 'Showing only the lesson levels approved for your account.'
      : 'No lesson levels are currently approved for your account. Contact the administrator.';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLessonAccess);
  } else {
    applyLessonAccess();
  }
})();
