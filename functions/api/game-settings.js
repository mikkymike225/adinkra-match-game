import {json,getAdminSession} from "../_utils/admin-auth.js";
const DEFAULTS={thresholdsEnabled:true};
export async function onRequestGet({env}){
  if(!env.GAME_SETTINGS)return json(DEFAULTS);
  const saved=await env.GAME_SETTINGS.get("progression");
  if(!saved)return json(DEFAULTS);
  try{return json({...DEFAULTS,...JSON.parse(saved)})}catch{return json(DEFAULTS)}
}
export async function onRequestPost({request,env}){
  if(!env.GAME_SETTINGS)return json({error:"Admin settings storage is not configured yet."},503);
  if(!await getAdminSession(request,env))return json({error:"Sign in as an admin to change settings."},401);
  let body;try{body=await request.json()}catch{return json({error:"Invalid settings request."},400)}
  if(typeof body.thresholdsEnabled!=="boolean")return json({error:"Choose whether score thresholds are on or off."},400);
  const settings={thresholdsEnabled:body.thresholdsEnabled};
  await env.GAME_SETTINGS.put("progression",JSON.stringify(settings));
  return json(settings);
}