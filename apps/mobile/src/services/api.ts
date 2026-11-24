import type {Task,AcademicRecord} from '../models/types';
import {supabase,supabaseUrl} from './supabase';
export const apiSettings={get:()=>supabaseUrl,set:(_value:string)=>{}};
async function uid(){const {data,error}=await supabase.auth.getSession();if(error||!data.session)throw new Error('Sesión requerida');return data.session.user.id;}
function check(error:{message:string}|null){if(error)throw new Error(error.message);}
export const api={
 async health(){const {error}=await supabase.from('tasks').select('id').limit(1);check(error);return {ok:true};},
 async listTasks():Promise<Task[]>{const user=await uid();const {data,error}=await supabase.from('tasks').select('*').eq('user_id',user);check(error);return (data||[]).map(r=>({id:r.id,title:r.title,description:r.description||'',category:r.category||'Académica',priority:r.priority,dueDate:r.due_date||'',completed:!!r.completed,deleted:!!r.deleted,createdAt:r.created_at,updatedAt:r.updated_at,syncState:'synced'}));},
 async saveTask(t:Task){const user=await uid();const {error}=await supabase.from('tasks').upsert({id:t.id,user_id:user,title:t.title,description:t.description,category:t.category,priority:t.priority,due_date:t.dueDate||null,completed:t.completed,deleted:t.deleted,created_at:t.createdAt,updated_at:t.updatedAt});check(error);return t;},
 async deleteTask(id:string){const user=await uid();const {error}=await supabase.from('tasks').update({deleted:true,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',user);check(error);},
 async listAcademic():Promise<AcademicRecord[]>{const user=await uid();const {data,error}=await supabase.from('academic_sync').select('payload').eq('user_id',user);check(error);return (data||[]).map(r=>({...r.payload,syncState:'synced'}));},
 async saveAcademic(r:AcademicRecord){const user=await uid();const {error}=await supabase.from('academic_sync').upsert({id:r.id,user_id:user,payload:r,updated_at:r.updatedAt});check(error);return r;},
 async deleteAcademic(id:string){const user=await uid();const {data,error}=await supabase.from('academic_sync').select('payload').eq('id',id).eq('user_id',user).maybeSingle();check(error);if(data){const now=new Date().toISOString();const result=await supabase.from('academic_sync').update({payload:{...data.payload,deleted:true,updatedAt:now},updated_at:now}).eq('id',id).eq('user_id',user);check(result.error);}}
};
