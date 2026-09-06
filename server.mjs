import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { graphCapabilities, graphImpact, graphSearch } from './graphService.mjs';

const clients = new Set();
const seen = new Set();
const allowed = new Set(['npm test', 'npm run build']);
const json = (res, code, value) => { res.writeHead(code, {'content-type':'application/json','access-control-allow-origin':'*'}); res.end(JSON.stringify(value)); };
const body = req => new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>256_000) reject(new Error('payload too large'));});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch{reject(new Error('invalid JSON'))}});});
function broadcast(event){const id=event.messageId??`${event.session_id??'unknown'}:${event.timestamp??''}:${event.type??''}`;if(seen.has(id))return false;seen.add(id);const message=`data: ${JSON.stringify(event)}\n\n`;clients.forEach(client=>client.write(message));return true;}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url??'/',`http://${req.headers.host??'localhost'}`);
  if(req.method==='GET'&&url.pathname==='/api/health') return json(res,200,{status:'ok',transport:'sse',clients:clients.size,graph:'entire-cli'});
  if(req.method==='GET'&&url.pathname==='/api/graph/capabilities') { try{return json(res,200,await graphCapabilities())}catch(error){return json(res,503,{available:false,error:error instanceof Error?error.message:'Entire Graph unavailable'})} }
  if(req.method==='GET'&&url.pathname==='/api/graph/search') { try{return json(res,200,await graphSearch(url.searchParams.get('q')))}catch(error){return json(res,400,{available:false,error:error instanceof Error?error.message:'Graph search failed'})} }
  if(req.method==='GET'&&url.pathname==='/api/graph/impact') { try{return json(res,200,await graphImpact(url.searchParams.get('symbol')))}catch(error){return json(res,400,{available:false,error:error instanceof Error?error.message:'Graph impact analysis failed'})} }
  if(req.method==='GET'&&url.pathname==='/api/events/stream'){res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive','access-control-allow-origin':'*'});res.write(`event: ready\ndata: ${JSON.stringify({status:'connected'})}\n\n`);clients.add(res);req.on('close',()=>clients.delete(res));return;}
  if(req.method==='POST'&&url.pathname==='/api/events'){try{const event=await body(req);if(typeof event!=='object'||Array.isArray(event)||typeof event.type!=='string')return json(res,400,{error:'event.type is required'});return json(res,202,{accepted:broadcast(event)});}catch(error){return json(res,400,{error:error instanceof Error?error.message:'invalid event'});}}
  if(req.method==='POST'&&url.pathname==='/api/verification/run'){try{const value=await body(req);if(typeof value.command!=='string'||!allowed.has(value.command))return json(res,400,{error:'command is not allowlisted'});const startedAt=new Date().toISOString(),start=Date.now(),[bin,...args]=value.command.split(' ');const child=spawn(bin,args,{shell:false,env:{...process.env,CI:'1'}});let stdout='',stderr='';child.stdout.on('data',c=>{stdout+=c.toString().slice(0,200_000)});child.stderr.on('data',c=>{stderr+=c.toString().slice(0,200_000)});child.on('close',exitCode=>json(res,200,{id:randomUUID(),command:value.command,status:exitCode===0?'PASSED':'FAILED',exitCode,startedAt,finishedAt:new Date().toISOString(),durationMs:Date.now()-start,stdout,stderr}));child.on('error',error=>json(res,500,{error:error.message}));return;}catch(error){return json(res,400,{error:error instanceof Error?error.message:'invalid request'});}}
  return json(res,404,{error:'not found'});
});
server.listen(Number(process.env.PORT??8787),'127.0.0.1',()=>console.log('Code Rescue transport listening on 127.0.0.1:'+Number(process.env.PORT??8787)));
