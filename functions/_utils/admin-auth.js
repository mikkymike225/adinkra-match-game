const json=(data,status=200,extraHeaders={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extraHeaders}});
const normalizeEmail=email=>String(email||"").trim().toLowerCase();
const cookieName="adinkra_admin_session";
const sessionTtl=60*60*24*14;
function cookieToken(request){
  const cookie=request.headers.get("cookie")||"";
  const found=cookie.split(";").map(part=>part.trim()).find(part=>part.startsWith(cookieName+"="));
  return found?decodeURIComponent(found.slice(cookieName.length+1)):"";
}
async function sha256(value){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
}
function randomHex(length=32){
  const bytes=crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
function constantTimeEqual(a,b){
  a=String(a);b=String(b);let diff=a.length^b.length;
  const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++)diff|=(a.charCodeAt(i%Math.max(1,a.length))||0)^(b.charCodeAt(i%Math.max(1,b.length))||0);
  return diff===0;
}
export async function hashPassword(password,salt=randomHex(16)){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new Uint8Array(salt.match(/.{2}/g).map(x=>parseInt(x,16))),iterations:150000,hash:"SHA-256"},key,256);
  return {salt,hash:Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,"0")).join("")};
}
export async function verifyPassword(password,record){
  if(!record?.salt||!record?.hash)return false;
  const derived=await hashPassword(password,record.salt);
  return constantTimeEqual(derived.hash,record.hash);
}
export async function startAdminSession(request,env,email,role){
  const token=randomHex(32),key="session:"+await sha256(token);
  await env.GAME_SETTINGS.put(key,JSON.stringify({email,role}),{expirationTtl:sessionTtl});
  const cookie=cookieName+"="+encodeURIComponent(token)+"; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age="+sessionTtl;
  return json({authenticated:true,email,isOwner:role==="owner"},200,{"set-cookie":cookie});
}
export async function getAdminSession(request,env){
  if(!env.GAME_SETTINGS)return null;
  const token=cookieToken(request);if(!token)return null;
  const record=await env.GAME_SETTINGS.get("session:"+await sha256(token),"json");
  if(!record||!record.email)return null;
  if(record.role==="owner"){
    return env.OWNER_EMAIL&&env.OWNER_PASSWORD&&normalizeEmail(env.OWNER_EMAIL)===record.email?{email:record.email,isOwner:true}:null;
  }
  if(record.role==="admin")return {email:record.email,isOwner:false};
  return null;
}
export function emailIsValid(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=254;}
export function adminKey(email){return "admin:"+encodeURIComponent(normalizeEmail(email));}
export {json,normalizeEmail,constantTimeEqual,cookieName,cookieToken,sha256};
