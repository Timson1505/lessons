(() => {
  const $ = id => document.getElementById(id);
  const number = value => Number(value || 0).toLocaleString();
  const set = (id, value) => { const el=$(id); if(el) el.textContent=value; };
  const showMessage = (message, error=false) => { const el=$('analytics-message'); if(el){el.textContent=message;el.classList.toggle('error',error);} };
  const renderBars = (id, rows, labelKey, valueKey) => {
    const host=$(id); if(!host)return; host.replaceChildren();
    if(!rows.length){host.textContent='No records available yet.';return;}
    const max=Math.max(1,...rows.map(r=>Number(r[valueKey]||0)));
    rows.forEach(row=>{
      const line=document.createElement('div');line.className='analytics-bar-row';
      const label=document.createElement('span');label.textContent=String(row[labelKey]);
      const track=document.createElement('div');track.className='analytics-bar-track';
      const fill=document.createElement('div');fill.className='analytics-bar-fill';fill.style.width=(Number(row[valueKey]||0)/max*100)+'%';track.appendChild(fill);
      const value=document.createElement('strong');value.textContent=number(row[valueKey]);
      line.append(label,track,value);host.appendChild(line);
    });
  };
  async function load(){
    const db=window.TimsonsSupabase;if(!db){showMessage('Supabase client is not ready. Reload after signing in.',true);return;}
    const button=$('analytics-refresh');if(button){button.disabled=true;button.textContent='Loading…';}
    showMessage('Refreshing analytics from Supabase…');
    try{
      const [profiles,links,access,progress,ratings,schedule]=await Promise.all([
        db.from('profiles').select('id,role,created_at').in('role',['student','teacher']).limit(2000),
        db.from('teacher_students').select('teacher_id,student_id,created_at').limit(2000),
        db.from('lesson_access_requests').select('status,payment_confirmed,requested_at,requested_plan').limit(2000),
        db.from('student_lesson_progress').select('level_slug,completed_at').limit(5000),
        db.from('student_ratings').select('rating,skill,rated_by,created_at').limit(5000),
        db.from('teacher_schedule_entries').select('teacher_id,id').limit(2000)
      ]);
      const failed=[profiles,links,access,progress,ratings,schedule].filter(r=>r.error);
      if(failed.length) throw new Error(failed.map(r=>r.error.message).join(' | '));
      const profileRows=profiles.data||[],linkRows=links.data||[],accessRows=access.data||[],progressRows=progress.data||[],ratingRows=ratings.data||[],scheduleRows=schedule.data||[];
      const linkedStudents=new Set(linkRows.map(r=>r.student_id).filter(Boolean));
      const linkedTeachers=new Set(linkRows.map(r=>r.teacher_id).filter(Boolean));
      set('analytics-students',number(linkedStudents.size));
      set('analytics-teachers',number(linkedTeachers.size));
      set('analytics-paid',number(accessRows.filter(r=>r.payment_confirmed).length));
      set('analytics-completions',number(progressRows.length));
      set('analytics-requests',number(accessRows.length));
      set('analytics-pending',number(accessRows.filter(r=>r.status==='pending').length));
      set('analytics-approved',number(accessRows.filter(r=>r.status==='approved').length));
      set('analytics-revenue','Not available');
      const months=[];const now=new Date();
      for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),label:d.toLocaleDateString(undefined,{month:'short'}),students:0,teachers:0});}
      profileRows.forEach(p=>{if(!p.created_at)return;const key=String(p.created_at).slice(0,7),m=months.find(x=>x.key===key);if(m&&p.role==='student')m.students++;if(m&&p.role==='teacher')m.teachers++;});
      renderBars('analytics-registration-chart',months.map(m=>({label:m.label+' · S',value:m.students})).concat(months.map(m=>({label:m.label+' · T',value:m.teachers})), 'label','value');
      const levels=new Map();progressRows.forEach(r=>{const key=r.level_slug||'Unassigned';levels.set(key,(levels.get(key)||0)+1);});
      renderBars('analytics-lessons-chart',[...levels].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value),'label','value');
      const skills=['writing','reading','listening','speaking'].map(skill=>{const values=ratingRows.filter(r=>r.skill===skill).map(r=>Number(r.rating)).filter(Number.isFinite);return {label:skill.charAt(0).toUpperCase()+skill.slice(1),value:values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0};});
      renderBars('analytics-skills',skills,'label','value');
      const teacherIds=[...new Set(ratingRows.map(r=>r.rated_by).filter(Boolean))];
      const teacherProfiles=teacherIds.length?await db.from('profiles').select('id,name').in('id',teacherIds):{data:[],error:null};
      if(teacherProfiles.error)throw teacherProfiles.error;
      const teacherNames=new Map((teacherProfiles.data||[]).map(p=>[p.id,p.name||'Teacher']));
      const tbody=$('analytics-teacher-performance');if(tbody){tbody.replaceChildren();const byTeacher=new Map();ratingRows.forEach(r=>{if(!r.rated_by)return;const a=byTeacher.get(r.rated_by)||[];a.push(Number(r.rating));byTeacher.set(r.rated_by,a);});
        const rows=[...byTeacher].map(([id,values])=>({name:teacherNames.get(id)||'Teacher',count:values.length,avg:Math.round(values.reduce((a,b)=>a+b,0)/values.length)})).sort((a,b)=>b.count-a.count);
        if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='No teacher assessments recorded yet.';tr.appendChild(td);tbody.appendChild(tr);}
        rows.forEach(r=>{const tr=document.createElement('tr');[r.name,number(r.count),r.avg+'/100'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td);});tbody.appendChild(tr);});
      }
      const scheduleNote=scheduleRows.length+' schedule entries included in source data. ';
      showMessage('Analytics updated. '+scheduleNote+'Monthly revenue is intentionally not estimated because payment amounts are not stored.');
    }catch(error){showMessage('Analytics could not be fully loaded: '+(error?.message||error),true);}
    finally{if(button){button.disabled=false;button.textContent='Refresh analytics';}}
  }
  window.addEventListener('timsons:role-ready',event=>{if(event.detail?.role==='admin')void load();});
  document.addEventListener('DOMContentLoaded',()=>{ $('analytics-refresh')?.addEventListener('click',load); });
})();