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

    if (requiredRole === 'admin') { await loadAdminProfiles(); await loadAdminAccess(); await loadAdminAccounts(); await loadAdminRatings(); }
    if (requiredRole === 'teacher') { await loadTeacherStudents(); await loadTeacherSchedule(); }
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


  async function loadTeacherSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="8">Loading schedule…</td></tr>';
    const { data, error } = await client.from('teacher_schedule_entries')
      .select('id,time_slot,student_name,writing_score,reading_score,listening_score,speaking_score,notes')
      .order('time_slot', { ascending: true });
    if (error) {
      body.innerHTML = '<tr><td colspan="8">Could not load schedule.</td></tr>';
      setMessage(document.getElementById('schedule-message'), error.message, true);
      return;
    }
    body.replaceChildren();
    if (!data || !data.length) {
      body.innerHTML = '<tr><td colspan="8">Your schedule is empty. Add your first student above.</td></tr>';
      return;
    }
    data.forEach(entry => {
      const row = document.createElement('tr');
      const fields = [
        ['time_slot', 'Time', 40],
        ['student_name', 'Student name', 160],
        ['writing_score', 'Writing assessment', 80],
        ['reading_score', 'Reading assessment', 80],
        ['listening_score', 'Listening assessment', 80],
        ['speaking_score', 'Speaking assessment', 80],
        ['notes', 'Notes', 500]
      ];
      const inputs = {};
      fields.forEach(([key, label, max]) => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = max;
        input.value = entry[key] || '';
        input.placeholder = label;
        input.setAttribute('aria-label', label + ' for ' + (entry.student_name || 'student'));
        inputs[key] = input;
        cell.appendChild(input);
        row.appendChild(cell);
      });
      const actionsCell = document.createElement('td');
      actionsCell.className = 'schedule-actions';
      const save = document.createElement('button');
      save.type = 'button'; save.className = 'button button-primary'; save.textContent = 'Save';
      save.addEventListener('click', async () => {
        if (!inputs.time_slot.value.trim() || !inputs.student_name.value.trim()) {
          setMessage(document.getElementById('schedule-message'), 'Enter both time and student name.', true);
          return;
        }
        save.disabled = true; save.textContent = 'Saving…';
        const update = {};
        fields.forEach(([key]) => update[key] = inputs[key].value.trim());
        const { error: saveError } = await client.from('teacher_schedule_entries').update(update).eq('id', entry.id);
        save.disabled = false; save.textContent = 'Save';
        if (saveError) { setMessage(document.getElementById('schedule-message'), saveError.message, true); return; }
        setMessage(document.getElementById('schedule-message'), 'Schedule and assessments saved.');
      });
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'button schedule-delete'; remove.textContent = 'Delete';
      remove.addEventListener('click', async () => {
        if (!window.confirm('Delete this schedule entry for ' + (entry.student_name || 'this student') + '?')) return;
        remove.disabled = true;
        const { error: deleteError } = await client.from('teacher_schedule_entries').delete().eq('id', entry.id);
        if (deleteError) { remove.disabled = false; setMessage(document.getElementById('schedule-message'), deleteError.message, true); return; }
        setMessage(document.getElementById('schedule-message'), 'Schedule entry deleted.');
        await loadTeacherSchedule();
      });
      actionsCell.append(save, remove); row.appendChild(actionsCell); body.appendChild(row);
    });
  }

  async function addTeacherScheduleEntry(event) {
    event.preventDefault();
    const form = document.getElementById('schedule-add-form');
    const time = document.getElementById('schedule-time').value.trim();
    const student = document.getElementById('schedule-student').value.trim();
    const button = form.querySelector('button[type="submit"]');
    if (!time || !student) return;
    button.disabled = true; button.textContent = 'Adding…';
    const { error } = await client.from('teacher_schedule_entries').insert({
      time_slot: time, student_name: student,
      writing_score: '', reading_score: '', listening_score: '', speaking_score: '', notes: ''
    });
    button.disabled = false; button.textContent = 'Add to schedule';
    if (error) { setMessage(document.getElementById('schedule-message'), error.message, true); return; }
    form.reset();
    setMessage(document.getElementById('schedule-message'), 'Student added to your schedule.');
    await loadTeacherSchedule();
  }

  let teacherStudentsCache = [];

  function renderTeacherStudents() {
    const body = document.getElementById('teacher-students-body');
    if (!body) return;
    const search = (document.getElementById('teacher-student-search')?.value || '').trim().toLocaleLowerCase();
    const selectedLevel = document.getElementById('teacher-student-level')?.value || '';
    const filtered = teacherStudentsCache.filter(student => {
      const name = String(student.full_name || 'Student').toLocaleLowerCase();
      const email = String(student.email || '').toLocaleLowerCase();
      const levels = Array.isArray(student.levels) ? student.levels : [];
      return (!search || name.includes(search) || email.includes(search)) && (!selectedLevel || levels.includes(selectedLevel));
    });
    body.replaceChildren();
    const resultLabel = document.getElementById('teacher-student-results');
    if (resultLabel) resultLabel.textContent = 'Showing ' + filtered.length + ' of ' + teacherStudentsCache.length + ' connected student' + (teacherStudentsCache.length === 1 ? '' : 's') + '.';
    if (!filtered.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = teacherStudentsCache.length ? 'No students match your search or level filter.' : 'No students have accepted your invitation links yet. Create an invite above to get started.';
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }
    filtered.forEach(student => {
      const row = document.createElement('tr');
      [
        student.full_name || 'Student',
        student.email || 'Email not available',
        student.joined_at ? new Date(student.joined_at).toLocaleDateString() : '—',
        (Array.isArray(student.levels) ? student.levels : []).join(', ') || 'No levels'
      ].forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 0) cell.style.fontWeight = '700';
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  async function loadTeacherStudents() {
    const body = document.getElementById('teacher-students-body');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="4">Loading students…</td></tr>';
    const { data, error } = await client.rpc('teacher_list_linked_students');
    if (error) {
      body.innerHTML = '<tr><td colspan="4">Could not load students. Check the teacher RPC and database migration.</td></tr>';
      setMessage(dashboardMessage, error.message, true);
      return;
    }
    teacherStudentsCache = Array.isArray(data) ? data : [];
    const count = document.getElementById('teacher-student-count');
    const levelCount = document.getElementById('teacher-level-count');
    if (count) count.textContent = String(teacherStudentsCache.length);
    const levels = [...new Set(teacherStudentsCache.flatMap(student => Array.isArray(student.levels) ? student.levels : []))].sort();
    if (levelCount) levelCount.textContent = String(levels.length);
    const select = document.getElementById('teacher-student-level');
    if (select) {
      const current = select.value;
      select.replaceChildren(new Option('All levels', ''));
      levels.forEach(level => select.add(new Option(level, level)));
      if (levels.includes(current)) select.value = current;
    }
    renderTeacherStudents();
  }

  async function createTeacherInvite() {
    const button = document.getElementById('create-invite-btn');
    const result = document.getElementById('invite-result');
    const levels = [...document.querySelectorAll('#teacher-level-options input:checked')].map(input => input.value);
    const contact = document.getElementById('teacher-invite-contact')?.value.trim() || '';

    if (!levels.length) {
      setMessage(result, 'Select at least one lesson level.', true);
      return;
    }
    if (contact && !contact.includes('@') && !/^[+()0-9\\s.-]{7,30}$/.test(contact)) {
      setMessage(result, 'Enter a valid email address or phone number.', true);
      return;
    }

    button.disabled = true;
    button.textContent = 'Creating link…';
    setMessage(result, 'Creating your invitation link…');
    const { data, error } = await client.rpc('teacher_create_invite', {
      p_levels: levels,
      p_expires_at: null
    });
    button.disabled = false;
    button.textContent = 'Create student invite link';

    if (error) {
      setMessage(result, 'Could not create invitation: ' + error.message, true);
      return;
    }
    const inviteCode = Array.isArray(data) ? data[0]?.invite_code : data?.invite_code;
    if (!inviteCode) {
      setMessage(result, 'The database did not return an invite code. Please try again or contact the administrator.', true);
      return;
    }

    const inviteUrl = new URL('account.html', window.location.href);
    inviteUrl.searchParams.set('invite', inviteCode);
    if (contact) inviteUrl.searchParams.set(contact.includes('@') ? 'invite_email' : 'invite_phone', contact);
    inviteUrl.hash = 'signup';
    const link = inviteUrl.href;

    result.replaceChildren();
    result.classList.remove('error');
    result.classList.add('success');
    const intro = document.createElement('p');
    intro.textContent = 'Invitation link created. Share this link with your student:';
    const linkBox = document.createElement('input');
    linkBox.type = 'text';
    linkBox.readOnly = true;
    linkBox.value = link;
    linkBox.setAttribute('aria-label', 'Student invitation link');
    linkBox.style.width = '100%';
    linkBox.style.margin = '.5rem 0';
    linkBox.style.padding = '.75rem';
    linkBox.style.border = '1px solid #cbd5e1';
    linkBox.style.borderRadius = '8px';
    linkBox.addEventListener('click', () => linkBox.select());

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexWrap = 'wrap';
    actions.style.gap = '.5rem';

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'button button-light';
    copy.textContent = 'Copy invitation link';
    copy.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(link);
        } else {
          linkBox.focus();
          linkBox.select();
          if (!document.execCommand('copy')) throw new Error('Copy not supported');
        }
        copy.textContent = 'Link copied!';
      } catch (_) {
        linkBox.focus();
        linkBox.select();
        copy.textContent = 'Select the link and copy';
      }
    });

    const share = document.createElement('button');
    share.type = 'button';
    share.className = 'button button-primary';
    share.textContent = 'Share with student';
    share.addEventListener('click', async () => {
      const shareText = 'You are invited to join Timson’s English Lessons. Open this link to create your account and connect with your teacher: ' + link;
      if (navigator.share) {
        try {
          await navigator.share({ title: 'English Lessons invitation', text: shareText, url: link });
        } catch (shareError) {
          if (shareError?.name !== 'AbortError') {
            linkBox.focus();
            linkBox.select();
          }
        }
      } else {
        try {
          if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(link);
          else { linkBox.focus(); linkBox.select(); document.execCommand('copy'); }
          share.textContent = 'Link copied — paste into a message';
        } catch (_) {
          linkBox.focus();
          linkBox.select();
          share.textContent = 'Select and copy the link';
        }
      }
    });

    actions.append(copy, share);
    result.append(intro, linkBox, actions);

    if (contact) {
      const send = document.createElement('button');
      send.type = 'button';
      send.className = 'button button-light';
      send.style.marginTop = '.5rem';
      send.textContent = contact.includes('@') ? 'Open email draft' : 'Open text message';
      send.addEventListener('click', () => {
        const messageText = 'You are invited to join Timson’s English Lessons. Open this link to sign up and connect with your teacher: ' + link;
        const destination = contact.includes('@')
          ? 'mailto:' + encodeURIComponent(contact) + '?subject=' + encodeURIComponent('Your English Lessons invitation') + '&body=' + encodeURIComponent(messageText)
          : 'sms:' + encodeURIComponent(contact) + '?body=' + encodeURIComponent(messageText);
        window.location.href = destination;
      });
      result.appendChild(send);
      const note = document.createElement('p');
      note.textContent = 'Choose “Open email draft” or “Open text message” to prepare a message. It will not send automatically.';
      result.appendChild(note);
    }

    if (contact) {
      const channel = contact.includes('@') ? 'email' : 'sms';
      const deliveryStatus = document.createElement('p');
      deliveryStatus.textContent = 'Sending invitation by ' + (channel === 'email' ? 'email' : 'SMS') + '…';
      result.appendChild(deliveryStatus);
      const { data: delivery, error: deliveryError } = await client.functions.invoke('send-student-invitation', {
        body: { inviteCode, inviteUrl: link, recipient: contact, channel }
      });
      if (deliveryError || delivery?.error || !delivery?.ok) {
        const reason = delivery?.error || deliveryError?.message || 'Unknown delivery error';
        deliveryStatus.textContent = 'Link created, but sending failed: ' + reason + ' You can still copy and share the link manually.';
        deliveryStatus.classList.add('error');
      } else {
        deliveryStatus.textContent = 'Invitation sent successfully by ' + (channel === 'email' ? 'email' : 'SMS') + ' to ' + contact + '.';
        deliveryStatus.classList.add('success');
      }
    } else {
      const note = document.createElement('p');
      note.textContent = 'Enter a student email or phone number above to send the invitation automatically.';
      result.appendChild(note);
    }

    await loadTeacherStudents();
  }


  async function deleteAdminUser(userId, email, button) {
    if (!userId || !window.confirm('Permanently delete account ' + (email || userId) + '? This cannot be undone.')) return;
    if (button) { button.disabled = true; button.textContent = 'Deleting…'; }
    const { error } = await client.rpc('admin_delete_user', { p_user_id: userId });
    if (error) {
      if (button) { button.disabled = false; button.textContent = 'Delete user'; }
      setMessage(document.getElementById('accounts-message') || document.getElementById('access-message'), error.message, true);
      return;
    }
    setMessage(document.getElementById('accounts-message') || document.getElementById('access-message'), 'Deleted account: ' + (email || userId) + '.');
    await loadAdminAccounts();
    await loadAdminAccess();
    await loadAdminProfiles();
    await loadAdminRatings();
  }

  async function loadAdminAccounts() {
    const body = document.getElementById('accounts-body');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="9">Loading accounts…</td></tr>';
    const { data, error } = await client.rpc('admin_list_all_accounts');
    if (error) { body.innerHTML = '<tr><td colspan="9">Could not load accounts.</td></tr>'; setMessage(document.getElementById('accounts-message'), error.message, true); return; }
    body.replaceChildren();
    if (!data?.length) { body.innerHTML = '<tr><td colspan="9">No accounts found.</td></tr>'; return; }
    data.forEach(user => {
      const row = document.createElement('tr');
      [user.full_name || '—', user.email || '—', user.phone || '—', user.role || 'unassigned',
       user.created_at ? new Date(user.created_at).toLocaleDateString() : '—',
       (user.approved_levels || []).join(', ') || '—', user.access_status || 'none',
       user.payment_confirmed ? 'Confirmed' : 'Not confirmed'].forEach(value => {
        const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
      });
      const actionCell = document.createElement('td');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button-danger';
      remove.textContent = 'Delete user';
      remove.addEventListener('click', () => deleteAdminUser(user.user_id, user.email, remove));
      actionCell.appendChild(remove);
      row.appendChild(actionCell);
      body.appendChild(row);
    });
  }

  async function loadAdminRatings() {
    const body = document.getElementById('ratings-body');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="6">Loading ratings…</td></tr>';
    const { data, error } = await client.rpc('admin_list_student_ratings');
    if (error) { body.innerHTML = '<tr><td colspan="6">Could not load ratings.</td></tr>'; setMessage(document.getElementById('ratings-message'), error.message, true); return; }
    body.replaceChildren();
    if (!data?.length) { body.innerHTML = '<tr><td colspan="6">No student ratings have been recorded yet.</td></tr>'; return; }
    data.forEach(item => {
      const row = document.createElement('tr');
      [item.student_name || '—', item.student_email || '—', String(item.rating), item.note || '—',
       item.rated_by_name || '—', item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'].forEach(value => {
        const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  async function loadInviteTeachers() {
    const select = document.getElementById('admin-invite-teacher');
    if (!select) return;
    select.replaceChildren();
    const ownOption = document.createElement('option');
    ownOption.value = '';
    ownOption.textContent = 'Administrator (not linked to a teacher)';
    select.appendChild(ownOption);
    const { data, error } = await client.from('profiles')
      .select('id,name')
      .eq('role', 'teacher')
      .order('name', { ascending: true });
    if (error) {
      setMessage(document.getElementById('admin-invite-result'), 'Could not load teachers: ' + error.message, true);
      return;
    }
    (data || []).forEach(teacher => {
      const option = document.createElement('option');
      option.value = teacher.id;
      option.textContent = teacher.name || ('Teacher ' + teacher.id.slice(0, 8));
      select.appendChild(option);
    });
  }

  async function createAdminInvite() {
    const button = document.getElementById('admin-create-invite-btn');
    const result = document.getElementById('admin-invite-result');
    if (!button || !result) return;
    const role = document.getElementById('admin-invite-role')?.value || 'student';
    const originalText = 'Generate invitation link';
    button.disabled = true;
    button.textContent = 'Generating link…';
    setMessage(result, '');
    try {
      let code = '';
      if (role === 'teacher') {
        const { data, error } = await client.rpc('admin_create_role_invite', {
          p_role: 'teacher',
          p_expires_at: null
        });
        if (error) throw error;
        code = Array.isArray(data) ? data[0]?.invite_code : data?.invite_code;
      } else {
        const levels = [...document.querySelectorAll('#admin-invite-levels input:checked')].map(input => input.value);
        if (!levels.length) {
          setMessage(result, 'Select at least one lesson level for the student.', true);
          return;
        }
        const teacherId = document.getElementById('admin-invite-teacher')?.value || '';
        const { data, error } = teacherId
          ? await client.rpc('admin_create_invite_for_teacher', {
              p_teacher_id: teacherId,
              p_levels: levels,
              p_expires_at: null
            })
          : await client.rpc('admin_create_invite', {
              p_levels: levels,
              p_expires_at: null
            });
        if (error) throw error;
        code = Array.isArray(data) ? data[0]?.invite_code : data?.invite_code;
      }
      if (!code) throw new Error('Supabase did not return an invitation code. Please try again.');
      const param = role === 'teacher' ? 'role_invite' : 'invite';
      const contact = document.getElementById('admin-invite-contact')?.value.trim() || '';
      if (contact && !contact.includes('@') && !/^[+()0-9\s.-]{7,30}$/.test(contact)) {
        throw new Error('Enter a valid email address or phone number.');
      }
      const inviteUrl = new URL('account.html', window.location.href);
      inviteUrl.searchParams.set(param, code);
      if (contact) inviteUrl.searchParams.set(contact.includes('@') ? 'invite_email' : 'invite_phone', contact);
      inviteUrl.hash = 'signup';
      const link = inviteUrl.href;
      result.replaceChildren();
      const label = document.createElement('span');
      const selectedTeacher = document.getElementById('admin-invite-teacher');
      const teacherName = role === 'student' && selectedTeacher?.value
        ? selectedTeacher.options[selectedTeacher.selectedIndex]?.textContent
        : '';
      label.textContent = 'Share this ' + role + ' invitation link' + (teacherName ? ' for ' + teacherName : '') + ': ';
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.textContent = link;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'button button-light';
      copy.textContent = 'Copy link';
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(link);
          copy.textContent = 'Copied!';
        } catch (_) {
          setMessage(result, 'Copy was blocked by the browser. Select and copy the link manually.', true);
        }
      });
      result.append(label, anchor, document.createElement('br'), copy);
      if (contact) {
        const send = document.createElement('button');
        send.type = 'button';
        send.className = 'button button-primary';
        send.style.marginLeft = '.5rem';
        const emailContact = contact.includes('@');
        send.textContent = emailContact ? 'Open email draft' : 'Open text message';
        send.addEventListener('click', () => {
          const message = 'You are invited to join English Lessons. Open this link to sign up: ' + link;
          const destination = emailContact
            ? 'mailto:' + encodeURIComponent(contact) + '?subject=' + encodeURIComponent('Your English Lessons invitation') + '&body=' + encodeURIComponent(message)
            : 'sms:' + encodeURIComponent(contact) + '?body=' + encodeURIComponent(message);
          window.location.href = destination;
        });
        result.appendChild(send);
      }
      setMessage(result, contact ? 'Invitation link created for ' + contact + '. Use the button to open your email or messaging app; the message is not sent automatically.' : '');
    } catch (error) {
      console.error('Invitation generation failed:', error);
      setMessage(result, error?.message || 'Invitation could not be generated. Check your connection and try again.', true);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
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
      async function saveAccess(approveNow = false, button = save) {
        let approvedLevels = [...levelsBox.querySelectorAll('input:checked')].map(input => input.value);
        if (approveNow) {
          // If the admin has not selected levels manually, grant the standard levels for the chosen plan.
          if (!approvedLevels.length) {
            const planLevels = {
              beginner: ['Beginner-1', 'Beginner-2', 'Beginner-3'],
              elementary: ['Elementary-1', 'Elementary-2', 'Elementary-3'],
              all_lessons: LESSON_LEVELS
            };
            approvedLevels = [...(planLevels[plan.value] || planLevels.beginner)];
            levelsBox.querySelectorAll('input').forEach(input => { input.checked = approvedLevels.includes(input.value); });
          }
          status.value = 'approved';
          pill.textContent = 'approved';
          if (!payment.checked) {
            setMessage(document.getElementById('access-message'), 'Confirm the payment checkbox before approving ' + (user.email || 'this user') + '.', true);
            return;
          }
        }
        if (status.value === 'approved' && !payment.checked) {
          setMessage(document.getElementById('access-message'), 'Confirm the payment before approving ' + (user.email || 'this user') + '.', true);
          return;
        }
        if (status.value === 'approved' && !approvedLevels.length) {
          setMessage(document.getElementById('access-message'), 'Choose at least one lesson level before approving access.', true);
          return;
        }
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = approveNow ? 'Approving…' : 'Saving…';
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
        button.disabled = false;
        button.textContent = originalText;
        if (saveError) {
          setMessage(document.getElementById('access-message'), saveError.message, true);
          return;
        }
        setMessage(document.getElementById('access-message'), (approveNow ? 'Approved access for ' : 'Saved access settings for ') + (user.email || user.user_id) + '.');
        await loadAdminAccess();
      }
      save.addEventListener('click', () => saveAccess(false, save));
      actionCell.appendChild(save);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button-danger';
      remove.style.marginTop = '.4rem';
      remove.textContent = 'Delete user';
      remove.addEventListener('click', () => deleteAdminUser(user.user_id, user.email, remove));
      actionCell.appendChild(remove);
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
  document.getElementById('accounts-refresh-btn')?.addEventListener('click', loadAdminAccounts);
  document.getElementById('ratings-refresh-btn')?.addEventListener('click', loadAdminRatings);
  document.getElementById('admin-create-invite-btn')?.addEventListener('click', createAdminInvite);
  document.getElementById('admin-invite-role')?.addEventListener('change', event => {
    const isStudent = event.target.value === 'student';
    const levels = document.getElementById('admin-student-levels');
    const teacherOwner = document.getElementById('admin-invite-teacher-owner');
    if (levels) levels.classList.toggle('hidden', !isStudent);
    if (teacherOwner) teacherOwner.classList.toggle('hidden', !isStudent);
  });
  void loadInviteTeachers();
  document.getElementById('create-invite-btn')?.addEventListener('click', createTeacherInvite);
  document.getElementById('refresh-students-btn')?.addEventListener('click', loadTeacherStudents);
  document.getElementById('teacher-student-search')?.addEventListener('input', renderTeacherStudents);
  document.getElementById('teacher-student-level')?.addEventListener('change', renderTeacherStudents);
  document.getElementById('schedule-add-form')?.addEventListener('submit', addTeacherScheduleEntry);
  document.getElementById('schedule-refresh-btn')?.addEventListener('click', loadTeacherSchedule);
  client.auth.onAuthStateChange(() => { void renderSession(); });
  void renderSession();
})();