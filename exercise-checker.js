(() => {
  const SUPABASE_URL = "https://dtgspwsxwslntlayqcbe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf";
  const inputClass = "word-answer";

  // Unified homepage-style sidebar for every lesson and final test.
  function installLessonNavigation() {
    const sidebar = document.querySelector(".aside");
    if (!sidebar || sidebar.dataset.unifiedNavigation === "true") return;
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";
    document.head.appendChild(fontAwesome);

    const css = document.createElement("style");
    css.textContent = `
      .main-content { padding-left:270px !important; margin-left:0 !important; }
      .aside { width:270px !important; height:100vh !important; position:fixed !important; inset:0 auto 0 0 !important; padding:30px !important; display:flex !important; flex-direction:column !important; justify-content:center !important; align-items:stretch !important; background:var(--bg-black-100,#fdf9ff) !important; border-right:1px solid var(--bg-black-50,#e8dfec) !important; z-index:1000 !important; transition:left .25s ease !important; }
      .aside .logo { position:absolute !important; top:42px !important; left:30px !important; }
      .aside .logo a { color:var(--text-black-900,#302e4d) !important; font-weight:700 !important; padding:15px 20px !important; font-size:28px !important; letter-spacing:3px !important; }
      .aside .logo a span { color:var(--skin-color,#2878a8) !important; font-size:40px !important; }
      .aside .nav { width:100% !important; margin:35px 0 0 !important; padding:0 !important; }
      .aside .nav li { display:block !important; width:100% !important; margin:0 0 13px !important; }
      .aside .nav li a { display:flex !important; align-items:center !important; gap:13px !important; width:100% !important; padding:11px 13px !important; border-bottom:1px solid var(--bg-black-50,#e8dfec) !important; color:var(--text-black-900,#302e4d) !important; font-size:16px !important; font-weight:600 !important; line-height:1.35 !important; border-radius:6px !important; }
      .aside .nav li a:hover,.aside .nav li a:focus-visible { color:var(--skin-color,#2878a8) !important; background:var(--bg-black-50,#e8dfec) !important; }
      .aside .nav li a i { flex:0 0 20px !important; width:20px !important; margin:0 !important; text-align:center !important; font-size:17px !important; }
      .aside .sidebar-auth-list-item { margin-top:20px !important; }
      .aside .sidebar-auth-actions { display:grid !important; gap:10px !important; }
      .aside .sidebar-auth-btn { display:block !important; padding:10px 13px !important; border:1px solid var(--skin-color,#2878a8) !important; border-radius:24px !important; color:var(--skin-color,#2878a8) !important; text-align:center !important; font-size:15px !important; font-weight:600 !important; }
      .aside .sidebar-auth-btn:hover { background:var(--skin-color,#2878a8) !important; color:#fff !important; }
      .lesson-mobile-toggle { display:none; position:fixed; top:16px; left:16px; width:46px; height:44px; border:1px solid var(--bg-black-50,#ddd); border-radius:9px; background:var(--bg-black-100,#fff); color:var(--text-black-900,#222); z-index:1102; cursor:pointer; padding:10px; box-shadow:0 3px 14px #0002; }
      .lesson-mobile-toggle span { display:block; height:2px; width:22px; margin:4px auto; background:currentColor; border-radius:2px; }
      .lesson-mobile-overlay { position:fixed; inset:0; z-index:998; background:rgba(12,18,28,.48); }
      .lesson-mobile-overlay[hidden] { display:none !important; }
      @media (max-width:1199px) and (min-width:768px) { .aside { left:0 !important; } .main-content { padding-left:270px !important; } }
      @media (max-width:767px) { .aside { left:-270px !important; } .aside.active { left:0 !important; } .main-content { padding-left:0 !important; padding-top:62px !important; } .lesson-mobile-toggle { display:block; } }
      @media (min-width:768px) { .lesson-mobile-toggle,.lesson-mobile-overlay { display:none !important; } }
      body,body * { font-family:"Times New Roman",Times,serif; }
    `;
    document.head.appendChild(css);

    sidebar.dataset.unifiedNavigation = "true";
    sidebar.innerHTML = `
      <div class="logo"><a href="/lessons/"><span>T</span>imson's</a></div>
      <ul class="nav" aria-label="Main navigation">
        <li><a href="/lessons/#home"><i class="fa fa-home" aria-hidden="true"></i><span>Home</span></a></li>
        <li><a href="/lessons/#about"><i class="fa fa-user" aria-hidden="true"></i><span>About</span></a></li>
        <li><a href="/lessons/#project"><i class="fa fa-list" aria-hidden="true"></i><span>Lessons</span></a></li>
        <li><a href="/lessons/#for-students"><i class="fa fa-briefcase" aria-hidden="true"></i><span>For Students</span></a></li>
        <li><a href="/lessons/#contact"><i class="fa fa-comments" aria-hidden="true"></i><span>Contact</span></a></li>
      </ul>
      <div class="sidebar-auth-list-item"><div class="sidebar-auth-actions" aria-label="Account actions">
        <a class="sidebar-auth-btn sidebar-signin" href="/lessons/account.html#signin"><i class="fa fa-sign-in-alt" aria-hidden="true"></i> Sign in</a>
        <a class="sidebar-auth-btn sidebar-signup" href="/lessons/account.html#signup"><i class="fa fa-user-plus" aria-hidden="true"></i> Sign up</a>
      </div></div>`;

    const toggle = document.createElement("button");
    toggle.className = "lesson-mobile-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span><span></span>";
    document.body.appendChild(toggle);
    const overlay = document.createElement("div");
    overlay.className = "lesson-mobile-overlay";
    overlay.hidden = true;
    document.body.appendChild(overlay);
    const setOpen = open => {
      sidebar.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      overlay.hidden = !open;
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    overlay.addEventListener("click", () => setOpen(false));
    sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth >= 768) setOpen(false); });
  }
  installLessonNavigation();

  const style = document.createElement("style");
  style.textContent = `
    .word-answer{display:inline-block;width:125px;max-width:38vw;min-height:38px;box-sizing:border-box;margin:3px 5px;padding:7px 9px;border:1px solid #8795a5;border-radius:8px;background:#fff;color:#172033;font:inherit;font-size:.92em;vertical-align:middle}
    .word-answer:focus{outline:2px solid #568bd7;outline-offset:1px}
    .word-answer.correct{border:2px solid #24834b;background:#effaf2}
    .word-answer.incorrect{border:2px solid #c43b3b;background:#fff0f0}
    .check-answers,.show-answer-key{display:inline-block;margin:12px 5px 4px;padding:10px 18px;border:0;border-radius:8px;background:#2878a8;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
    .show-answer-key{background:#32804b}
    .check-answers:disabled,.show-answer-key:disabled{opacity:.55;cursor:not-allowed}
    .answer-feedback{margin:9px 5px;font-weight:700}
    .key-words{margin:12px 4px;padding:10px 13px;border:1px solid #d8e2f0;border-radius:10px;background:#f5f8ff;font-size:14px}
    .key-words strong{display:block;margin-bottom:7px}
    .key-word{display:inline-block;margin:3px 5px 3px 0;padding:4px 9px;border-radius:20px;background:#e5edff;color:#233b70;font-weight:600}
    .answer-key-display{margin:10px 4px;padding:12px 16px;border-left:4px solid #32804b;border-radius:7px;background:#eef8f0;color:#183d24}
    .answer-key-display ol{margin:8px 0 0;padding-left:24px}
  `;
  document.head.appendChild(style);

  function makeInput() {
    const input=document.createElement("input");
    input.type="text";input.maxLength=120;input.autocomplete="off";
    input.className=inputClass;input.placeholder="Your answer";
    input.setAttribute("aria-label","Type your answer");
    input.addEventListener("input",()=>{input.classList.remove("correct","incorrect");input.removeAttribute("aria-invalid");});
    return input;
  }

  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const textNodes=[];
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(/_{3,}/.test(node.nodeValue)&&!node.parentElement.closest("script,style,textarea,code,pre"))textNodes.push(node);
  }
  textNodes.forEach(node=>{
    const fragment=document.createDocumentFragment();
    node.nodeValue.split(/(_{3,})/g).forEach(part=>{
      if(/^_{3,}$/.test(part))fragment.appendChild(makeInput());
      else if(part)fragment.appendChild(document.createTextNode(part));
    });
    node.parentNode.replaceChild(fragment,node);
  });

  async function start(){
    if(!window.supabase?.createClient)return;
    const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{user}}=await client.auth.getUser();
    const {data:profile,error:profileError}=user?await client.from("profiles").select("role").eq("id",user.id).maybeSingle():{data:null,error:null};
    const role=profileError?null:profile?.role;
    const canCheck=["student","teacher","admin"].includes(role);
    const canSeeKeys=["teacher","admin"].includes(role);
    const path=decodeURI(location.pathname).replace(/^\/lessons\//,"").replace(/^\//,"");
    const exercises=Array.from(document.querySelectorAll(".ex-1k,.exercise,.question"))
      .map(container=>({container,fields:Array.from(container.querySelectorAll("input."+inputClass))}))
      .filter(item=>item.fields.length>0)
      .map((item,index)=>({...item,index}));
    if(!exercises.length)return;

    const bankResult=canCheck?await client.rpc("get_writing_word_bank",{p_lesson_path:path}):{data:[],error:null};
    const wordBanks=Array.isArray(bankResult.data)?bankResult.data:[];
    exercises.forEach(({container,index,fields})=>{
      const bank=wordBanks[index];
      const hasKeyWords=Array.isArray(bank)&&bank.length>0;
      if(hasKeyWords){
        const panel=document.createElement("div");panel.className="key-words";
        const heading=document.createElement("strong");heading.textContent="Key words";
        panel.appendChild(heading);
        bank.forEach(word=>{const chip=document.createElement("span");chip.className="key-word";chip.textContent=word;panel.appendChild(chip);});
        const firstHeading=container.querySelector("h3,h4");
        if(firstHeading)firstHeading.insertAdjacentElement("afterend",panel);else container.prepend(panel);
      }
      let feedback=container.querySelector(".answer-feedback");
      if(!feedback){feedback=document.createElement("p");feedback.className="answer-feedback";feedback.setAttribute("aria-live","polite");container.appendChild(feedback);}
      if(!hasKeyWords){feedback.textContent="Answer key and Key words are being prepared for this exercise. It is not included in the automatic Writing rating yet.";feedback.style.color="#765b20";}
      const oldCheck=container.querySelector(".check-answers");
      const check=oldCheck?oldCheck.cloneNode(true):document.createElement("button");
      check.type="button";check.className="check-answers";check.textContent="Check the answer";check.disabled=!canCheck||!hasKeyWords;
      if(oldCheck)oldCheck.replaceWith(check);else container.appendChild(check);
      const oldKey=container.querySelector(".show-answer-key");
      const keyButton=oldKey?oldKey.cloneNode(true):document.createElement("button");
      keyButton.type="button";keyButton.className="show-answer-key";keyButton.textContent="Show answer key";keyButton.disabled=!canSeeKeys||!hasKeyWords;
      if(oldKey)oldKey.replaceWith(keyButton);else container.appendChild(keyButton);
      let display=container.querySelector(".answer-key-display");
      if(!display){display=document.createElement("div");display.className="answer-key-display";display.hidden=true;container.appendChild(display);}
      check.addEventListener("click",async()=>{
        if(!user||!canCheck){feedback.textContent="Please sign in with your student account to check answers.";return;}
        check.disabled=true;feedback.textContent="Checking answers…";
        try{
          if(role==="student"){
            const payload=exercises.map(item=>item.fields.map(f=>f.value.trim()));
            const {data,error}=await client.rpc("grade_writing_lesson",{p_lesson_path:path,p_answers:payload});
            if(error)throw error;
            (data.exercises||[]).forEach(result=>{
              if(!result)return;
              const target=exercises.find(item=>item.index===result.exercise-1);
              if(!target)return;
              target.fields.forEach((field,i)=>{
                const ok=Boolean(result.fields?.[i]);
                field.classList.toggle("correct",ok);field.classList.toggle("incorrect",!ok);
                field.setAttribute("aria-invalid",String(!ok));
              });
              const out=target.container.querySelector(".answer-feedback");
              if(out)out.textContent="Exercise "+result.exercise+": "+result.correct+" / "+result.total+" correct.";
            });
            feedback.textContent="Writing rating saved: "+Number(data.score).toFixed(1)+" / 100 ("+data.correct+" of "+data.total+" correct).";
            feedback.style.color=Number(data.score)>=80?"#24834b":"#b52f2f";
          }else{
            const {data,error}=await client.rpc("get_writing_answer_key",{p_lesson_path:path});
            if(error)throw error;
            const answers=data?.[index];
            if(!Array.isArray(answers)){feedback.textContent="No answer key is available for this exercise yet.";return;}
            let correct=0;
            fields.forEach((field,i)=>{
              const accepted=String(answers[i]??"").split("|").map(x=>x.trim().toLowerCase());
              const ok=accepted.includes(field.value.trim().toLowerCase());
              field.classList.toggle("correct",ok);field.classList.toggle("incorrect",!ok);
              field.setAttribute("aria-invalid",String(!ok));if(ok)correct++;
            });
            feedback.textContent="Teacher preview: "+correct+" / "+fields.length+" correct. Student ratings are not changed.";
          }
        }catch(error){feedback.textContent=error.message||"Could not check this exercise.";feedback.style.color="#b52f2f";}
        finally{check.disabled=!canCheck;}
      });
      keyButton.addEventListener("click",async()=>{
        if(!user||!canSeeKeys)return;
        keyButton.disabled=true;
        try{
          const {data,error}=await client.rpc("get_writing_answer_key",{p_lesson_path:path});
          if(error)throw error;
          const answers=data?.[index];
          display.replaceChildren();
          const title=document.createElement("strong");title.textContent="Correct answers";display.appendChild(title);
          if(!Array.isArray(answers)){const p=document.createElement("p");p.textContent="Answer key is not available for this exercise yet.";display.appendChild(p);}
          else{const list=document.createElement("ol");answers.forEach(answer=>{const li=document.createElement("li");li.textContent=String(answer).replace(/\|/g," / ");list.appendChild(li);});display.appendChild(list);}
          display.hidden=false;
        }catch(error){display.textContent=error.message||"Could not load answer key.";display.hidden=false;}
        finally{keyButton.disabled=false;}
      });
      check.disabled=!canCheck||!hasKeyWords;keyButton.disabled=!canSeeKeys||!hasKeyWords;
    });
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>start().catch(console.error),{once:true});
  else start().catch(console.error);
})();