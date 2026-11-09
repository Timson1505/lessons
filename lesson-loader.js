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
 doc.head.querySelectorAll('meta[name="robots"]').forEach(x=>x.remove());const robots=doc.createElement("meta");robots.name="robots";robots.content="noindex,nofollow,noarchive";doc.head.append(robots);
 const refs=[];
 for(const el of doc.querySelectorAll("[src],[poster]"))for(const attr of ["src","poster"]){const p=resolveMedia(el.getAttribute(attr),dir);if(p)refs.push({el,attr,path:p});}
 for(const el of doc.querySelectorAll("[srcset]"))for(const part of el.getAttribute("srcset").split(",")){const p=resolveMedia(part.trim().split(/\s+/)[0],dir);if(p)refs.push({el,attr:"srcset-media",path:p});}
 const paths=[...new Set(refs.map(x=>x.path))], blobs=new Map();let cursor=0;
 async function worker(){while(cursor<paths.length){const p=paths[cursor++],{data:file,error:storageError}=await db.storage.from("lesson-media").download(p);if(storageError||!file)throw Error("Защищённый файл недоступен: "+p);blobs.set(p,URL.createObjectURL(file));}}
 await Promise.all(Array.from({length:Math.min(5,paths.length)},worker));
 for(const r of refs)if(r.attr!=="srcset-media")r.el.setAttribute(r.attr,blobs.get(r.path));
 for(const el of doc.querySelectorAll("[srcset]")){const entries=el.getAttribute("srcset").split(",").map(part=>{const bits=part.trim().split(/\s+/),p=resolveMedia(bits[0],dir);return p?[blobs.get(p),...bits.slice(1)].join(" "):part.trim();});el.setAttribute("srcset",entries.join(", "));}
 doc.title=data[0].title||doc.title||"Timson’s English Lessons";
 document.open();document.write("<!doctype html>\n"+doc.documentElement.outerHTML);document.close();
}
run().catch(e=>{console.error("Protected lesson viewer",e);message("Не удалось открыть урок",e.message||"Обновите страницу и попробуйте снова.");});
})();