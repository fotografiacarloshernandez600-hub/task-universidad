import initSqlJs, {type Database} from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type {Task, AcademicRecord,LogEntry} from '../models/types';
type Table='tasks'|'academic'|'logs';
let web:Database|undefined;
let native:CordovaDb|undefined;
let dbReady:Promise<void>|undefined;
let owner='';
export function setLocalOwner(uid:string){if(owner&&owner!==uid)throw new Error('Reinicia la aplicación para cambiar de cuenta');owner=uid;}
const dbName=()=>{if(!owner)throw new Error('Sesión requerida');return 'task-universitario-'+owner;};
const schema=['CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, payload TEXT NOT NULL)','CREATE TABLE IF NOT EXISTS academic (id TEXT PRIMARY KEY, payload TEXT NOT NULL)','CREATE TABLE IF NOT EXISTS logs (id TEXT PRIMARY KEY, payload TEXT NOT NULL)'];
function requestDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(dbName(),1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function readBytes():Promise<Uint8Array|undefined>{const db=await requestDb();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readonly');const req=tx.objectStore('files').get('sqlite');req.onsuccess=()=>{db.close();resolve(req.result ? new Uint8Array(req.result) : undefined);};req.onerror=()=>{db.close();reject(req.error);};});}
async function storeBytes(bytes:Uint8Array):Promise<void>{const db=await requestDb();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(bytes,'sqlite');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
function transact(sql:string,params:unknown[]=[]):Promise<Record<string,unknown>[]> {return new Promise((resolve,reject)=>native!.transaction(tx=>tx.executeSql(sql,params,(_,r)=>{const out:Record<string,unknown>[]=[];for(let i=0;i<r.rows.length;i++)out.push(r.rows.item(i));resolve(out);},(_,e)=>{reject(new Error(e.message));}),e=>reject(new Error(e.message))));}
async function open(){if(window.cordova){if(!window.sqlitePlugin)throw new Error('Plugin SQLite no disponible; revise instalación de Cordova.');native=await new Promise<CordovaDb>((resolve,reject)=>window.sqlitePlugin!.openDatabase({name:dbName()+'.db',location:'default'},resolve,e=>reject(new Error(e.message))));for(const sql of schema)await transact(sql);}else{const SQL=await initSqlJs({locateFile:()=>wasmUrl,useOldExtensionFunctions:false});const saved=await readBytes();web=saved?new SQL.Database(saved):new SQL.Database();for(const sql of schema)web.run(sql);await storeBytes(web.export());}}
export function initDb(){return dbReady ||= open().catch(e=>{dbReady=undefined;throw e;});}
export async function listRows<T>(table:Table):Promise<T[]>{await initDb();if(native){return (await transact('SELECT payload FROM '+table)).map(row=>JSON.parse(String(row.payload)) as T);}const result=web!.exec('SELECT payload FROM '+table);return (result[0]?.values||[]).map(row=>JSON.parse(String(row[0])) as T);}
let writeQueue=Promise.resolve();
export function putRow(table:Table,item:{id:string}):Promise<void>{const job=writeQueue.then(async()=>{await initDb();const query='INSERT OR REPLACE INTO '+table+' (id,payload) VALUES (?,?)';const args=[item.id,JSON.stringify(item)];if(native)await transact(query,args);else{web!.run(query,args);await storeBytes(web!.export());}});writeQueue=job.catch(()=>{});return job;}
export function deleteRow(table:Table,id:string):Promise<void>{const job=writeQueue.then(async()=>{await initDb();if(native)await transact('DELETE FROM '+table+' WHERE id=?',[id]);else{web!.run('DELETE FROM '+table+' WHERE id=?',[id]);await storeBytes(web!.export());}});writeQueue=job.catch(()=>{});return job;}
export const local={tasks:()=>listRows<Task>('tasks'),academic:()=>listRows<AcademicRecord>('academic'),logs:()=>listRows<LogEntry>('logs'),saveTask:(t:Task)=>putRow('tasks',t),saveAcademic:(a:AcademicRecord)=>putRow('academic',a)};
