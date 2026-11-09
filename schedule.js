(() => {
  "use strict";
  const root=document.getElementById("shared-schedule-root");
  if(!root||!window.supabase?.createClient)return;
  const client=window.supabase.createClient(
    "https://dtgspwsxwslntlayqcbe.supabase.co",
    "sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf",
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
  );
  const role=root.dataset.scheduleRole;
  const editable=role==="admin"||role==="teacher";
  const state={user:null,view:"week",anchor:new Date(),selected:new Date(),entries:[],teachers:[],students:[],links:[],profiles:[],editing:null};
  const pad=n=>String(n).padStart(2,"0");
  const key=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const dateOf=k=>new Date(k+"T12:00:00");
  const plusDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
  const monday=d=>{const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;};
  const same=(a,b)=>key(a)===key(b);
  const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const time=s=>String(s||"").slice(0,5);
  const niceTime=e=>time(e.start_time)+"–"+time(e.end_time);
  const profileName=id=>state.profiles.find(p=>p.id===id)?.name||"Teacher";
  const studentName=id=>state.students.find(p=>p.id===id)?.name||"Student";
  function message(text,error=false){const el=root.querySelector("#calendar-message");if(el){el.textContent=text;el.classList.toggle("error",error);el.classList.toggle("success",!!text&&!error);}}
  function dateTitle(d){return d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});}
  function periodTitle(){if(state.view==="month")return state.anchor.toLocaleDateString(undefined,{month:"long",year:"numeric"});const a=monday(state.anchor),b=plusDays(a,6);return a.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+b.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
  function inPeriod(date){if(state.view==="month")return date.getFullYear()===state.anchor.getFullYear()&&date.getMonth()===state.anchor.getMonth();const start=monday(state.anchor),end=plusDays(start,7);return date>=start&&date<end;}
  function periodEntries(d){return state.entries.filter(e=>e.scheduled_date===key(d)).sort((a,b)=>String(a.start_time).localeCompare(String(b.start_time)));}
  function eventLabel(e){const student=state.students.find(p=>p.id===e.student_id)?.name||e.student_name||"Lesson";return (time(e.start_time)?time(e.start_time)+" ":"")+(e.event_title||"English lesson")+" · "+student;}
  function render(){
    const days=state.view==="month"?monthDays():Array.from({length:7},(_,i)=>plusDays(monday(state.anchor),i));
    const grid=state.view==="month"
      ? '<div class="calendar-grid">'+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>'<div class="calendar-weekday">'+x+'</div>').join("")+days.map(d=>dayCell(d)).join("")+'</div>'
      : '<div class="calendar-week-grid">'+days.map(d=>weekCell(d)).join("")+'</div>';
    root.innerHTML=`<div class="shared-calendar">
      <div class="calendar-toolbar"><div class="calendar-controls"><button type="button" id="calendar-prev" class="calendar-nav-button" aria-label="Previous ${state.view}"><span aria-hidden="true">←</span><span>Previous</span></button><button type="button" id="calendar-today" class="calendar-today-button"><span aria-hidden="true">●</span><span>Today</span></button><button type="button" id="calendar-next" class="calendar-nav-button" aria-label="Next ${state.view}"><span>Next</span><span aria-hidden="true">→</span></button><strong class="calendar-period">${escape(periodTitle())}</strong></div>
      <div class="calendar-view-switch"><button type="button" id="calendar-refresh">Refresh</button><button type="button" data-view="week" class="${state.view==="week"?"active":""}">Week</button><button type="button" data-view="month" class="${state.view==="month"?"active":""}">Month</button></div></div>
      ${grid}
      <div class="calendar-lower"><section class="calendar-day-agenda"><h3>${escape(dateTitle(state.selected))}</h3><div id="calendar-agenda">${agendaHtml()}</div></section>
      ${editable?editorHtml():'<section class="calendar-editor"><h3>Lesson details</h3><p class="calendar-readonly">Your teacher or administrator manages your lesson schedule. Select a date to see your assigned lessons.</p></section>'}
      </div><p id="calendar-message" class="message" role="status"></p>
    </div>`;
    root.querySelector("#calendar-prev").addEventListener("click",()=>move(-1));
    root.querySelector("#calendar-next").addEventListener("click",()=>move(1));
    root.querySelector("#calendar-today").addEventListener("click",()=>{state.anchor=new Date();state.selected=new Date();render();});
    root.querySelector("#calendar-refresh").addEventListener("click",async()=>{try{await loadEntries();render();message("Calendar refreshed.");}catch(e){message(e.message,true);}});
    root.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;render();}));
    root.querySelectorAll("[data-date]").forEach(b=>b.addEventListener("click",()=>{state.selected=dateOf(b.dataset.date);if(state.view==="week"||(state.view==="month"&&state.selected.getMonth()!==state.anchor.getMonth()))state.anchor=new Date(state.selected);render();}));
    if(editable)wireEditor();
  }
  function move(n){if(state.view==="month")state.anchor=new Date(state.anchor.getFullYear(),state.anchor.getMonth()+n,1,12);else state.anchor=plusDays(state.anchor,n*7);render();}
  function monthDays(){const first=new Date(state.anchor.getFullYear(),state.anchor.getMonth(),1,12);const start=monday(first);return Array.from({length:42},(_,i)=>plusDays(start,i));}
  function dayCell(d){const events=periodEntries(d);return `<button type="button" class="calendar-day ${d.getMonth()!==state.anchor.getMonth()?"outside":""} ${same(d,state.selected)?"selected":""} ${same(d,new Date())?"today":""}" data-date="${key(d)}"><span class="calendar-day-number">${d.getDate()}</span>${events.slice(0,3).map(e=>'<span class="calendar-event '+escape(e.status)+'">'+escape(eventLabel(e))+'</span>').join("")}${events.length>3?'<span class="calendar-readonly">+'+(events.length-3)+' more</span>':""}</button>`;}
  function weekCell(d){return `<button type="button" class="calendar-week-day ${same(d,state.selected)?"selected":""} ${same(d,new Date())?"today":""}" data-date="${key(d)}"><h4>${escape(d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}))}</h4>${periodEntries(d).map(e=>'<span class="calendar-event '+escape(e.status)+'">'+escape(eventLabel(e))+'</span>').join("")||'<small class="calendar-readonly">No lessons</small>'}</button>`;}
  function agendaHtml(){const events=periodEntries(state.selected);if(!events.length)return '<p class="calendar-empty">No lessons scheduled for this day.</p>';return events.map(e=>`<div class="calendar-agenda-item"><div><strong>${escape(e.event_title||"English lesson")}</strong><small>${escape(niceTime(e))} · ${escape(state.students.find(p=>p.id===e.student_id)?.name||e.student_name||"Student")}${role==="admin"?" · "+escape(profileName(e.teacher_id)):""}</small><small>${escape(e.description||"")}</small></div>${editable?'<div><button type="button" class="button button-light" data-edit="'+e.id+'">Edit</button> <button type="button" class="button button-light" data-delete="'+e.id+'">Delete</button></div>':""}</div>`).join("");}
  function editorHtml(){return `<section class="calendar-editor"><h3 id="calendar-editor-title">${state.editing?"Edit lesson":"Add a lesson"}</h3><form id="calendar-form" class="calendar-form">
    ${role==="admin"?'<label class="wide">Teacher<select id="calendar-teacher" required><option value="">Choose teacher</option>'+state.teachers.map(t=>'<option value="'+t.id+'">'+escape(t.name||"Teacher")+'</option>').join("")+'</select></label>':""}
    <label class="wide">Student<select id="calendar-student" required><option value="">Choose student</option>'+state.students.map(p=>'<option value="'+p.id+'">'+escape(p.name||"Student")+'</option>').join("")+'</select></label>
    <label class="wide">Lesson title<input id="calendar-title" maxlength="160" required value="English lesson" placeholder="e.g. Beginner 1 — Lesson 5"></label>
    <label>Date<input id="calendar-date" type="date" required value="${key(state.selected)}"></label>
    <label>Status<select id="calendar-status"><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
    <label>Start time<input id="calendar-start" type="time" required value="09:00"></label>
    <label>End time<input id="calendar-end" type="time" required value="09:45"></label>
    <label class="wide">Notes<textarea id="calendar-description" maxlength="1000" placeholder="Lesson topic, homework or meeting details"></textarea></label>
    <div class="calendar-form-actions wide"><button class="button button-primary" type="submit">${state.editing?"Save changes":"Add lesson"}</button><button class="button button-light" type="button" id="calendar-clear">Clear</button>${state.editing?'<button class="button button-light" type="button" id="calendar-cancel-edit">Cancel edit</button>':""}</div>
    </form></section>`;}
  function wireEditor(){
    root.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>{state.editing=state.entries.find(e=>e.id===b.dataset.edit)||null;render();}));
    root.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",async()=>{const entry=state.entries.find(e=>e.id===b.dataset.delete);if(!entry||!window.confirm("Delete this lesson from the calendar?"))return;b.disabled=true;const {error}=await client.from("teacher_schedule_entries").delete().eq("id",entry.id);if(error){b.disabled=false;message(error.message,true);return;}message("Lesson deleted.");await loadEntries();render();}));
    const form=root.querySelector("#calendar-form");if(!form)return;
    const teacherSelect=root.querySelector("#calendar-teacher");
    const studentSelect=root.querySelector("#calendar-student");
    function fillStudents(teacherId,selected=""){const allowed=role==="admin"?state.links.filter(x=>x.teacher_id===teacherId).map(x=>x.student_id):state.students.map(x=>x.id);const people=state.students.filter(x=>allowed.includes(x.id));studentSelect.replaceChildren(new Option("Choose student",""));people.forEach(p=>studentSelect.add(new Option(p.name||"Student",p.id)));if(selected)studentSelect.value=selected;}
    if(teacherSelect){teacherSelect.addEventListener("change",()=>fillStudents(teacherSelect.value));}
    else fillStudents(state.user.id);
    if(state.editing){const e=state.editing;if(teacherSelect){teacherSelect.value=e.teacher_id;fillStudents(e.teacher_id,e.student_id);}else fillStudents(state.user.id,e.student_id);
      root.querySelector("#calendar-title").value=e.event_title||"English lesson";root.querySelector("#calendar-date").value=e.scheduled_date;root.querySelector("#calendar-status").value=e.status||"scheduled";root.querySelector("#calendar-start").value=time(e.start_time);root.querySelector("#calendar-end").value=time(e.end_time);root.querySelector("#calendar-description").value=e.description||"";}
    form.addEventListener("submit",saveEvent);
    root.querySelector("#calendar-clear").addEventListener("click",()=>{state.editing=null;render();});
    root.querySelector("#calendar-cancel-edit")?.addEventListener("click",()=>{state.editing=null;render();});
  }
  async function saveEvent(ev){ev.preventDefault();const teacherId=role==="admin"?root.querySelector("#calendar-teacher").value:state.user.id;const studentId=root.querySelector("#calendar-student").value;const date=root.querySelector("#calendar-date").value;const start=root.querySelector("#calendar-start").value;const end=root.querySelector("#calendar-end").value;const student=state.students.find(x=>x.id===studentId);if(!teacherId||!studentId||!date||!start||!end||end<=start){message("Choose a teacher, student, date and valid time range.",true);return;}
    const payload={teacher_id:teacherId,student_id:studentId,student_name:student?.name||"Student",event_title:root.querySelector("#calendar-title").value.trim(),description:root.querySelector("#calendar-description").value.trim(),scheduled_date:date,start_time:start,end_time:end,time_slot:start+"–"+end,status:root.querySelector("#calendar-status").value};
    const button=root.querySelector('#calendar-form button[type="submit"]');button.disabled=true;
    const result=state.editing?await client.from("teacher_schedule_entries").update(payload).eq("id",state.editing.id):await client.from("teacher_schedule_entries").insert(payload);
    button.disabled=false;if(result.error){message(result.error.message,true);return;}
    state.selected=dateOf(date);state.anchor=new Date(state.selected);state.editing=null;await loadEntries();message("Lesson schedule saved.");
  }
  async function loadPeople(){
    if(role==="teacher"){const {data,error}=await client.rpc("teacher_list_linked_students");if(error)throw error;state.students=(data||[]).map(x=>({id:x.student_id||x.id,name:x.full_name||x.name||"Student"}));}
    if(role==="admin"){
      const [profiles,links]=await Promise.all([client.from("profiles").select("id,name,role").in("role",["admin","teacher","student"]),client.from("teacher_students").select("teacher_id,student_id")]);
      if(profiles.error)throw profiles.error;if(links.error)throw links.error;
      state.profiles=profiles.data||[];state.teachers=state.profiles.filter(x=>x.role==="teacher"||x.role==="admin");state.students=state.profiles.filter(x=>x.role==="student");state.links=links.data||[];
    }
  }
  async function loadEntries(){
    const fields="id,teacher_id,student_id,student_name,event_title,description,scheduled_date,start_time,end_time,time_slot,status";
    let query=client.from("teacher_schedule_entries").select(fields).order("scheduled_date").order("start_time");
    if(role==="teacher")query=query.eq("teacher_id",state.user.id);
    if(role==="student")query=query.eq("student_id",state.user.id);
    const {data,error}=await query.limit(1000);if(error)throw error;state.entries=data||[];
    if(role==="admin"){
      const ids=[...new Set(state.entries.map(e=>e.teacher_id).filter(Boolean))];if(ids.length){const {data:ps}=await client.from("profiles").select("id,name").in("id",ids);state.profiles=ps||state.profiles;}
    }
  }
  async function init(){
    const {data:{session},error}=await client.auth.getSession();if(error)throw error;if(!session){root.innerHTML='<p class="calendar-empty">Sign in to view your lesson calendar.</p>';return;}
    state.user=session.user;
    const {data:profile}=await client.from("profiles").select("role").eq("id",session.user.id).maybeSingle();if(profile?.role!==role){root.innerHTML='<p class="calendar-empty">This calendar is not available for this account.</p>';return;}
    await loadPeople();await loadEntries();render();
    client.auth.onAuthStateChange(async(_event,next)=>{if(!next){state.user=null;root.innerHTML='<p class="calendar-empty">Sign in to view your lesson calendar.</p>';return;}if(next.user.id!==state.user?.id){state.user=next.user;try{const {data:profile}=await client.from("profiles").select("role").eq("id",next.user.id).maybeSingle();if(profile?.role!==role){root.innerHTML='<p class="calendar-empty">This calendar is not available for this account.</p>';return;}await loadPeople();await loadEntries();render();}catch(e){root.innerHTML='<p class="calendar-empty">Could not load calendar: '+escape(e.message)+'</p>';}}});
  }
  init().catch(e=>{root.innerHTML='<p class="calendar-empty">Could not load calendar: '+escape(e.message||"Please refresh and try again.")+'</p>';});
})();