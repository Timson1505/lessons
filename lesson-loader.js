(() => {
"use strict";
const URL_ROOT="https://dtgspwsxwslntlayqcbe.supabase.co", KEY="sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf", ROOT="/lessons/";
const panel=document.getElementById("lesson-loader-status");
function message(title,detail){panel.replaceChildren();const h=document.createElement("h2"),p=document.createElement("p");h.textContent=title;p.textContent=detail;panel.append(h,p);}
const mediaExt=/\.(png|jpe?g|webp|avif|gif|svg|mp3|wav|m4a|mp4|webm|pdf|ogg)$/i;
function resolveMedia(value,dir){
 if(!value||/^(data:|blob:|https?:\/\/(?!timson1505\.github\.io\/lessons\/))/i.test(value)||value[0]==="#"||value.startsWith("mailto:"))return null;
 try{const u=new URL(value.split("#")[0].split("?")[0],location.origin+ROOT+dir+"/");if(u.origin!==location.origin)return null;let p=decodeURIComponent(u.pathname);if(p.startsWith(ROOT))p=p.slice(ROOT.length);else p=p.replace(/^\//,"");return mediaExt.test(p)?p:null;}catch(_){return null;}
}
async function run(){
 if(!window.supabase?.createClient)throw Error("Не удалось загрузить библиотеку Supabase.");
 const db=window.supabase.createClient(URL_ROOT,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data:{session}}=await db.auth.getSession();
 if(!session?.user){message("Уроки доступны после входа","Войдите в свой аккаунт Timson’s English Lessons, чтобы открыть материалы.");const a=document.createElement("a");a.href=ROOT+"account.html#signin";a.textContent="Sign in";a.className="lesson-signin";panel.append(a);return;}
 const {data:auth,error:authError}=await db.auth.getUser();if(authError||!auth?.user){message("Сессия недействительна","Войдите в аккаунт повторно.");return;}
 const params=new URLSearchParams(location.search);let path=params.get("lesson");
 if(!path){path=decodeURIComponent(location.pathname);if(path.startsWith(ROOT))path=path.slice(ROOT.length);}
 path=path.replace(/^\/+|\/+$/g,"");
 if(!/^[\w-]+\/[\w-]+\/index\.html$/i.test(path)){message("Урок не найден","Проверьте ссылку на урок.");return;}
 const dir=path.slice(0,path.lastIndexOf("/"));
 const {data,error}=await db.rpc("get_lesson_content",{p_lesson_path:path});
 if(error||!Array.isArray(data)||!data.length||!data[0].body_html){message("Нет доступа к этому уроку","Материал не опубликован или не входит в ваш доступ. Обратитесь к своему учителю.");return;}
 const doc=new DOMParser().parseFromString(data[0].body_html,"text/html"),base=doc.createElement("base");base.href=location.origin+ROOT+dir+"/";doc.head.prepend(base);

 // Compact lesson navigation and provide one consistent My Cabinet entry.
 const sidebarStyle=doc.createElement("style");
 sidebarStyle.textContent=".aside .nav li a{font-size:14px!important;line-height:1.35!important;padding-top:11px!important;padding-bottom:11px!important}.aside .nav li a i{font-size:15px!important;width:22px!important}.aside .nav li.cabinet-nav-item{margin-top:10px}.aside .nav li.cabinet-nav-item a{display:flex;align-items:center;gap:8px;border:1px solid var(--skin-color,#2878a8);border-radius:8px;color:var(--skin-color,#2878a8);font-weight:700!important}.aside .nav li.cabinet-nav-item a:hover{background:var(--skin-color,#2878a8);color:#fff}";
 doc.head.append(sidebarStyle);
 const lessonNav=doc.querySelector(".aside .nav");
 if(lessonNav&&!lessonNav.querySelector(".cabinet-nav-item")){
   const item=doc.createElement("li");
   item.className="cabinet-nav-item";
   const link=doc.createElement("a");
   link.href=ROOT+"account.html";
   link.innerHTML='<i class="fas fa-user-circle" aria-hidden="true"></i><span>My Cabinet</span>';
   item.append(link);lessonNav.append(item);
   const {data:profile}=await db.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
   const destinations={admin:"admin.html",teacher:"teacher.html",student:"student.html"};
   if(profile?.role&&destinations[profile.role])link.href=ROOT+destinations[profile.role];
 }
 doc.head.querySelectorAll('meta[name="robots"]').forEach(x=>x.remove());const robots=doc.createElement("meta");robots.name="robots";robots.content="noindex,nofollow,noarchive";doc.head.append(robots);
 const refs=[];
 for(const el of doc.querySelectorAll("[src],[poster]"))for(const attr of ["src","poster"]){const p=resolveMedia(el.getAttribute(attr),dir);if(p)refs.push({el,attr,path:p});}
 for(const el of doc.querySelectorAll("[srcset]"))for(const part of el.getAttribute("srcset").split(",")){const p=resolveMedia(part.trim().split(/\s+/)[0],dir);if(p)refs.push({el,attr:"srcset-media",path:p});}
 const paths=[...new Set(refs.map(x=>x.path))], blobs=new Map(), missingMedia=[];let cursor=0;
 // Missing optional media must not prevent the protected lesson itself from rendering.
 async function worker(){while(cursor<paths.length){const p=paths[cursor++];try{const {data:file,error:storageError}=await db.storage.from("lesson-media").download(p);if(storageError||!file){missingMedia.push(p);blobs.set(p,null);continue;}blobs.set(p,URL.createObjectURL(file));}catch(error){missingMedia.push(p);blobs.set(p,null);console.warn("Lesson media unavailable:",p,error);}}}
 await Promise.all(Array.from({length:Math.min(5,paths.length)},worker));
 for(const r of refs)if(r.attr!=="srcset-media"){const blob=blobs.get(r.path);if(blob)r.el.setAttribute(r.attr,blob);else{r.el.removeAttribute(r.attr);r.el.dataset.mediaUnavailable="true";if(r.el.tagName==="IMG"&&!r.el.getAttribute("alt"))r.el.setAttribute("alt","Image unavailable");}}
 for(const el of doc.querySelectorAll("[srcset]")){const entries=el.getAttribute("srcset").split(",").map(part=>{const bits=part.trim().split(/\s+/),p=resolveMedia(bits[0],dir),blob=p?blobs.get(p):null;return p?(blob?[blob,...bits.slice(1)].join(" "):""):part.trim();}).filter(Boolean);if(entries.length)el.setAttribute("srcset",entries.join(", "));else el.removeAttribute("srcset");}
 if(missingMedia.length){const notice=doc.createElement("p");notice.className="lesson-media-notice";notice.setAttribute("role","status");notice.textContent="Some lesson media files are temporarily unavailable. The lesson content is still available.";notice.style.cssText="margin:12px auto;padding:8px 12px;max-width:900px;border-radius:8px;background:#fff3cd;color:#664d03;font:14px/1.4 Arial,sans-serif;text-align:center";doc.body.prepend(notice);console.warn("Missing lesson media files:",missingMedia);}
 doc.title=data[0].title||doc.title||"Timson’s English Lessons";

 // Add the same theme controls used on the homepage to every protected lesson.
 const switcherCss=doc.createElement("link");
 switcherCss.rel="stylesheet";
 switcherCss.href=ROOT+"style-switcher.css";
 doc.head.append(switcherCss);
 const themeOverrides=doc.createElement("style");
 themeOverrides.textContent="body.dark{background:#151515!important;color:#ededed!important}body.dark .main-container,body.dark .main-content,body.dark .section,body.dark section,body.dark .aside,body.dark .dropdown,body.dark .child,body.dark table,body.dark .container{background-color:#202020!important;color:#ededed!important}body.dark h1,body.dark h2,body.dark h3,body.dark h4,body.dark h5,body.dark p,body.dark li,body.dark td,body.dark th,body.dark label,body.dark .lesson-name{color:#ededed!important}body.dark a{color:#8fc8ff}body.dark input,body.dark textarea,body.dark select,body.dark button:not(.s-icon):not([data-theme-color]){background-color:#292929;color:#ededed;border-color:#555}body.dark .style-switcher{background:#222;color:#ededed}body.dark .style-switcher h4{color:#ededed}.style-switcher .colors button{display:inline-block;width:30px;height:30px;padding:0;border:0;border-radius:50%;cursor:pointer}.style-switcher .s-icon{padding:0;line-height:38px}";
 doc.head.append(themeOverrides);
 doc.querySelectorAll('link.alternate-style[title^="color-"]').forEach(link=>{
   link.href=ROOT+link.title+".css";
 });
 if(!doc.querySelector(".style-switcher")){
   const switcher=doc.createElement("div");
   switcher.className="style-switcher";
   switcher.innerHTML='<button type="button" class="style-switcher-toggler s-icon" aria-label="Open theme settings" aria-expanded="false"><i class="fas fa-cog fa-spin" aria-hidden="true"></i></button><button type="button" class="day-night s-icon" aria-label="Toggle dark mode"><i class="fas fa-moon" aria-hidden="true"></i></button><h4>Theme Colors</h4><div class="colors"><button type="button" class="color-1" data-theme-color="color-1" aria-label="Red theme"></button><button type="button" class="color-2" data-theme-color="color-2" aria-label="Blue theme"></button><button type="button" class="color-3" data-theme-color="color-3" aria-label="Green theme"></button></div>';
   doc.body.append(switcher);
 }
 const themeScript=doc.createElement("script");
 themeScript.textContent=`
 (function(){
   var panel=document.querySelector(".style-switcher");
   if(!panel || panel.dataset.ready==="true") return;
   panel.dataset.ready="true";
   var settings=panel.querySelector(".style-switcher-toggler");
   var night=panel.querySelector(".day-night");
   var icon=night.querySelector("i");
   function applyColor(color){
     document.querySelectorAll("link.alternate-style[title^='color-']").forEach(function(link){
       if(link.title===color) link.removeAttribute("disabled");
       else link.setAttribute("disabled","true");
     });
     try{localStorage.setItem("timsons-lesson-theme-color",color);}catch(e){}
   }
   function applyDark(enabled){
     document.body.classList.toggle("dark",enabled);
     icon.classList.toggle("fa-sun",enabled);
     icon.classList.toggle("fa-moon",!enabled);
     night.setAttribute("aria-label",enabled?"Switch to light mode":"Switch to dark mode");
     try{localStorage.setItem("timsons-lesson-dark",enabled?"1":"0");}catch(e){}
   }
   settings.addEventListener("click",function(){
     var open=panel.classList.toggle("open");
     settings.setAttribute("aria-expanded",String(open));
   });
   night.addEventListener("click",function(){applyDark(!document.body.classList.contains("dark"));});
   panel.querySelectorAll("[data-theme-color]").forEach(function(button){
     button.addEventListener("click",function(){applyColor(button.dataset.themeColor);});
   });
   var savedColor="color-2",savedDark=false;
   try{savedColor=localStorage.getItem("timsons-lesson-theme-color")||savedColor;savedDark=localStorage.getItem("timsons-lesson-dark")==="1";}catch(e){}
   if(!document.querySelector('link.alternate-style[title="'+savedColor+'"]')) savedColor="color-2";
   applyColor(savedColor);applyDark(savedDark);
 })();
 `;
 doc.body.append(themeScript);
 document.open();document.write("<!doctype html>\n"+doc.documentElement.outerHTML);document.close();
}
run().catch(e=>{console.error("Protected lesson viewer",e);message("Не удалось открыть урок",e.message||"Обновите страницу и попробуйте снова.");});
})();