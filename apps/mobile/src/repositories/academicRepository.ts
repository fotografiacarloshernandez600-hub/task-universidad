import type {AcademicInput,AcademicRecord,Task,TaskInput} from '../models/types';
import {local} from '../services/localDb';
import {logEvent} from '../services/logger';
const now=()=>new Date().toISOString();
export const taskRepository={
 list:async()=>(await local.tasks()).filter(x=>!x.deleted).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)),
 async create(input:TaskInput){const date=now();const data:Task={...input,id:crypto.randomUUID(),completed:false,createdAt:date,updatedAt:date,deleted:false,syncState:'pending'};await local.saveTask(data);await logEvent('info','TASK_CREATE',data.title);return data;},
 async update(record:Task,patch:Partial<TaskInput>&{completed?:boolean}){const data:Task={...record,...patch,updatedAt:now(),syncState:'pending'};await local.saveTask(data);await logEvent('info','TASK_UPDATE',data.title);return data;},
 async remove(record:Task){await local.saveTask({...record,deleted:true,syncState:'pending',updatedAt:now()});await logEvent('info','TASK_DELETE',record.title);}
};
export const academicRepository={
 list:async()=>(await local.academic()).filter(x=>!x.deleted).sort((a,b)=>a.registrationDate.localeCompare(b.registrationDate)),
 async create(input:AcademicInput){const date=now();const data:AcademicRecord={...input,id:crypto.randomUUID(),createdAt:date,updatedAt:date,deleted:false,syncState:'pending'};await local.saveAcademic(data);await logEvent('info','ACADEMIC_CREATE',data.title);return data;},
 async update(record:AcademicRecord,patch:Partial<AcademicInput>){const data:AcademicRecord={...record,...patch,updatedAt:now(),syncState:'pending'};await local.saveAcademic(data);await logEvent('info','ACADEMIC_UPDATE',data.title);return data;},
 async remove(record:AcademicRecord){await local.saveAcademic({...record,deleted:true,updatedAt:now(),syncState:'pending'});await logEvent('info','ACADEMIC_DELETE',record.title);}
};
