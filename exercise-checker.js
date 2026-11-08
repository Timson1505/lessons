(() => {
  const SUPABASE_URL = "https://dtgspwsxwslntlayqcbe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf";
  const inputClass = "word-answer";
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
      if(Array.isArray(bank)&&bank.length){
        const panel=document.createElement("div");panel.className="key-words";
        const heading=document.createElement("strong");heading.textContent="Key words";
        panel.appendChild(heading);
        bank.forEach(word=>{const chip=document.createElement("span");chip.className="key-word";chip.textContent=word;panel.appendChild(chip);});
        const firstHeading=container.querySelector("h3,h4");
        if(firstHeading)firstHeading.insertAdjacentElement("afterend",panel);else container.prepend(panel);
      }
      let feedback=container.querySelector(".answer-feedback");
      if(!feedback){feedback=document.createElement("p");feedback.className="answer-feedback";feedback.setAttribute("aria-live","polite");container.appendChild(feedback);}
      const oldCheck=container.querySelector(".check-answers");
      const check=oldCheck?oldCheck.cloneNode(true):document.createElement("button");
      check.type="button";check.className="check-answers";check.textContent="Check the answer";check.disabled=!canCheck;
      if(oldCheck)oldCheck.replaceWith(check);else container.appendChild(check);
      const oldKey=container.querySelector(".show-answer-key");
      const keyButton=oldKey?oldKey.cloneNode(true):document.createElement("button");
      keyButton.type="button";keyButton.className="show-answer-key";keyButton.textContent="Show answer key";keyButton.disabled=!canSeeKeys;
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
      check.disabled=!canCheck;keyButton.disabled=!canSeeKeys;
    });
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>start().catch(console.error),{once:true});
  else start().catch(console.error);
})();