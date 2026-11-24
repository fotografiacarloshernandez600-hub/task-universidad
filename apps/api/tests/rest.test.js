import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/app.js';
const {app,db}=createApp(':memory:');
const server=app.listen(0);
after(()=>{server.close();db.close();});
const base=()=> 'http://127.0.0.1:'+server.address().port;
test('CRUD API REST y persistencia SQLite del servidor',async()=>{
 const payload={id:'id-1',title:'Actividad de prueba',description:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),deleted:false};
 let r=await fetch(base()+'/health');assert.equal(r.status,200);
 r=await fetch(base()+'/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});assert.equal(r.status,201);
 r=await fetch(base()+'/api/tasks');assert.equal((await r.json()).length,1);
 r=await fetch(base()+'/api/tasks/id-1',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Actividad editada'})});assert.equal((await r.json()).title,'Actividad editada');
 r=await fetch(base()+'/api/tasks/id-1',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,title:'Tarea actualizada'})});assert.equal(r.status,200);
 r=await fetch(base()+'/api/tasks/id-1',{method:'DELETE'});assert.equal(r.status,204);
 r=await fetch(base()+'/api/tasks/id-1');assert.equal((await r.json()).deleted,true);
});
