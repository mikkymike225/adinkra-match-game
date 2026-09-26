import {json,normalizeEmail,emailIsValid,constantTimeEqual,verifyPassword,startAdminSession,adminKey} from "../../_utils/admin-auth.js";
export async function onRequestPost({request,env}){
  if(!env.GAME_SETTINGS||!env.OWNER_EMAIL||!env.OWNER_PASSWORD)return json({error:"Admin sign-in is not configured yet."},503);
  let body;try{body=await request.json()}catch{return json({error:"Enter your email and password."},400)}
  const email=normalizeEmail(body.email),password=String(body.password||"");
  if(!emailIsValid(email)||!password)return json({error:"Email or password is incorrect."},401);
  const owner=normalizeEmail(env.OWNER_EMAIL)===email&&constantTimeEqual(password,env.OWNER_PASSWORD);
  if(owner)return startAdminSession(request,env,email,"owner");
  const admin=await env.GAME_SETTINGS.get(adminKey(email),"json");
  if(admin&&await verifyPassword(password,admin))return startAdminSession(request,env,email,"admin");
  return json({error:"Email or password is incorrect."},401);
}