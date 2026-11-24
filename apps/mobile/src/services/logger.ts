import {local,putRow} from './localDb';
import type {LogEntry} from '../models/types';
export async function logEvent(level:LogEntry['level'],action:string,detail:string=''){const row:LogEntry={id:crypto.randomUUID(),date:new Date().toISOString(),level,action,detail};try{await putRow('logs',row);}catch(e){console.error('LOG_FAILURE',e);}if(level==='error')console.error(action,detail);}
export const readLogs=async()=>(await local.logs()).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,150);
