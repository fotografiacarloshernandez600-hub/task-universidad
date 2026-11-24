export type Priority='alta'|'media'|'baja';
export type SyncState='pending'|'synced';
export type Task={id:string;title:string;description:string;category:string;priority:Priority;dueDate:string;completed:boolean;createdAt:string;updatedAt:string;syncState:SyncState;deleted:boolean};
export type TaskInput=Pick<Task,'title'|'description'|'category'|'priority'|'dueDate'>;
export type AcademicKind='ingles'|'complementaria';
export type AcademicRecord={id:string;kind:AcademicKind;title:string;institution:string;program:string;moduleNumber:number|null;totalModules:number|null;teacher:string;location:string;days:string[];startTime:string;endTime:string;registrationDate:string;startDate:string;endDate:string;grade:string;status:'pendiente'|'inscrito'|'cursando'|'acreditado'|'no_acreditado';certificateStatus:'pendiente'|'solicitada'|'obtenida';certificateDate:string;notes:string;createdAt:string;updatedAt:string;syncState:SyncState;deleted:boolean};
export type AcademicInput=Omit<AcademicRecord,'id'|'createdAt'|'updatedAt'|'syncState'|'deleted'>;
export type LogEntry={id:string;date:string;level:'info'|'warning'|'error';action:string;detail:string};
