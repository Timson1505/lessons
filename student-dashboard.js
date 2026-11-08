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


  const LEVEL_CATALOG = {
    'Beginner-1':10,'Beginner-2':12,'Beginner-3':10,
    'Elementary-1':11,'Elementary-2':12,'Elementary-3':12
  };
  const SKILLS = ['writing','reading','speaking','listening'];
  const titleCase = value => String(value||'').replace(/^./,c=>c.toUpperCase());
  function renderSkillChart(ratings) {
    const host=document.getElementById('chart-container');
    const latest={};
    ratings.forEach(r=>{if(SKILLS.includes(r.skill)&&!latest[r.skill])latest[r.skill]=r;});
    const width=760,left=125,right=72,top=30,row=66,plotW=width-left-right,height=top+row*4+34;
    let svg='<svg class="skill-chart" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Latest ratings for Writing, Reading, Speaking and Listening">';
    [0,25,50,75,100].forEach(v=>{const x=left+plotW*v/100;svg+='<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+row*4-12)+'" stroke="#e2e6ef"/><text x="'+x+'" y="'+(height-8)+'" text-anchor="middle" fill="#667085" font-size="12">'+v+'</text>';});
    SKILLS.forEach((skill,i)=>{const y=top+i*row,r=latest[skill],value=r?Math.max(0,Math.min(100,Number(r.rating)||0)):0;svg+='<text x="'+(left-12)+'" y="'+(y+22)+'" text-anchor="end" fill="#344054" font-size="14">'+titleCase(skill)+'</text><rect x="'+left+'" y="'+y+'" width="'+plotW+'" height="28" rx="7" fill="#f0f2f8"/>';if(r)svg+='<rect x="'+left+'" y="'+y+'" width="'+(plotW*value/100)+'" height="28" rx="7" fill="#5865d8"/><text x="'+(left+plotW*value/100+8)+'" y="'+(y+19)+'" fill="#344054" font-size="12">'+value+'/100</text>';else svg+='<text x="'+(left+9)+'" y="'+(y+19)+'" fill="#667085" font-size="12">Not rated yet</text>';});
    svg+='</svg>';host.innerHTML=svg;
  }
  function renderLevelProgress(levels,progress) {
    const host=document.getElementById('level-progress-list');
    const allowed=[...new Set((levels||[]).filter(level=>Object.prototype.hasOwnProperty.call(LEVEL_CATALOG,level)))];
    if(!allowed.length){host.innerHTML='<p class="empty-state">No lesson levels have been assigned to your account yet. Your teacher or administrator can grant access.</p>';document.getElementById('overall-completion').textContent='—';return;}
    const completedSet=new Set((progress||[]).map(p=>p.lesson_path));
    let totalLessons=0,totalCompleted=0;host.replaceChildren();
    allowed.forEach(level=>{
      const total=LEVEL_CATALOG[level],done=[...completedSet].filter(path=>path.startsWith(level+'/')||path.startsWith('/'+level+'/')).length;
      const safeDone=Math.min(done,total),pct=Math.round(safeDone/total*100);totalLessons+=total;totalCompleted+=safeDone;
      const item=document.createElement('article');item.className='level-progress-item';
      const head=document.createElement('div');head.className='level-progress-head';
      const name=document.createElement('strong');name.textContent=level.replace(/-/g,' ');
      const count=document.createElement('span');count.textContent=safeDone+' / '+total+' lessons · '+pct+'%';
      head.append(name,count);
      const track=document.createElement('div');track.className='progress-track';track.setAttribute('role','progressbar');track.setAttribute('aria-valuenow',String(pct));track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
      const fill=document.createElement('span');fill.style.width=pct+'%';track.append(fill);item.append(head,track);host.append(item);
    });
    document.getElementById('overall-completion').textContent=totalLessons?Math.round(totalCompleted/totalLessons*100)+'%':'0%';
  }
  function renderWeeklyStats(ratings,progress) {
    const since=Date.now()-7*24*60*60*1000;
    const weeklyLessons=(progress||[]).filter(p=>new Date(p.completed_at)>=new Date(since)).length;
    const weeklyRatings=(ratings||[]).filter(r=>new Date(r.created_at)>=new Date(since));
    const average=weeklyRatings.length?Math.round(weeklyRatings.reduce((sum,r)=>sum+Number(r.rating||0),0)/weeklyRatings.length):null;
    document.getElementById('weekly-lessons').textContent=String(weeklyLessons);
    document.getElementById('weekly-assessments').textContent=String(weeklyRatings.length);
    document.getElementById('weekly-average').textContent=average===null?'—':average+'/100';
  }
  function renderRecommendations(ratings) {
    const host=document.getElementById('recommendations-list');host.replaceChildren();
    const latest={};(ratings||[]).forEach(r=>{if(SKILLS.includes(r.skill)&&!latest[r.skill])latest[r.skill]=r;});
    const weak=Object.values(latest).filter(r=>Number(r.rating)<70);
    const noted=Object.values(latest).filter(r=>r.note&&r.note.trim());
    const recommendations=[];
    weak.forEach(r=>recommendations.push({title:'Review '+titleCase(r.skill),body:'Your latest result is '+Math.round(Number(r.rating))+'/100. Repeat the related lesson exercises and practise this skill before the next assessment.'}));
    noted.forEach(r=>recommendations.push({title:titleCase(r.skill)+' — teacher feedback',body:r.note}));
    if(!recommendations.length){const empty=document.createElement('p');empty.className='empty-state';empty.textContent=Object.keys(latest).length?'Your latest results are on track. Keep practising regularly and complete the next lesson.':'Recommendations will appear after your first skill assessment.';host.append(empty);return;}
    recommendations.forEach(rec=>{const card=document.createElement('article');card.className='recommendation-item';const title=document.createElement('strong');title.textContent=rec.title;const body=document.createElement('p');body.textContent=rec.body;card.append(title,body);host.append(card);});
  }
  async function loadDashboard(userId) {
    const [{data,error},{data:progressData,error:progressError}]=await Promise.all([
      client.rpc('get_student_dashboard'),
      client.from('student_lesson_progress').select('level_slug,lesson_path,completed_at').eq('student_id',userId).order('completed_at',{ascending:false})
    ]);
    if(error){msg(document.getElementById('auth-message'),error.message,true);return;}
    if(progressError){console.error('Lesson progress could not be loaded:',progressError.message);}
    const info=Array.isArray(data)?data[0]:data,teacher=document.getElementById('teacher-details');
    if(info.teacher){teacher.replaceChildren();const box=document.createElement('div');box.className='teacher-card';const avatar=document.createElement('div');avatar.className='teacher-avatar';avatar.textContent='♟';const detail=document.createElement('div');const name=document.createElement('strong');name.textContent=info.teacher.name||'Your teacher';const email=document.createElement('p');email.className='muted';email.textContent=info.teacher.email||'';detail.append(name,email);box.append(avatar,detail);teacher.append(box);}
    else teacher.textContent='No teacher has been assigned yet. Contact the administrator or use your teacher’s invitation link.';
    const levels=Array.isArray(info.access?.levels)?info.access.levels:[];
    const accessBox=document.getElementById('access-summary');accessBox.replaceChildren();
    if(levels.length){const heading=document.createElement('p');heading.textContent='Available levels';const ul=document.createElement('ul');ul.className='level-list';levels.forEach(level=>{const li=document.createElement('li');li.textContent=level.replace(/-/g,' ');ul.append(li);});accessBox.append(heading,ul);}
    else accessBox.textContent='No approved lesson levels are currently linked to your teacher. Ask your teacher or administrator to confirm your access.';
    const ratings=Array.isArray(info.ratings)?info.ratings:[];ratings.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    const progress=Array.isArray(progressData)?progressData:[];
    renderLevelProgress(levels,progress);renderWeeklyStats(ratings,progress);renderRecommendations(ratings);renderSkillChart(ratings);
    const latest=ratings[0],summary=document.getElementById('progress-summary');summary.replaceChildren();
    const metric=document.createElement('div');metric.className='metric';metric.textContent=latest?Math.round(Number(latest.rating))+'/100':'—';
    const sub=document.createElement('p');sub.className='muted';sub.textContent=latest?(latest.skill==='writing'&&latest.source==='auto'?'Automatically graded Writing':'Latest '+titleCase(latest.skill)+' rating')+' · '+new Date(latest.created_at).toLocaleDateString():'No ratings yet.';summary.append(metric,sub);
    const body=document.getElementById('rating-history-body');body.replaceChildren();
    if(!ratings.length)body.innerHTML='<tr><td colspan="4">No ratings yet. They will appear after an assessment.</td></tr>';
    else ratings.forEach(r=>{const tr=document.createElement('tr');[new Date(r.created_at).toLocaleDateString(),titleCase(r.skill),Math.round(Number(r.rating))+'/100',r.source==='auto'?'Auto-graded · '+(r.lesson_path||r.note||'Writing exercise'):(r.note||'—')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});body.append(tr);});
  }
  async function renderSession(){
    const {data:{session},error}=await client.auth.getSession();if(error||!session){signedOut(error?.message||'');return;}
    document.getElementById('session-email').textContent=session.user.email||'';logout.classList.remove('hidden');
    const {data:profile,error:profileError}=await client.from('profiles').select('id,name,role').eq('id',session.user.id).maybeSingle();
    if(profileError||profile?.role!=='student'){await client.auth.signOut();signedOut('This dashboard is only available to student accounts.');return;}
    const identityPhoto=document.getElementById('account-identity-photo'),identityName=document.getElementById('account-identity-name');if(identityPhoto)identityPhoto.src=session.user.user_metadata?.avatar_url||'https://placehold.co/80x80?text=User';if(identityName)identityName.textContent=profile.name||session.user.user_metadata?.full_name||session.user.email||'My account';
    authPanel.classList.add('hidden');dashboard.classList.remove('hidden');setupStudentProfile(profile,session.user);setupStudentInvite();await loadDashboard(session.user.id);
  }
  document.getElementById('login-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const {error}=await client.auth.signInWithPassword({email:form.email.value.trim(),password:form.password.value});if(error){msg(authMessage,error.message,true);return;}await renderSession();});
  logout.addEventListener('click',async()=>{await client.auth.signOut();signedOut('You have signed out.');});
  document.getElementById('refresh-dashboard').addEventListener('click',loadDashboard);renderSession();
});