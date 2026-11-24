import {useCallback,useEffect,useState} from 'react';
import type {AcademicInput,AcademicRecord,LogEntry,Task,TaskInput} from '../models/types';
import {taskRepository,academicRepository} from '../repositories/academicRepository';
import {local} from '../services/localDb';
import {readLogs,logEvent} from '../services/logger';
import {syncAll} from '../services/sync';
export function useAcademic(){
 const [tasks,setTasks]=useState<Task[]>([]);
 const [academic,setAcademic]=useState<AcademicRecord[]>([]);
 const [logs,setLogs]=useState<LogEntry[]>([]);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [online,setOnline]=useState(navigator.onLine);
 const refresh=useCallback(async()=>{try{const [t,a,l]=await Promise.all([taskRepository.list(),academicRepository.list(),readLogs()]);setTasks(t);setAcademic(a);setLogs(l);}catch(e){setMessage('Error local: '+String(e));}},[]);
 const sync=useCallback(async()=>{if(!navigator.onLine){setOnline(false);setMessage('Sin Internet: los cambios están guardados localmente.');return;}setBusy(true);try{const r=await syncAll();await refresh();setMessage('Sincronización: '+r.uploaded+' enviados, '+r.downloaded+' recibidos.');}catch(e){setMessage('Servidor no disponible. Datos locales conservados.');}finally{setBusy(false);}},[refresh]);
 useEffect(()=>{void refresh();if(navigator.onLine)void sync();const onOnline=()=>{setOnline(true);void sync();};const onOffline=()=>setOnline(false);window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);return()=>{window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline);};},[refresh,sync]);
 async function apply(action:()=>Promise<unknown>){try{await action();await refresh();setMessage('Guardado localmente; pendiente de sincronización.');if(navigator.onLine)void sync();}catch(e){await logEvent('error','SAVE_FAILURE',String(e));setMessage('No se pudo guardar: '+String(e));}}
 const createTask=(input:TaskInput)=>apply(()=>taskRepository.create(input));
 const editTask=(row:Task,input:Partial<TaskInput>&{completed?:boolean})=>apply(()=>taskRepository.update(row,input));
 const removeTask=(row:Task)=>apply(()=>taskRepository.remove(row));
 const createAcademic=(input:AcademicInput)=>apply(()=>academicRepository.create(input));
 const editAcademic=(row:AcademicRecord,input:Partial<AcademicInput>)=>apply(()=>academicRepository.update(row,input));
 const removeAcademic=(row:AcademicRecord)=>apply(()=>academicRepository.remove(row));
 const createPlan=async(total:4|8,date:string)=>{await apply(async()=>{for(let i=1;i<=total;i++){const exists=(await local.academic()).some(x=>!x.deleted&&x.kind==='ingles'&&x.totalModules===total&&x.moduleNumber===i);if(!exists){await academicRepository.create({kind:'ingles',title:'Inglés '+i,institution:'UJAT',program:'Programa de inglés',moduleNumber:i,totalModules:total,teacher:'',location:'',days:[],startTime:'',endTime:'',registrationDate:date,startDate:'',endDate:'',grade:'',status:'pendiente',certificateStatus:'pendiente',certificateDate:'',notes:''});}}});};
 return {tasks,academic,logs,message,setMessage,busy,online,refresh,sync,createTask,editTask,removeTask,createAcademic,editAcademic,removeAcademic,createPlan};
}
