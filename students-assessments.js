(() => {
const URL='https://dtgspwsxwslntlayqcbe.supabase.co', KEY='sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);let role='',students=[],ratings=[],names={};
function message(t,err=false){$('status').textContent=t||'';$('status').className='message '+(err?'error':'');}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
async function load(){
 message('Loading students and ratings…');
 const studentCall=role==='admin'?db.rpc('admin_list_all_students'):db.rpc('teacher_list_linked_students');
 const [sr,rr]=await Promise.all([studentCall,db.rpc('teacher_list_linked_student_ratings')]);
 if(sr.error){message('Could not load students: '+sr.error.message,true);return;}
 const raw=sr.data||[];
 students=role==='admin'?(Array.isArray(raw)?raw:[]):(Array.isArray(raw)?raw:[]).map(s=>({id:s.student_id,name:s.full_name,email:s.email,phone:'',created_at:s.joined_at,teacher:null,levels:s.levels||[]}));
 ratings=Array.isArray(rr.data)?rr.data:[];
 if(rr.error){message('Students loaded, but rating history could not be loaded: '+rr.error.message,true);}else message('Loaded '+students.length+' student account(s).');
 students.forEach(s=>{names[s.id]=s.name||s.full_name||s.email||'Student';(s.ratings||[]).forEach(r=>ratings.push({...r,student_id:s.id}));});
 renderStudents();renderRatings();
}
function renderStudents(){
 const host=$('students');host.replaceChildren();const q=$('search').value.trim().toLowerCase();
 const list=students.filter(s=>[s.name,s.full_name,s.email,s.phone].some(v=>String(v||'').toLowerCase().includes(q)));
 if(!list.length){host.append(el('p',students.length?'No students match your search.':'No students are connected yet.'));return;}
 list.forEach(s=>{
  const card=el('article',undefined,'student-card'),head=el('div',undefined,'student-head'),identity=el('div');
  identity.append(el('h3',s.name||s.full_name||'Student'),el('p',s.email||'Email unavailable','muted'));
  if(s.phone)identity.append(el('p',s.phone,'muted'));
  if(role==='admin'&&s.teacher)identity.append(el('p','Assigned to: '+(s.teacher.name||s.teacher.email||'Teacher'),'muted'));
  if(Array.isArray(s.levels)&&s.levels.length)identity.append(el('p','Lesson access: '+s.levels.join(', '),'muted'));
  head.append(identity,el('span','Joined '+(s.created_at?new Date(s.created_at).toLocaleDateString():'—'),'muted'));card.append(head);
  const form=el('form',undefined,'grid');form.style.marginTop='14px';
  const skillLabel=el('label','Skill','field'),skill=document.createElement('select');[['reading','Reading'],['speaking','Speaking'],['writing','Writing'],['listening','Listening']].forEach(([v,t])=>skill.add(new Option(t,v)));skillLabel.append(skill);
  const scoreLabel=el('label','Rating (0–100)','field'),score=document.createElement('input');score.type='number';score.min='0';score.max='100';score.required=true;score.value='';score.placeholder='e.g. 85';scoreLabel.append(score);
  const noteLabel=el('label','Assessment note (optional)','field'),note=document.createElement('input');note.maxLength=1000;note.placeholder='Feedback or next steps';noteLabel.append(note);
  const save=el('button','Save assessment','button primary');save.type='submit';form.append(skillLabel,scoreLabel,noteLabel,save);
  const result=el('p','');form.addEventListener('submit',async e=>{e.preventDefault();const val=Number(score.value);if(!Number.isFinite(val)||val<0||val>100){result.textContent='Enter a score from 0 to 100.';return;}save.disabled=true;save.textContent='Saving…';
   const {error}=await db.rpc('teacher_save_student_rating',{p_student_id:s.id||s.student_id,p_skill:skill.value,p_rating:val,p_note:note.value.trim()});
   save.disabled=false;save.textContent='Save assessment';if(error){result.textContent='Save failed: '+error.message;result.className='error';return;}result.textContent='Assessment saved.';result.className='';await load();
  });card.append(form,result);
  const studentRatings=ratings.filter(r=>r.student_id===(s.id||s.student_id));
  const h=el('div',undefined,'history');if(studentRatings.length){h.append(el('strong','Recent ratings: '));h.append(document.createTextNode(studentRatings.slice(0,5).map(r=>(r.skill||'').toString().replace(/^./,c=>c.toUpperCase())+' '+r.rating+'/100').join(' · ')));}else h.append(el('p','No ratings recorded yet.'));card.append(h);host.append(card);
 });
}
function renderRatings(){
 const body=$('history');body.replaceChildren();const rows=[...ratings].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,100);
 if(!rows.length){body.append(el('tr'));body.firstChild.append(el('td','No assessment history yet.'));body.firstChild.firstChild.colSpan=5;return;}
 rows.forEach(r=>{const tr=el('tr');[names[r.student_id]||'Student',(r.skill||'').toString().replace(/^./,c=>c.toUpperCase()),String(r.rating??'—'),r.note||'—',r.created_at?new Date(r.created_at).toLocaleString():'—'].forEach(v=>tr.append(el('td',v)));body.append(tr);});
}
async function session(){
 const {data:{session}}=await db.auth.getSession();if(!session){$('auth-panel').classList.remove('hidden');$('content').classList.add('hidden');$('logout').classList.add('hidden');return;}
 const {data:p,error}=await db.from('profiles').select('role,name').eq('id',session.user.id).maybeSingle();
 if(error||!p||!['teacher','admin'].includes(p.role)){await db.auth.signOut();$('auth-panel').classList.remove('hidden');$('content').classList.add('hidden');message('Teacher or administrator access is required.',true);return;}
 role=p.role;$('page-title').textContent=role==='admin'?'All Students — Assessments':'My Students — Assessments';$('session-email').textContent=session.user.email||'';$('auth-panel').classList.add('hidden');$('content').classList.remove('hidden');await load();
}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){$('auth-message').textContent=error.message;return;}await session();});
$('logout').addEventListener('click',async()=>{await db.auth.signOut();await session();});
$('search').addEventListener('input',renderStudents);$('refresh').addEventListener('click',load);db.auth.onAuthStateChange(()=>{void session();});void session();
})();