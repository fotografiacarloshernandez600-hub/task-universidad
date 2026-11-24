import {api} from './api';
import {local} from './localDb';
import {logEvent} from './logger';
import type {Task,AcademicRecord} from '../models/types';
export type SyncResult={uploaded:number;downloaded:number;pending:number};
let inFlight:Promise<SyncResult>|undefined;
export async function syncAll():Promise<SyncResult>{
 if(inFlight)return inFlight;
 inFlight=run().finally(()=>{inFlight=undefined;});
 return inFlight;
}
async function run():Promise<SyncResult>{
 if(!navigator.onLine)throw new Error('Sin conexión. Los cambios siguen guardados localmente.');
 let uploaded=0,downloaded=0;
 try{
  await api.health();
  for(const task of (await local.tasks()).filter(t=>t.syncState==='pending')){
    if(task.deleted)await api.deleteTask(task.id);else await api.saveTask(task);
    await local.saveTask({...task,syncState:'synced'});uploaded++;
  }
  for(const row of (await local.academic()).filter(x=>x.syncState==='pending')){
    if(row.deleted)await api.deleteAcademic(row.id);else await api.saveAcademic(row);
    await local.saveAcademic({...row,syncState:'synced'});uploaded++;
  }
  const remoteTasks=await api.listTasks();
  const localTasks=new Map((await local.tasks()).map(t=>[t.id,t]));
  for(const remote of remoteTasks){const previous=localTasks.get(remote.id);if(!previous || (previous.syncState==='synced' && previous.updatedAt<remote.updatedAt)){await local.saveTask({...remote,syncState:'synced'} as Task);downloaded++;}}
  const remoteAcademic=await api.listAcademic();
  const localAcademic=new Map((await local.academic()).map(a=>[a.id,a]));
  for(const remote of remoteAcademic){const previous=localAcademic.get(remote.id);if(!previous || (previous.syncState==='synced' && previous.updatedAt<remote.updatedAt)){await local.saveAcademic({...remote,syncState:'synced'} as AcademicRecord);downloaded++;}}
  const pending=(await local.tasks()).filter(x=>x.syncState==='pending').length+(await local.academic()).filter(x=>x.syncState==='pending').length;
  await logEvent('info','SYNC_OK',uploaded+' enviados, '+downloaded+' recibidos');return {uploaded,downloaded,pending};
 }catch(err){await logEvent('error','SYNC_FAILURE',String(err));throw err;}
}
