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

  
  function setupStudentProfile(profile,user){
    const input=document.getElementById('student-name-input'),phone=document.getElementById('student-phone-input'),avatar=document.getElementById('student-avatar'),message=document.getElementById('student-profile-message');
    if(!avatar)return;input.value=profile.name||user.user_metadata?.full_name||'';if(phone)phone.value=profile.phone||'';
    const defaultPhoto='https://placehold.co/120x120?text=Photo';if(user.user_metadata?.avatar_url)avatar.src=user.user_metadata.avatar_url;
    document.getElementById('student-save-profile')?.addEventListener('click',async()=>{
      const name=input.value.trim();if(!name){msg(message,'Please enter your name.',true);return;}
      const {error}=await client.from('profiles').update({name,phone:phone?.value.trim()||null}).eq('id',user.id);
      if(error){msg(message,error.message,true);return;}const identityName=document.getElementById('account-identity-name');if(identityName)identityName.textContent=name;msg(message,'Profile information saved.');
      const title=document.querySelector('.welcome h1');if(title)title.textContent='Welcome, '+name;
    });
    document.getElementById('student-avatar-input')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2097152){msg(message,'Choose JPG, PNG or WebP up to 2 MB.',true);e.target.value='';return;}
      msg(message,'Uploading photo…');const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg',path=user.id+'/profile-'+Date.now()+'.'+ext;
      const {error}=await client.storage.from('profile-photos').upload(path,file,{upsert:true,contentType:file.type});
      if(error){msg(message,error.message,true);return;}const {data}=client.storage.from('profile-photos').getPublicUrl(path);
      const {error:updateError}=await client.auth.updateUser({data:{avatar_url:data.publicUrl}});
      if(updateError){msg(message,updateError.message,true);return;}avatar.src=data.publicUrl;const identityPhoto=document.getElementById('account-identity-photo');if(identityPhoto)identityPhoto.src=data.publicUrl;msg(message,'Profile photo updated.');
    });
    document.getElementById('student-remove-avatar')?.addEventListener('click',async()=>{
      const url=user.user_metadata?.avatar_url;if(!url){avatar.src=defaultPhoto;msg(message,'No profile photo to remove.');return;}
      if(!confirm('Remove your profile photo?'))return;
      const marker='/storage/v1/object/public/profile-photos/',idx=url.indexOf(marker);
      if(idx>=0)await client.storage.from('profile-photos').remove([url.slice(idx+marker.length).split('?')[0]]);
      const {error}=await client.auth.updateUser({data:{avatar_url:null}});
      if(error){msg(message,error.message,true);return;}user.user_metadata.avatar_url=null;avatar.src=defaultPhoto;const identityPhoto=document.getElementById('account-identity-photo');if(identityPhoto)identityPhoto.src='https://placehold.co/80x80?text=User';msg(message,'Profile photo removed.');
    });
  }
  function setupStudentInvite(){
    const input=document.getElementById('student-invite-link');if(!input)return;
    input.value=new URL('account.html#signup',window.location.href).href;
    document.getElementById('student-copy-invite')?.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(input.value);msg(document.getElementById('student-invite-message'),'Invitation link copied.');}
      catch(_){input.focus();input.select();msg(document.getElementById('student-invite-message'),'Select the link and copy it.');}
    });
  }

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
    const levels=['Beginner-1','Beginner-2','Beginner-3','Elementary-1','Elementary-2','Elementary-3','Intermediate','Upper-Intermediate','Advanced'],accessBox=document.getElementById('access-summary');
    if(levels.length){accessBox.replaceChildren();const heading=document.createElement('p');heading.innerHTML='<strong>Available levels</strong>';const ul=document.createElement('ul');ul.className='level-list';levels.forEach(l=>{const li=document.createElement('li');li.textContent=l;ul.append(li);});accessBox.append(heading,ul);}
    else accessBox.textContent='Students have full access to all lesson levels.';
    const ratings=info.ratings||[];ratings.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));await renderChart(ratings);
    const latest=ratings[0],summary=document.getElementById('progress-summary');summary.replaceChildren();const metric=document.createElement('div');metric.className='metric';metric.textContent=latest?Number(latest.rating).toFixed(0)+'/100':'—';const sub=document.createElement('p');sub.className='muted';sub.textContent=latest?(latest.skill==='writing'&&latest.source==='auto'?'Automatically graded Writing':'Latest '+latest.skill+' rating')+' · '+new Date(latest.created_at).toLocaleDateString():'No ratings yet.';summary.append(metric,sub);
    const body=document.getElementById('rating-history-body');body.replaceChildren();
    if(!ratings.length)body.innerHTML='<tr><td colspan="4">No ratings yet. They will appear after your teacher assesses your work.</td></tr>';
    else ratings.forEach(r=>{const tr=document.createElement('tr');[new Date(r.created_at).toLocaleDateString(),r.skill,Number(r.rating).toFixed(0)+'/100',r.source==='auto'?'Auto-graded · '+(r.lesson_path||r.note||'Writing exercise'):(r.note||'—')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});body.append(tr);});
    msg(document.getElementById('student-message'),'Dashboard updated. Full lesson access is included with student accounts.');
  }
  async function renderSession(){
    const {data:{session},error}=await client.auth.getSession();if(error||!session){signedOut(error?.message||'');return;}
    document.getElementById('session-email').textContent=session.user.email||'';logout.classList.remove('hidden');
    const {data:profile,error:profileError}=await client.from('profiles').select('id,name,role').eq('id',session.user.id).maybeSingle();
    if(profileError||profile?.role!=='student'){await client.auth.signOut();signedOut('This dashboard is only available to student accounts.');return;}
    const identityPhoto=document.getElementById('account-identity-photo'),identityName=document.getElementById('account-identity-name');if(identityPhoto)identityPhoto.src=session.user.user_metadata?.avatar_url||'https://placehold.co/80x80?text=User';if(identityName)identityName.textContent=profile.name||session.user.user_metadata?.full_name||session.user.email||'My account';
    authPanel.classList.add('hidden');dashboard.classList.remove('hidden');setupStudentProfile(profile,session.user);setupStudentInvite();await loadDashboard();
  }
  document.getElementById('login-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const {error}=await client.auth.signInWithPassword({email:form.email.value.trim(),password:form.password.value});if(error){msg(authMessage,error.message,true);return;}await renderSession();});
  logout.addEventListener('click',async()=>{await client.auth.signOut();signedOut('You have signed out.');});
  document.getElementById('refresh-dashboard').addEventListener('click',loadDashboard);renderSession();
});