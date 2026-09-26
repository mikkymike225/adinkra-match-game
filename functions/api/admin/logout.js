import {json,cookieName,cookieToken,sha256} from "../../_utils/admin-auth.js";
export async function onRequestPost({request,env}){
  const token=cookieToken(request);
  if(token&&env.GAME_SETTINGS)await env.GAME_SETTINGS.delete("session:"+await sha256(token));
  return json({ok:true},200,{"set-cookie":cookieName+"=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"});
}