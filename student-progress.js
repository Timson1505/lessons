(function(){
  const SUPABASE_URL='https://dtgspwsxwslntlayqcbe.supabase.co';
  const SUPABASE_KEY='sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';
  const path=decodeURI(location.pathname).replace(/^\\/lessons\\//,'').replace(/^\\/+/, '');
  const parts=path.split('/').filter(Boolean);
  if(parts.length<2||parts.some(p=>p.toLowerCase()==='test'))return;
  const level=parts[0],lessonPath=parts.join('/');
  const style=document.createElement('style');
  style.textContent='.lesson-complete-control{position:fixed;z-index:9998;right:20px;bottom:20px;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:12px 15px;border:1px solid #dce2f0;border-radius:14px;background:#fff;color:#20243a;box-shadow:0 10px 32px rgba(20,30,60,.18);font:600 14px/1.35 Arial,sans-serif}.lesson-complete-control button{border:0;border-radius:9px;padding:10px 13px;background:#4f46e5;color:#fff;font-weight:700;cursor:pointer}.lesson-complete-control button:disabled{opacity:.65;cursor:default}.lesson-complete-control .done{background:#e8f7ed;color:#17683b;padding:9px 12px;border-radius:9px}.lesson-complete-control small{display:block;color:#667085;font-weight:400}@media(max-width:520px){.lesson-complete-control{left:12px;right:12px;bottom:12px;justify-content:space-between}.lesson-complete-control button{white-space:nowrap}}';
  document.head.append(style);
  function boot(){
    if(!window.supabase?.createClient)return;
    const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    db.auth.getSession().then(async({data})=>{
      const user=data.session?.user;if(!user)return;
      const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();
      if(profile?.role!=='student')return;
      const wrap=document.createElement('div');wrap.className='lesson-complete-control';
      const label=document.createElement('span');label.innerHTML='Lesson progress<small>Save this lesson to your dashboard</small>';
      const button=document.createElement('button');button.type='button';button.textContent='Mark complete';
      wrap.append(label,button);document.body.append(wrap);
      const {data:existing}=await db.from('student_lesson_progress').select('completed_at').eq('student_id',user.id).eq('lesson_path',lessonPath).maybeSingle();
      if(existing){button.disabled=true;button.textContent='Completed ✓';label.lastChild.textContent='Saved '+new Date(existing.completed_at).toLocaleDateString();}
      button.addEventListener('click',async()=>{
        button.disabled=true;button.textContent='Saving…';
        const now=new Date().toISOString();
        const {error}=await db.from('student_lesson_progress').upsert({student_id:user.id,level_slug:level,lesson_path:lessonPath,completed_at:now,updated_at:now},{onConflict:'student_id,lesson_path'});
        if(error){button.disabled=false;button.textContent='Try again';label.lastChild.textContent=error.message;return;}
        button.textContent='Completed ✓';label.lastChild.textContent='Saved to your Student Dashboard';
        wrap.querySelector('button').style.background='#15803d';
      });
    }).catch(err=>console.warn('Lesson progress setup failed:',err));
  }
  if(window.supabase?.createClient)boot();
  else{const loader=document.createElement('script');loader.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';loader.onload=boot;loader.onerror=()=>console.warn('Supabase client unavailable for lesson progress');document.head.append(loader);}
})();