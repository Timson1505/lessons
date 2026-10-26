/* Admin-only manual student assignment. Authorization is enforced again in the Supabase RPC. */
(() => {
  const URL = 'https://dtgspwsxwslntlayqcbe.supabase.co';
  const KEY = 'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';
  const client = window.supabase.createClient(URL, KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const $ = id => document.getElementById(id);
  let accounts = [];
  let connections = {};
  const msg = (id, text, error=false) => { const el=$(id); el.textContent=text||''; el.className='message'+(text?(error?' error':' success'):''); };
  function renderAccounts(){
    const term = $('search').value.trim().toLocaleLowerCase();
    const rows = accounts.filter(a => [a.full_name,a.email,a.role].some(v=>String(v||'').toLocaleLowerCase().includes(term)));
    const body=$('accounts'); body.replaceChildren();
    if(!rows.length){body.innerHTML='<tr><td colspan="5">No matching accounts.</td></tr>';return;}
    rows.forEach(a=>{
      const tr=document.createElement('tr');
      [a.full_name||'—',a.email||'—',a.role||'—',connections[a.user_id]||'Not connected',a.created_at?new Date(a.created_at).toLocaleDateString():'—'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td);});
      body.appendChild(tr);
    });
  }
  async function load(){
    msg('assignment-message','Loading accounts…');
    const {data,error}=await client.rpc('admin_list_all_accounts');
    if(error){msg('assignment-message','Could not load accounts: '+error.message,true);return;}
    accounts=Array.isArray(data)?data:[];
    const teachers=accounts.filter(a=>a.role==='teacher');
    const students=accounts.filter(a=>['student','user'].includes(a.role));
    const studentSelect=$('student'),teacherSelect=$('teacher');
    studentSelect.replaceChildren(new Option('Choose a student…',''));
    students.forEach(a=>studentSelect.add(new Option((a.full_name||'Unnamed student')+' — '+(a.email||a.user_id),a.user_id)));
    teacherSelect.replaceChildren(new Option('Choose a teacher…',''));
    teachers.forEach(a=>teacherSelect.add(new Option((a.full_name||'Unnamed teacher')+' — '+(a.email||a.user_id),a.user_id)));
    if(!teachers.length) msg('assignment-message','No teacher accounts found. Assign the teacher role first.',true);
    else if(!students.length) msg('assignment-message','No accounts with Student or User role are available to assign.');
    else msg('assignment-message','Accounts loaded. Choose a student and a teacher.');
    await loadConnections();
    renderAccounts();
  }
  async function loadConnections(){
    // The admin-only RPC returns all accounts. This RPC returns only linked students for the current teacher,
    // so connection labels are loaded through a dedicated admin-only SQL function if available.
    const {data,error}=await client.rpc('admin_list_student_teacher_connections');
    if(!error && Array.isArray(data)){
      connections={};
      data.forEach(row=>{const teacher=accounts.find(a=>a.user_id===row.teacher_id);connections[row.student_id]=teacher?(teacher.full_name||teacher.email||'Assigned teacher'):'Assigned teacher';});
    } else {
      // Don't expose or query teacher_students directly from the public client without a policy.
      connections={};
    }
  }
  async function session(){
    const {data:{session}}=await client.auth.getSession();
    if(!session){$('login-panel').classList.remove('hidden');$('admin-panel').classList.add('hidden');$('logout').classList.add('hidden');return;}
    const {data:profile,error}=await client.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
    if(error||profile?.role!=='admin'){await client.auth.signOut();$('login-panel').classList.remove('hidden');$('admin-panel').classList.add('hidden');$('logout').classList.add('hidden');msg('login-message','Administrator access required.',true);return;}
    $('login-panel').classList.add('hidden');$('admin-panel').classList.remove('hidden');$('logout').classList.remove('hidden');await load();
  }
  $('login-form').addEventListener('submit',async e=>{e.preventDefault();const {error}=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){msg('login-message',error.message,true);return;}msg('login-message','');await session();});
  $('logout').addEventListener('click',async()=>{await client.auth.signOut();await session();});
  $('search').addEventListener('input',renderAccounts);
  $('connect').addEventListener('click',async()=>{
    const studentId=$('student').value,teacherId=$('teacher').value;
    if(!studentId||!teacherId){msg('assignment-message','Select both a student and a teacher.',true);return;}
    if(studentId===teacherId){msg('assignment-message','A student cannot be their own teacher.',true);return;}
    const student=accounts.find(a=>a.user_id===studentId),teacher=accounts.find(a=>a.user_id===teacherId);
    const previous=connections[studentId];
    const prompt=previous&&previous!=='Not connected'?'This student is currently connected to '+previous+'. Reassign to '+(teacher.full_name||teacher.email)+'?':'Connect '+(student.full_name||student.email)+' to '+(teacher.full_name||teacher.email)+'?';
    if(!window.confirm(prompt))return;
    const button=$('connect');button.disabled=true;button.textContent='Connecting…';
    const {data,error}=await client.rpc('admin_assign_student_to_teacher',{p_student_id:studentId,p_teacher_id:teacherId});
    button.disabled=false;button.textContent='Connect student to teacher';
    if(error){msg('assignment-message','Assignment failed: '+error.message,true);return;}
    msg('assignment-message','Student successfully connected to the selected teacher.');
    await load();
  });
  client.auth.onAuthStateChange(()=>{void session();});
  void session();
})();