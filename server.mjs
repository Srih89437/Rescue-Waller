import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { graphCapabilities, graphImpact, graphSearch } from './graphService.mjs';

const clients = new Set();
const seen = new Set();
const runtimeEvents = [];
const runtimeStartedAt = new Date().toISOString();
const allowed = new Set(['npm test', 'npm run build']);
const fixturePath = fileURLToPath(new URL('./src/fixtures/original.jsonl', import.meta.url));
const json = (res, code, value) => { res.writeHead(code, {'content-type':'application/json','access-control-allow-origin':'*'}); res.end(JSON.stringify(value)); };
const body = req => new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>256_000) reject(new Error('payload too large'));});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch{reject(new Error('invalid JSON'))}});});
function eventId(event){return event.messageId??event.eventId??`${event.session_id??event.sessionId??'unknown'}:${event.timestamp??''}:${event.type??''}`;}
function writeEvent(res,event){const id=eventId(event);res.write(`id: ${id}\ndata: ${JSON.stringify({...event,messageId:id})}\n\n`);}
function broadcast(event){const id=eventId(event);if(seen.has(id))return false;seen.add(id);runtimeEvents.push({...event,messageId:id});clients.forEach(client=>writeEvent(client,event));return true;}
function runtimeState(){const latest=runtimeEvents.at(-1);const sessionId=latest?.session_id??latest?.sessionId??'unknown-session';const sessionEvents=runtimeEvents.filter(event=>(event.session_id??event.sessionId??sessionId)===sessionId);const failed=sessionEvents.some(event=>event.type==='test_execution'&&event.success===false);const verified=sessionEvents.some(event=>event.type==='test_execution'&&event.success===true);const ended=sessionEvents.find(event=>event.type==='session_ended');return {sessionId,status:ended?(ended.success===false?'failed':'completed'):sessionEvents.length?'active':'idle',stage:ended?(ended.success===false?'failed':'verified'):failed?'failed':verified?'verified':'detected',eventCount:sessionEvents.length,lastEvent:latest??null,startedAt:runtimeStartedAt,updatedAt:latest?.timestamp??runtimeStartedAt,connectionStatus:clients.size?'CONNECTED':'DISCONNECTED'};}
function runtimeCollection(){return runtimeEvents.map(event=>({...event,id:eventId(event)}));}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url??'/',`http://${req.headers.host??'localhost'}`);
  if(req.method==='GET'&&url.pathname==='/api/health') return json(res,200,{status:'ok',transport:'sse',clients:clients.size,graph:'entire-cli'});
  if(req.method==='GET'&&url.pathname==='/api/graph/capabilities') { try{return json(res,200,await graphCapabilities())}catch(error){return json(res,503,{available:false,error:error instanceof Error?error.message:'Entire Graph unavailable'})} }
  if(req.method==='GET'&&url.pathname==='/api/graph/search') { try{return json(res,200,await graphSearch(url.searchParams.get('q')))}catch(error){return json(res,400,{available:false,error:error instanceof Error?error.message:'Graph search failed'})} }
  if(req.method==='GET'&&url.pathname==='/api/graph/impact') { try{return json(res,200,await graphImpact(url.searchParams.get('symbol')))}catch(error){return json(res,400,{available:false,error:error instanceof Error?error.message:'Graph impact analysis failed'})} }
  if(req.method==='GET'&&url.pathname==='/api/state') return json(res,200,runtimeState());
  if(req.method==='GET'&&url.pathname==='/api/incidents') return json(res,200,{items:runtimeEvents.filter(event=>event.type==='incident.detected'||event.type==='session_started')});
  if(req.method==='GET'&&url.pathname==='/api/sessions') return json(res,200,{items:[runtimeState()]});
  if(req.method==='GET'&&url.pathname==='/api/activity') return json(res,200,{items:runtimeCollection()});
  if(req.method==='GET'&&url.pathname==='/api/checkpoints') return json(res,200,{items:runtimeEvents.filter(event=>event.type==='checkpoint_created')});
  if(req.method==='GET'&&url.pathname==='/api/graph/status') { try{return json(res,200,await graphCapabilities())}catch(error){return json(res,503,{available:false,error:error instanceof Error?error.message:'Entire Graph unavailable'})} }
  if(req.method==='GET'&&url.pathname==='/api/events/stream'){res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive','access-control-allow-origin':'*'});res.write(`event: ready\ndata: ${JSON.stringify({status:url.searchParams.get('mode')==='playback'?'PLAYBACK':'CONNECTED'})}\n\n`);clients.add(res);const keepAlive=setInterval(()=>res.write(': keep-alive\n\n'),15000);req.on('close',()=>{clearInterval(keepAlive);clients.delete(res)});if(url.searchParams.get('mode')==='playback'){const records=readFileSync(fixturePath,'utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));let cursor=0;const timer=setInterval(()=>{if(cursor>=records.length){clearInterval(timer);res.write(`event: complete\ndata: {}\n\n`);return;}const event=records[cursor++];if(!seen.has(eventId(event)))broadcast(event);else writeEvent(res,event);},420);req.on('close',()=>clearInterval(timer));}return;}
  if(req.method==='POST'&&url.pathname==='/api/events'){try{const event=await body(req);if(typeof event!=='object'||Array.isArray(event)||typeof event.type!=='string')return json(res,400,{error:'event.type is required'});if(typeof (event.timestamp??'')!=='string'||Number.isNaN(Date.parse(event.timestamp)))return json(res,400,{error:'event.timestamp must be an ISO timestamp'});if(typeof (event.sessionId??event.session_id??'')!=='string')return json(res,400,{error:'event.sessionId is required'});const accepted=broadcast(event);return json(res,accepted?202:200,{accepted,id:eventId(event),state:runtimeState()});}catch(error){return json(res,400,{error:error instanceof Error?error.message:'invalid event'});}}
  if(req.method==='POST'&&url.pathname==='/api/verification/run'){try{const value=await body(req);if(typeof value.command!=='string'||!allowed.has(value.command))return json(res,400,{error:'command is not allowlisted'});const startedAt=new Date().toISOString(),start=Date.now(),[bin,...args]=value.command.split(' ');const child=spawn(bin,args,{shell:false,env:{...process.env,CI:'1'}});let stdout='',stderr='';child.stdout.on('data',c=>{stdout+=c.toString().slice(0,200_000)});child.stderr.on('data',c=>{stderr+=c.toString().slice(0,200_000)});child.on('close',exitCode=>json(res,200,{id:randomUUID(),command:value.command,status:exitCode===0?'PASSED':'FAILED',exitCode,startedAt,finishedAt:new Date().toISOString(),durationMs:Date.now()-start,stdout,stderr}));child.on('error',error=>json(res,500,{error:error.message}));return;}catch(error){return json(res,400,{error:error instanceof Error?error.message:'invalid request'});}}
  return json(res,404,{error:'not found'});
});
server.listen(Number(process.env.PORT??8787),'127.0.0.1',()=>console.log('Code Rescue transport listening on 127.0.0.1:'+Number(process.env.PORT??8787)));
