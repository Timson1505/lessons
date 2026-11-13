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
 const designSystem=doc.createElement("link");designSystem.rel="stylesheet";designSystem.href=ROOT+"design-system.css?v=20261114-sidebar-parity1";doc.head.append(designSystem);
 const switcherStyles=doc.createElement("link");switcherStyles.rel="stylesheet";switcherStyles.href=ROOT+"style-switcher.css?v=20261114-sidebar-parity1";doc.head.append(switcherStyles);

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
 .aside .logo,.aside .logo a,.aside .logo a span{font-family:"Times New Roman",Times,serif!important}
 .aside .nav{width:100%;margin-top:145px!important;margin-bottom:125px!important;max-height:calc(100vh - 310px);overflow-y:auto;padding-bottom:12px}
 .aside .nav li{display:block;margin-bottom:20px!important}
 .aside .nav li a{display:block;font-family:"Times New Roman",Times,serif!important;font-size:16px!important;font-style:normal!important;font-weight:600!important;line-height:1.5!important;letter-spacing:normal!important;text-transform:none!important;padding:5px 15px!important}
 .aside .nav li a i{font-size:16px!important;margin-right:15px!important}
 .aside>.sidebar-auth-list-item,.aside .sidebar-auth-actions,.aside a.sidebar-auth-btn{display:none!important}
 .lesson-sidebar-footer{position:fixed;left:20px;width:230px;bottom:18px;display:flex;flex-direction:column;gap:10px;font-family:"Times New Roman",Times,serif;z-index:1002;background:var(--bg-black-100,#fff);padding:10px 0 0;border-top:1px solid var(--bg-black-50,#ddd)}
 .lesson-sidebar-cabinet{display:flex;align-items:center;justify-content:center;gap:9px;padding:11px 14px;border:1px solid var(--skin-color,#2878a8);border-radius:9px;color:var(--skin-color,#2878a8)!important;font-family:"Times New Roman",Times,serif!important;font-size:16px!important;font-weight:600!important;line-height:1.5!important;text-decoration:none;background:var(--bg-black-100,#fff);transition:background .2s,color .2s}
 .lesson-sidebar-cabinet:hover{background:var(--skin-color,#2878a8);color:#fff!important}
 @media(max-height:650px){.aside .nav{margin-top:110px!important;margin-bottom:115px!important;max-height:calc(100vh - 240px)}.lesson-sidebar-footer{bottom:8px}}
 @media(max-width:767px){.lesson-sidebar-footer{left:20px;width:230px;bottom:12px}.aside .nav{margin-bottom:125px!important;max-height:calc(100vh - 220px)}}
 `;
 doc.head.append(sidebarStyle);
 const aside=doc.querySelector(".aside");
 if(aside){
   // Remove the entire legacy authentication block (not only its links).
   aside.querySelectorAll(".sidebar-auth-list-item,.sidebar-auth-actions,.sidebar-signin,.sidebar-signup").forEach(el=>el.remove());
   aside.querySelectorAll('a[href*="account.html"],a[href*="#signin"],a[href*="#signup"]').forEach(el=>el.remove());
   const oldFooter=aside.querySelector(".lesson-sidebar-footer");if(oldFooter)oldFooter.remove();
   const footer=doc.createElement("div");footer.className="lesson-sidebar-footer";
   footer.innerHTML='<a class="lesson-sidebar-cabinet" href="'+ROOT+'account.html"><i class="fas fa-user-circle" aria-hidden="true"></i><span>My Cabinet</span></a>';
   aside.append(footer);
   const oldSwitcher=doc.querySelector(".style-switcher");if(oldSwitcher)oldSwitcher.remove();
   const switcher=doc.createElement("div");switcher.className="style-switcher";
   switcher.innerHTML='<div class="style-switcher-toggler s-icon"><i class="fas fa-cog fa-spin"></i></div><div class="day-night s-icon"><i class="fas fa-moon"></i></div><h4>Theme Colors</h4><div class="colors"><span class="color-1" data-theme-color="color-2" aria-label="Red accent colour" title="Red accent colour"><i class="fas fa-droplet" aria-hidden="true"></i></span><span class="color-2" data-theme-color="color-1" aria-label="Blue accent colour" title="Blue accent colour"><i class="fas fa-droplet" aria-hidden="true"></i></span><span class="color-3" data-theme-color="color-3" aria-label="Green accent colour" title="Green accent colour"><i class="fas fa-droplet" aria-hidden="true"></i></span></div>';
   doc.body.append(switcher);
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

 // Load the same three accent palettes as the homepage.
 ["color-1","color-2","color-3"].forEach(function(color){
   let link=doc.querySelector('link.alternate-style[title="'+color+'"]');
   if(!link){link=doc.createElement("link");link.rel="stylesheet";link.className="alternate-style";link.title=color;link.disabled=true;doc.head.append(link);}
   link.href=ROOT+color+".css?v=20261114-sidebar-parity1";
 });
 const themeScript=doc.createElement("script");
 themeScript.src=ROOT+"theme-controller.js?v=20261114-sidebar-parity1";
 doc.body.append(themeScript);
 document.open();document.write("<!doctype html>\n"+doc.documentElement.outerHTML);document.close();
}
run().catch(e=>{console.error("Protected lesson viewer",e);message("Не удалось открыть урок",e.message||"Обновите страницу и попробуйте снова.");});
})();