import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
export function createApp(dbPath=process.env.DB_PATH||'task-api.db'){
 const app=express();app.use(cors());app.use(express.json({limit:'256kb'}));
 const db=new Database(dbPath);
 db.pragma('journal_mode = WAL');
 db.exec('CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(kind,id))');
 const get=db.prepare('SELECT payload FROM records WHERE kind=? AND id=?');
 const list=db.prepare('SELECT payload FROM records WHERE kind=?');
 const save=db.prepare('INSERT OR REPLACE INTO records (kind,id,payload) VALUES (?,?,?)');
 function entity(kind){return kind==='tasks'||kind==='academic';}
 app.get('/health',(_req,res)=>res.json({ok:true,service:'task-universitario-api',time:new Date().toISOString()}));
 app.get('/api/:kind',(req,res)=>{if(!entity(req.params.kind))return res.status(404).json({error:'Recurso desconocido'});res.json(list.all(req.params.kind).map(r=>JSON.parse(r.payload)));});
 app.get('/api/:kind/:id',(req,res)=>{if(!entity(req.params.kind))return res.status(404).json({error:'Recurso desconocido'});const row=get.get(req.params.kind,req.params.id);return row?res.json(JSON.parse(row.payload)):res.status(404).json({error:'No encontrado'});});
 app.post('/api/:kind',(req,res)=>{if(!entity(req.params.kind))return res.status(404).json({error:'Recurso desconocido'});const data=req.body;if(!data||typeof data.id!=='string'||typeof data.title!=='string'||!data.title.trim())return res.status(400).json({error:'ID y título obligatorios'});if(get.get(req.params.kind,data.id))return res.status(409).json({error:'Registro existente'});save.run(req.params.kind,data.id,JSON.stringify(data));res.status(201).json(data);});
 app.put('/api/:kind/:id',(req,res)=>{if(!entity(req.params.kind))return res.status(404).json({error:'Recurso desconocido'});const data=req.body;if(!data||data.id!==req.params.id||typeof data.title!=='string'||!data.title.trim())return res.status(400).json({error:'Registro inválido'});const row={...data,deleted:!!data.deleted};save.run(req.params.kind,req.params.id,JSON.stringify(row));res.json(row);});
 app.patch('/api/:kind/:id',(req,res)=>{if(!entity(req.params.kind))return res.status(404).json({error:'Recurso desconocido'});const old=get.get(req.params.kind,req.params.id);if(!old)return res.status(404).json({error:'No encontrado'});const data={...JSON.parse(old.payload),...req.body,id:req.params.id,updatedAt:new Date().toISOString()};save.run(req.params.kind,req.params.id,JSON.stringify(data));res.json(data);});
 app.delete('/api/:kind/:id',(req,res)=>{if(!entity(req.params.kind))return res.status(404).json({error:'Recurso desconocido'});const old=get.get(req.params.kind,req.params.id);if(old){const data={...JSON.parse(old.payload),deleted:true,updatedAt:new Date().toISOString()};save.run(req.params.kind,req.params.id,JSON.stringify(data));}res.status(204).end();});
 app.use((err,req,res,_next)=>{console.error('API_ERROR',err);res.status(500).json({error:'Error interno del servidor'});});
 return {app,db};
}
