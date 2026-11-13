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
 const designSystem=doc.createElement("link");designSystem.rel="stylesheet";designSystem.href=ROOT+"design-system.css?v=20261114-1";doc.head.append(designSystem);

 // Restore shared site assets that were authored as lesson-relative URLs.
 // The protected viewer has a virtual lesson URL, but shared JS and the site logo live at the site root.
 doc.querySelectorAll('script[src]').forEach(script=>{
   const src=script.getAttribute("src")||"";
   const clean=src.split("?")[0].split("#")[0];
   if(clean==="script.js"||clean.endsWith("/script.js"))script.setAttribute("src",ROOT+"script.js");
   // theme.js was removed during the protected-viewer migration; the viewer below supplies theme controls.
   else if(clean.endsWith("/theme.js")||clean==="theme.js")script.remove();
 });
 doc.querySelectorAll('link[rel~="icon"]').forEach(link=>{
   const href=link.getAttribute("href")||"";
   if(href.endsWith("media/logo.png"))link.setAttribute("href",ROOT+"media/logo.png");
 });

 // Ensure the same Font Awesome icon font used by the homepage is available in the protected lesson viewer.
 if(!doc.querySelector('link[href*="font-awesome/6.7.2/css/all.min.css"]')){
   const icons=doc.createElement("link");icons.rel="stylesheet";icons.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";doc.head.append(icons);
 }
 // Match the homepage typography and create a dedicated bottom area for account/theme controls.
 const sidebarStyle=doc.createElement("style");
 sidebarStyle.textContent=`
 body,body *:not(.material-symbols-outlined):not([class*="fa"]):not([class*="bx"]){font-family:"Times New Roman",Times,serif!important}
 body{font-size:16px!important;line-height:1.5!important}
 i.fa,i.fas,i.fa-solid,i.fa::before,i.fas::before,i.fa-solid::before{font-family:"Font Awesome 6 Free"!important;font-weight:900;font-style:normal}
 i.far,i.fa-regular,i.far::before,i.fa-regular::before{font-family:"Font Awesome 6 Free"!important;font-weight:400;font-style:normal}
 i.fab,i.fa-brands,i.fab::before,i.fa-brands::before{font-family:"Font Awesome 6 Brands"!important;font-weight:400;font-style:normal}
 .aside{font-family:"Times New Roman",Times,serif!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;overflow-y:auto!important}
 .aside .nav{width:100%;margin-top:145px!important;margin-bottom:150px!important;max-height:calc(100vh - 330px);overflow-y:auto;padding-bottom:12px}
 .aside .nav li a{font-family:"Times New Roman",Times,serif!important;font-size:16px!important;line-height:1.4!important;padding:9px 15px!important}
 .aside .nav li a i{font-size:17px!important;width:22px!important;margin-right:12px!important}
 .aside > .sidebar-auth-list-item,.aside .sidebar-auth-actions,.aside a.sidebar-auth-btn{display:none!important}
 .lesson-sidebar-footer{position:fixed;left:20px;width:230px;bottom:18px;display:flex;flex-direction:column;gap:10px;font-family:"Times New Roman",Times,serif;z-index:1002;background:var(--bg-black-100,#fff);padding:10px 0 0;border-top:1px solid var(--bg-black-50,#ddd)}
 @media(max-height:650px){.aside .nav{margin-top:110px!important;margin-bottom:125px!important;max-height:calc(100vh - 260px)}.lesson-sidebar-footer{bottom:8px}}
 @media(max-width:767px){.lesson-sidebar-footer{left:20px;width:230px;bottom:12px}.aside .nav{margin-bottom:140px!important}}
 .lesson-sidebar-theme-row{display:flex;align-items:center;justify-content:center;gap:13px;padding:10px 8px;border-top:1px solid var(--bg-black-50,#ddd)}
 .lesson-sidebar-theme-row button{width:30px;height:30px;border-radius:50%;border:1px solid var(--bg-black-50,#ccc);background:var(--bg-black-100,#fff);color:var(--text-black-900,#333);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px}
 .lesson-sidebar-theme-row button[aria-pressed="true"]{outline:2px solid var(--skin-color,#4fadc0);outline-offset:2px}
 .lesson-sidebar-theme-row [data-theme-color="color-1"]{background:#4fadc0}
 .lesson-sidebar-theme-row [data-theme-color="color-2"]{background:#ec1839}
 .lesson-sidebar-theme-row [data-theme-color="color-3"]{background:#37b182}
 .lesson-sidebar-theme-row [data-theme-color]{width:24px;height:24px;border:0;color:#fff!important;font-size:11px}
 .lesson-sidebar-theme-row [data-theme-color] i{font-family:"Font Awesome 6 Free"!important;font-weight:900;font-style:normal}
 .lesson-sidebar-theme-row .lesson-dark-toggle i{font-family:"Font Awesome 6 Free"!important;font-weight:900;font-style:normal}
 .lesson-sidebar-cabinet{display:flex;align-items:center;justify-content:center;gap:9px;padding:11px 14px;border:1px solid var(--skin-color,#2878a8);border-radius:9px;color:var(--skin-color,#2878a8)!important;font-size:16px;font-weight:700;text-decoration:none;background:var(--bg-black-100,#fff);transition:background .2s,color .2s}
 .lesson-sidebar-cabinet:hover{background:var(--skin-color,#2878a8);color:#fff!important}
 body.dark .lesson-sidebar-cabinet{background:#202020}
 @media(max-width:767px){.aside .nav{max-height:calc(100vh - 220px)}.lesson-sidebar-footer{bottom:14px}}
 `;
 doc.head.append(sidebarStyle);
 const aside=doc.querySelector(".aside");
 if(aside){
   // Remove the entire legacy authentication block (not only its links).
   aside.querySelectorAll(".sidebar-auth-list-item,.sidebar-auth-actions,.sidebar-signin,.sidebar-signup").forEach(el=>el.remove());
   aside.querySelectorAll('a[href*="account.html"],a[href*="#signin"],a[href*="#signup"]').forEach(el=>el.remove());
   const oldFooter=aside.querySelector(".lesson-sidebar-footer");if(oldFooter)oldFooter.remove();
   const footer=doc.createElement("div");footer.className="lesson-sidebar-footer";
   footer.innerHTML='<div class="lesson-sidebar-theme-row" aria-label="Appearance controls"><button type="button" class="lesson-dark-toggle" aria-label="Switch to dark mode" title="Dark mode"><i class="fas fa-moon" aria-hidden="true"></i></button><button type="button" data-theme-color="color-1" aria-label="Blue theme" title="Blue accent color"><i class="fas fa-droplet" aria-hidden="true"></i></button><button type="button" data-theme-color="color-2" aria-label="Red theme" title="Red accent color"><i class="fas fa-droplet" aria-hidden="true"></i></button><button type="button" data-theme-color="color-3" aria-label="Green theme" title="Green accent color"><i class="fas fa-droplet" aria-hidden="true"></i></button></div><a class="lesson-sidebar-cabinet" href="'+ROOT+'account.html"><i class="fas fa-user-circle" aria-hidden="true"></i><span>My Cabinet</span></a>';
   aside.append(footer);
   const cabinet=footer.querySelector(".lesson-sidebar-cabinet");
   const {data:profile}=await db.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
   const destinations={admin:"admin.html",teacher:"teacher.html",student:"student.html"};
   if(profile?.role&&destinations[profile.role])cabinet.href=ROOT+destinations[profile.role];
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

 // Load all three homepage accent palettes explicitly so color controls work even in older lesson HTML.
 const themeOverrides=doc.createElement("style");
 themeOverrides.textContent=`
 body.dark{background:#151515!important;color:#ededed!important}
 body.dark .main-container,body.dark .main-content,body.dark .section,body.dark section,body.dark .aside,body.dark .dropdown,body.dark .child,body.dark table,body.dark .container{background-color:#202020!important;color:#ededed!important}
 body.dark h1,body.dark h2,body.dark h3,body.dark h4,body.dark h5,body.dark p,body.dark li,body.dark td,body.dark th,body.dark label,body.dark .lesson-name{color:#ededed!important}
 body.dark a{color:#8fc8ff}
 body.dark input,body.dark textarea,body.dark select,body.dark button{background-color:#292929;color:#ededed;border-color:#555}
 body.dark .lesson-sidebar-theme-row button[data-theme-color]{background:var(--theme-dot)!important}
 `;
 doc.head.append(themeOverrides);
 ["color-1","color-2","color-3"].forEach(function(color){
   let link=doc.querySelector('link.alternate-style[title="'+color+'"]');
   if(!link){link=doc.createElement("link");link.rel="stylesheet";link.className="alternate-style";link.title=color;link.disabled=true;doc.head.append(link);}
   link.href=ROOT+color+".css";
 });
 const themeScript=doc.createElement("script");
 themeScript.textContent=`
 (function(){
   var controls=document.querySelector(".lesson-sidebar-theme-row");
   if(!controls || controls.dataset.ready==="true") return;
   controls.dataset.ready="true";
   var night=controls.querySelector(".lesson-dark-toggle");
   var icon=night.querySelector("i");
   function applyColor(color){
     document.querySelectorAll("link.alternate-style[title^='color-']").forEach(function(link){
       if(link.title===color) link.removeAttribute("disabled");
       else link.setAttribute("disabled","true");
     });
     controls.querySelectorAll("[data-theme-color]").forEach(function(button){
       button.setAttribute("aria-pressed",String(button.dataset.themeColor===color));
     });
     try{localStorage.setItem("timsons-lesson-theme-color",color);}catch(e){}
   }
   function applyDark(enabled){
     document.body.classList.toggle("dark",enabled);
     icon.classList.toggle("fa-sun",enabled);
     icon.classList.toggle("fa-moon",!enabled);
     night.setAttribute("aria-label",enabled?"Switch to light mode":"Switch to dark mode");
     night.title=enabled?"Light mode":"Dark mode";
     try{localStorage.setItem("timsons-lesson-dark",enabled?"1":"0");}catch(e){}
   }
   night.addEventListener("click",function(){applyDark(!document.body.classList.contains("dark"));});
   controls.querySelectorAll("[data-theme-color]").forEach(function(button){
     button.addEventListener("click",function(){applyColor(button.dataset.themeColor);});
   });
   var savedColor="color-2",savedDark=false;
   try{savedColor=localStorage.getItem("timsons-lesson-theme-color")||savedColor;savedDark=localStorage.getItem("timsons-lesson-dark")==="1";}catch(e){}
   if(!["color-1","color-2","color-3"].includes(savedColor))savedColor="color-2";
   applyColor(savedColor);applyDark(savedDark);
 })();
 `;
 doc.body.append(themeScript);
 document.open();document.write("<!doctype html>\n"+doc.documentElement.outerHTML);document.close();
}
run().catch(e=>{console.error("Protected lesson viewer",e);message("Не удалось открыть урок",e.message||"Обновите страницу и попробуйте снова.");});
})();