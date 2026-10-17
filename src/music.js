import {read,write} from './storage.js';
// Prism Velocity: original 16-bar score, rendered once; no event audio, samples or timers.
export const SCORE=Object.freeze({title:'Prism Velocity',key:'A minor',bpm:156,bars:16});
export const STEP=60/156/4,DURATION=STEP*256;
const HOOK=[69,null,72,76,79,76,74,null,72,74,76,81,79,null,76,72,71,null,74,77,79,77,76,74,72,null,71,69,68,71,76,null];
const ROOTS=[45,41,38,40],CHORDS=[[57,60,64],[53,57,60],[50,53,57],[52,56,59]];
const hz=n=>440*2**((n-69)/12),tau=Math.PI*2;
// Short smooth attack/release at every voice boundary; final rests make loop seamless.
export function compose(rate){
 const count=Math.round(DURATION*rate),left=new Float32Array(count),right=new Float32Array(count);
 function voice(note,start,len,amp,kind,pan=0){
 const first=Math.round(start*rate),end=Math.round((start+len)*rate),f=hz(note);
 for(let i=first;i<end;i++){
 const t=(i-first)/rate,u=t/len;const env=Math.min(1,t/.007)*Math.min(1,(len-t)/.018)*Math.exp(-2.8*u);
 const a=tau*f*t;let wave;
 if(kind==='saw')wave=(Math.sin(a)+.45*Math.sin(a*2)+.25*Math.sin(a*3)+.12*Math.sin(a*4))/.95;
 else if(kind==='tri')wave=Math.sin(a)-Math.sin(a*3)/9+Math.sin(a*5)/25;
 else if(kind==='kick')wave=Math.sin(tau*(48*t+8*(1-Math.exp(-32*t))));
 else if(kind==='metal')wave=(Math.sin(a)+Math.sin(a*1.47))*.5;
 else wave=Math.sin(a);
 const value=wave*amp*env,index=i%count;left[index]+=value*(1-pan*.6);right[index]+=value*(1+pan*.6);
 }
 }
 for(let step=0;step<256;step++){
 const at=step*STEP,bar=Math.floor(step/16),pos=step%16,ch=Math.floor(bar/2)%4,phrase=Math.floor(step/32);
 let note=HOOK[step%32];if(phrase%4===2&&note!==null)note+=12;if(phrase===7&&step%32>23)note=[76,74,72,71,69,null,null,null][step%32-24];
 if(note!==null){voice(note,at,STEP*(pos%4===0?1.55:.78),.105,'saw',-.18);voice(note,at,STEP*.75,.065,'tri',.22);}
 if(step%2===0||pos===7||pos===15)voice(ROOTS[ch]+(step%4===2?12:0),at,STEP*1.5,.22,'tri',0);
 if([2,6,11,14].includes(pos))for(let j=0;j<3;j++)voice(CHORDS[ch][j],at,STEP*1.65,.055,'saw',j===0?-.8:.8);
 if(pos%4===0)voice(33,at,.15,.29,'kick');
 if(pos%8===4){voice(86,at,.085,.07,'metal',.15);voice(50,at,.095,.09,'sine');}
 if(pos%2===1)voice(110,at,.035,.038,'metal',pos%4===1?-.55:.55);
 if(phrase%2===1&&pos===10)voice(88,at,STEP*.5,.05,'tri',.6);
 }
 return [left,right];
}
export class Music{
 constructor({storage=null,createContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)()}={}){
 this.storage=storage;this.createContext=createContext;this.enabled=read(storage,'music.enabled',true)!==false;
 const v=read(storage,'music.volume',.7);this.volume=Number.isFinite(v)?Math.max(0,Math.min(1,v)):.7;
 this.context=null;this.source=null;this.master=null;this.contextCount=0;this.sourceCount=0;this.startedAt=null;this.hidden=false;this.error=null;
 }
 async activate(){
 try{
 if(!this.context){const c=this.createContext();if(!c)return false;this.context=c;this.contextCount++;
 // Unlock while still inside the gesture, before any synchronous synthesis.
 if(!this.hidden)void c.resume().catch(()=>{});
 const rate=24000,channels=compose(rate);const buffer=c.createBuffer(2,channels[0].length,rate);channels.forEach((data,i)=>buffer.getChannelData(i).set(data));
 this.master=c.createGain();this.master.gain.value=this.enabled?this.volume*.65:0;
 this.analyser=c.createAnalyser();this.analyser.fftSize=2048;this.master.connect(this.analyser);this.analyser.connect(c.destination);
 this.source=c.createBufferSource();this.source.buffer=buffer;this.source.loop=true;this.source.connect(this.master);this.startedAt=c.currentTime;this.source.start();this.sourceCount++;
 c.onstatechange=()=>{if(c.state==='interrupted'&&!this.hidden)void c.resume().catch(()=>{});};
 }
 if(!this.hidden&&this.context.state!=='running')await this.context.resume();return true;
 }catch(e){this.error=String(e.message||e);return false;}
 }
 gain(){if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.volume*.65:0,this.context.currentTime,.025);}
 setEnabled(enabled){this.enabled=Boolean(enabled);write(this.storage,'music.enabled',this.enabled);this.gain();}
 setVolume(volume){if(!Number.isFinite(volume))return;this.volume=Math.max(0,Math.min(1,volume));write(this.storage,'music.volume',this.volume);this.gain();}
 async visibility(hidden){this.hidden=hidden;if(!this.context)return;try{if(hidden)await this.context.suspend();else await this.context.resume();}catch{/* Browser may require the next gesture. */}}
 snapshot(){return Object.freeze({contextCount:this.contextCount,sourceCount:this.sourceCount,startedAt:this.startedAt,elapsed:this.context?Math.max(0,this.context.currentTime-this.startedAt):0,phase:this.context?Math.max(0,this.context.currentTime-this.startedAt)%DURATION:0,enabled:this.enabled,volume:this.volume,state:this.context?.state||'idle',error:this.error});}
 measure(){if(!this.analyser)return {rms:0,peak:0};const a=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(a);return {rms:Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length),peak:Math.max(...a.map(Math.abs))};}
}
