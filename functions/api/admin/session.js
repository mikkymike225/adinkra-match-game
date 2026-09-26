import {json,getAdminSession} from "../../_utils/admin-auth.js";
export async function onRequestGet({request,env}){
  const session=await getAdminSession(request,env);
  return json(session?{authenticated:true,email:session.email,isOwner:session.isOwner}:{authenticated:false});
}