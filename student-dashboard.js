const STUDENT_SUPABASE_URL = 'https://dtgspwsxwslntlayqcbe.supabase.co';
const STUDENT_SUPABASE_KEY = 'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const { createClient } = window.supabase || {};
  const authPanel = document.getElementById('auth-panel'), dashboard = document.getElementById('dashboard-panel');
  const authMessage = document.getElementById('auth-message'), logout = document.getElementById('logout-btn');
  if (!createClient) { authMessage.textContent = 'Account service could not load. Refresh the page.'; return; }
  const client = createClient(STUDENT_SUPABASE_URL, STUDENT_SUPABASE_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const msg = (el,text,error=false) => { el.textContent=text||''; el.classList.toggle('error',!!error); el.classList.toggle('success',!!text&&!error); };
  function signedOut(text='') { authPanel.classList.remove('hidden'); dashboard.classList.add('hidden'); logout.classList.add('hidden'); msg(authMessage,text,!!text); }
  async function renderChart(ratings) {
    const skills = ['writing','speaking','reading'], latest = {};
    ratings.forEach(r => { if (skills.includes(r.skill) && !latest[r.skill]) latest[r.skill]=r; });
    if (skills.every(s=>!latest[s])) { document.getElementById('chart-container').innerHTML='<p class="empty-state">No skill ratings yet. Your teacher will add them after assessing your work.</p>'; return; }
    const width=720,height=300,left=115,right=55,top=25,bottom=42,plotW=width-left-right,plotH=220;
    let svg='<svg class="skill-chart" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Latest skill ratings bar chart">';
    [0,25,50,75,100].forEach(v=>{const x=left+plotW*v/100;svg+='<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+plotH)+'" stroke="#e2e6ef"/><text x="'+x+'" y="'+(height-12)+'" text-anchor="middle" fill="#667085" font-size="12">'+v+'</text>';});
    skills.forEach((s,i)=>{const y=top+i*74+12,r=latest[s],val=r?Math.max(0,Math.min(100,Number(r.rating)||0)):0;svg+='<text x="'+(left-12)+'" y="'+(y+18)+'" text-anchor="end" fill="#344054" font-size="15">'+s[0].toUpperCase()+s.slice(1)+'</text><rect x="'+left+'" y="'+y+'" width="'+plotW+'" height="30" rx="7" fill="#f0f2f8"/>';if(r)svg+='<rect x="'+left+'" y="'+y+'" width="'+(plotW*val/100)+'" height="30" rx="7" fill="#5865d8"/><text x="'+(left+plotW*val/100+8)+'" y="'+(y+20)+'" fill="#344054" font-size="13">'+val+'/100</text>';else svg+='<text x="'+(left+8)+'" y="'+(y+20)+'" fill="#667085" font-size="13">Not rated yet</text>';});
    svg+='</svg>';document.getElementById('chart-container').innerHTML=svg;
  }
  async function loadDashboard() {
    const {data,error}=await client.rpc('get_student_dashboard');
    if(error){msg(document.getElementById('student-message'),error.message,true);return;}
    const info=Array.isArray(data)?data[0]:data, teacher=document.getElementById('teacher-details');
    if(info.teacher){teacher.replaceChildren();const box=document.createElement('div');box.className='teacher-card';const avatar=document.createElement('div');avatar.className='teacher-avatar';avatar.textContent='♟';const detail=document.createElement('div');const name=document.createElement('strong');name.textContent=info.teacher.name||'Your teacher';const email=document.createElement('p');email.className='muted';email.textContent=info.teacher.email||'';detail.append(name,email);box.append(avatar,detail);teacher.append(box);}
    else teacher.textContent='No teacher has been assigned yet. Contact the administrator or use your teacher’s invitation link.';
    const access=info.access||{},levels=Array.isArray(access.levels)?access.levels:[],accessBox=document.getElementById('access-summary');
    if(levels.length){accessBox.replaceChildren();const heading=document.createElement('p');heading.innerHTML='<strong>Available levels</strong>';const ul=document.createElement('ul');ul.className='level-list';levels.forEach(l=>{const li=document.createElement('li');li.textContent=l;ul.append(li);});accessBox.append(heading,ul);}
    else accessBox.textContent='Your teacher does not currently have an active approved subscription, or you have not been linked to a teacher yet.';
    const ratings=info.ratings||[];ratings.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));await renderChart(ratings);
    const latest=ratings[0],summary=document.getElementById('progress-summary');summary.replaceChildren();const metric=document.createElement('div');metric.className='metric';metric.textContent=latest?Number(latest.rating).toFixed(0)+'/100':'—';const sub=document.createElement('p');sub.className='muted';sub.textContent=latest?'Latest '+latest.skill+' rating · '+new Date(latest.created_at).toLocaleDateString():'No ratings yet.';summary.append(metric,sub);
    const body=document.getElementById('rating-history-body');body.replaceChildren();
    if(!ratings.length)body.innerHTML='<tr><td colspan="4">No ratings yet. They will appear after your teacher assesses your work.</td></tr>';
    else ratings.forEach(r=>{const tr=document.createElement('tr');[new Date(r.created_at).toLocaleDateString(),r.skill,Number(r.rating).toFixed(0)+'/100',r.note||'—'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});body.append(tr);});
    msg(document.getElementById('student-message'),'Dashboard updated.');
  }
  async function renderSession(){
    const {data:{session},error}=await client.auth.getSession();if(error||!session){signedOut(error?.message||'');return;}
    document.getElementById('session-email').textContent=session.user.email||'';logout.classList.remove('hidden');
    const {data:profile,error:profileError}=await client.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
    if(profileError||profile?.role!=='student'){await client.auth.signOut();signedOut('This dashboard is only available to student accounts.');return;}
    authPanel.classList.add('hidden');dashboard.classList.remove('hidden');await loadDashboard();
  }
  document.getElementById('login-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const {error}=await client.auth.signInWithPassword({email:form.email.value.trim(),password:form.password.value});if(error){msg(authMessage,error.message,true);return;}await renderSession();});
  logout.addEventListener('click',async()=>{await client.auth.signOut();signedOut('You have signed out.');});
  document.getElementById('refresh-dashboard').addEventListener('click',loadDashboard);renderSession();
});