import {json,getAdminSession,normalizeEmail,emailIsValid,hashPassword,adminKey} from "../../_utils/admin-auth.js";
async function owner(request,env){const session=await getAdminSession(request,env);return session?.isOwner?session:null}
async function readBody(request){try{return await request.json()}catch{return null}}
async function listAdmins(env){
  const admins=[];let cursor;
  do{
    const page=await env.GAME_SETTINGS.list({prefix:"admin:",cursor});
    for(const key of page.keys){const record=await env.GAME_SETTINGS.get(key.name,"json");if(record?.email)admins.push(record.email);}
    cursor=page.list_complete?undefined:page.cursor;
  }while(cursor);
  return admins.sort((a,b)=>a.localeCompare(b));
}
export async function onRequestGet({request,env}){
  if(!env.GAME_SETTINGS)return json({error:"Admin storage is not configured."},503);
  if(!await owner(request,env))return json({error:"Owner access required."},403);
  return json({admins:await listAdmins(env)});
}
export async function onRequestPost({request,env}){
  if(!env.GAME_SETTINGS)return json({error:"Admin storage is not configured."},503);
  if(!await owner(request,env))return json({error:"Owner access required."},403);
  const body=await readBody(request);if(!body)return json({error:"Invalid request."},400);
  const email=normalizeEmail(body.email),password=String(body.password||"");
  if(!emailIsValid(email))return json({error:"Enter a valid email address."},400);
  if(password.length<12)return json({error:"Use a password with at least 12 characters."},400);
  if(email===normalizeEmail(env.OWNER_EMAIL))return json({error:"The owner account is already configured."},409);
  if(await env.GAME_SETTINGS.get(adminKey(email)))return json({error:"An admin account already uses that email."},409);
  const admins=await listAdmins(env);if(admins.length>=20)return json({error:"The admin limit is 20 accounts."},400);
  const credentials=await hashPassword(password);
  await env.GAME_SETTINGS.put(adminKey(email),JSON.stringify({email,...credentials}));
  return json({ok:true,email},201);
}
export async function onRequestDelete({request,env}){
  if(!env.GAME_SETTINGS)return json({error:"Admin storage is not configured."},503);
  if(!await owner(request,env))return json({error:"Owner access required."},403);
  const body=await readBody(request);if(!body)return json({error:"Invalid request."},400);
  const email=normalizeEmail(body.email);
  if(!emailIsValid(email))return json({error:"Enter a valid admin email."},400);
  if(email===normalizeEmail(env.OWNER_EMAIL))return json({error:"The owner account cannot be removed here."},400);
  await env.GAME_SETTINGS.delete(adminKey(email));
  let cursor;
  do{
    const page=await env.GAME_SETTINGS.list({prefix:"session:",cursor});
    for(const key of page.keys){
      const record=await env.GAME_SETTINGS.get(key.name,"json");
      if(record?.email===email)await env.GAME_SETTINGS.delete(key.name);
    }
    cursor=page.list_complete?undefined:page.cursor;
  }while(cursor);
  return json({ok:true});
}