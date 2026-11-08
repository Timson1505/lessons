/* Filter the Lessons catalogue using the signed-in user's verified lesson access. */
(() => {
  const levels = [
    'Beginner-1', 'Beginner-2', 'Beginner-3',
    'Elementary-1', 'Elementary-2', 'Elementary-3',
    'Intermediate', 'Upper-Intermediate', 'Advanced'
  ];

  // Canonicalise labels so "Beginner-1", "Beginner - 1" and
  // " beginner - 1 " all resolve to the same level.
  const normalizeLevel = value => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '-');

  const allLevels = new Set(levels.map(normalizeLevel));

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

    const showNone = message => {
      dropdowns.forEach(item => { item.hidden = true; });
      notice.textContent = message;
      notice.hidden = false;
    };

    try {
      const clientFactory = window.supabase?.createClient;
      if (!clientFactory) {
        showNone('The lesson service could not load. Check your connection and reload the page.');
        return;
      }

      const client = clientFactory(
        'https://dtgspwsxwslntlayqcbe.supabase.co',
        'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf',
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
      );

      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.user) {
        showNone('Sign in to see the lessons available to your account.');
        return;
      }

      const { data, error } = await client.rpc('my_lesson_access');
      if (error) throw error;

      const access = Array.isArray(data) ? data[0] : data;
      if (!access) {
        showNone('No lesson access is assigned to this account yet. Contact the administrator.');
        return;
      }

      const granted = new Set(
        (access.role === 'admin' ? levels : (access.approved_levels || []))
          .map(normalizeLevel)
      );

      let visibleCount = 0;
      dropdowns.forEach(item => {
        const title = item.querySelector('.dropdown-title')?.textContent || '';
        const level = normalizeLevel(title);
        const allowed = allLevels.has(level) && granted.has(level);
        item.hidden = !allowed;
        if (allowed) visibleCount++;
      });

      notice.hidden = false;
      notice.textContent = visibleCount
        ? 'Showing only the lesson levels approved for your account.'
        : 'No lesson levels are currently approved for your account. Contact the administrator.';
    } catch (error) {
      console.error('Lesson access verification failed:', error);
      showNone('We could not verify your lesson access. Please reload the page or contact the administrator.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLessonAccess);
  } else {
    applyLessonAccess();
  }
})();
