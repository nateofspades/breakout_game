import {Game,W,H} from './rules.js';import {Music} from './music.js';import {read,record} from './storage.js';
const $=id=>document.getElementById(id),canvas=$('game'),g=new Game();let ctx=canvas.getContext('2d');const displayCtx=ctx,staticLayer=document.createElement('canvas');let staticKey='';
let storage;try{storage=localStorage;}catch{storage=null;}
const music=new Music({storage});let best=read(storage,'best',0);if(!Number.isFinite(best)||best<0)best=0;
const keys=new Set(),names=['Chromatic Dawn','Diamond Run','Crosscurrent','Split Horizon','The Last Prism'];let last=0,acc=0,lastMode='',lastScore=-1,trail=[];
g.loadLevel();g.mode='menu';
Object.defineProperty(window,'prismAudio',{value:Object.freeze({snapshot:()=>music.snapshot(),measure:()=>Object.freeze(music.measure())}),writable:false});
Object.defineProperty(window,'prismState',{value:()=>structuredClone({mode:g.mode,level:g.level,score:g.score,lives:g.lives,paddle:g.paddle,balls:g.balls,effects:g.effects}),writable:false});
if(['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('test')==='1'){
 Object.defineProperty(window,'prismTest',{value:Object.freeze({scenario(name){
 if(name==='score'){g.mode='playing';g.bricks=[{x:325,y:210,w:68,h:26,hp:1,max:1,row:0}];g.balls=[{x:350,y:250,r:8,vx:80,vy:-390}];}
 if(name==='last'){g.mode='playing';g.lives=1;g.balls=[{x:80,y:920,r:8,vx:80,vy:300}];}
 if(name==='victory'){g.level=4;g.mode='playing';g.bricks=[];}
 if(name==='complete'){g.mode='playing';g.bricks=[];}
 if(name==='power'){g.power('wide');g.power('slow');g.power('multi');}
 },visibility:hidden=>{if(hidden&&['playing','ready'].includes(g.mode))g.pause();keys.clear();return music.visibility(hidden);}})});
}
function activate(){void music.activate();}
function text(id,value){if($(id).textContent!==value)$(id).textContent=value;}
function sync(){
 if(g.score!==lastScore){lastScore=g.score;if(g.score>best){best=record(storage,g.score);} $('score').textContent=String(g.score).padStart(6,'0');$('best').textContent=String(best).padStart(6,'0');}
 text('level',String(g.level+1).padStart(2,'0')+' / 05');text('lives',Array(g.lives).fill('♥').join(' '));
 text('effect',[g.effects.wide>0?'WIDE '+Math.ceil(g.effects.wide)+'s':'',g.effects.slow>0?'SLOW '+Math.ceil(g.effects.slow)+'s':'',g.balls.length>1?g.balls.length+' BALLS':''].filter(Boolean).join('   /   '));
 if(g.mode===lastMode)return;lastMode=g.mode;trail=[];
 $('pause').disabled=!['playing','ready','paused'].includes(g.mode);$('pause').textContent=g.mode==='paused'?'Resume':'Pause';$('launch').disabled=g.mode!=='ready';
 const status={menu:'STANDBY',ready:'SPACE / TAP LAUNCH',playing:'IN PLAY',paused:'PAUSED',complete:'SECTOR CLEAR',gameover:'GAME OVER',victory:'VICTORY'};$('status').textContent=status[g.mode];
 $('overlay').hidden=['playing','ready'].includes(g.mode);
 const screens={menu:['A NEON DESCENT','Break the<br>ordinary.','Five prism formations.<br>Three lives. All velocity.','Start run'],paused:['TAKE A BREATH','On hold.','Your run is safe.<br>Resume when you’re ready.','Resume run'],complete:['SECTOR '+String(g.level+1).padStart(2,'0')+' / COMPLETE','Spectrum<br>cleared.','Next: '+names[g.level+1]+'<br>Faster balls. Stronger prisms.','Continue'],gameover:['SIGNAL LOST','Game Over','Score '+g.score+' · Record '+best+'<br>There’s always another afterglow.','Try again'],victory:['ALL FIVE / COMPLETE','Pure<br>Velocity.','Victory! Score '+g.score+'<br>You broke the entire spectrum.','Play again']};
 const s=screens[g.mode];if(s){$('eyebrow').textContent=s[0];$('title').innerHTML=s[1];$('message').innerHTML=s[2];$('primary').textContent=s[3];}
}
$('primary').addEventListener('click',()=>{activate();if(g.mode==='paused')g.pause();else if(g.mode==='complete')g.next();else g.start();sync();});
$('launch').addEventListener('click',()=>{activate();g.launch();sync();});
$('pause').addEventListener('click',()=>{activate();g.pause();keys.clear();sync();});
$('restart').addEventListener('click',()=>{activate();keys.clear();g.start();sync();});
function audioUI(){$('music').textContent=music.enabled?'Music On':'Music Off';$('music').setAttribute('aria-pressed',String(music.enabled));$('volume').value=String(Math.round(music.volume*100));}
$('music').addEventListener('click',()=>{activate();music.setEnabled(!music.enabled);audioUI();});
$('volume').addEventListener('input',e=>{activate();music.setVolume(Number(e.target.value)/100);});audioUI();
window.addEventListener('keydown',e=>{
 if(e.target instanceof HTMLInputElement||e.ctrlKey||e.metaKey||e.altKey)return;
 const k=e.key.toLowerCase();if(!['arrowleft','arrowright','a','d',' ','p','escape'].includes(k))return;
 if(k===' '&&e.target instanceof HTMLButtonElement&&!e.target.disabled&&e.target.offsetParent)return;
 if(['playing','ready','paused'].includes(g.mode)){e.preventDefault();activate();if(!e.repeat){if(k===' ')g.launch();if(k==='p'||k==='escape'){g.pause();keys.clear();}}if(['arrowleft','arrowright','a','d'].includes(k))keys.add(k);sync();}
});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&['playing','ready'].includes(g.mode)){const r=canvas.getBoundingClientRect();g.move((e.clientX-r.left)/r.width*W);}});
let pointer=null;const strip=$('drag');function drag(e){const r=strip.getBoundingClientRect();g.move((e.clientX-r.left)/r.width*W);}
strip.addEventListener('pointerdown',e=>{if(!['playing','ready'].includes(g.mode))return;activate();pointer=e.pointerId;strip.setPointerCapture(pointer);drag(e);});strip.addEventListener('pointermove',e=>{if(e.pointerId===pointer)drag(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])strip.addEventListener(type,()=>pointer=null);
function blur(){keys.clear();pointer=null;if(['playing','ready'].includes(g.mode)){g.pause();sync();}}
window.addEventListener('blur',blur);document.addEventListener('visibilitychange',()=>{if(document.hidden)blur();void music.visibility(document.hidden);last=0;acc=0;});
function resize(){const arena=document.querySelector('.arena'),r=arena.getBoundingClientRect();const gap=parseFloat(getComputedStyle(arena).gap)||0;const extras=$('drag').offsetHeight+document.querySelector('.hud').offsetHeight+document.querySelector('.play-footer').offsetHeight+gap*3;const height=Math.max(100,Math.min(r.height-extras,(r.width-10)*H/W));const width=height*W/H;const field=document.querySelector('.field');field.style.width=width+'px';field.style.height=height+'px';strip.style.width=width+'px';document.querySelector('.hud').style.width=width+'px';document.querySelector('.play-footer').style.width=width+'px';const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);}
new ResizeObserver(resize).observe(document.querySelector('.arena'));window.addEventListener('resize',resize);resize();
const colors=['#f76aaa','#bb79ed','#778df5','#5ccdde','#70e6c6','#f4c67e'];
function round(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function render(t){
 const key=[g.level,g.score,g.bricks.length,canvas.width,canvas.height].join(':');
 if(key!==staticKey){staticKey=key;staticLayer.width=canvas.width;staticLayer.height=canvas.height;ctx=staticLayer.getContext('2d');ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
 ctx.fillStyle='#100d25';ctx.fillRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#281232');bg.addColorStop(.56,'#15102b');bg.addColorStop(1,'#0d182c');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 // The setting sun and vanishing grid are original vector art, not external assets.
 ctx.save();ctx.globalAlpha=.16;const sun=ctx.createLinearGradient(0,370,0,600);sun.addColorStop(0,'#ffcb79');sun.addColorStop(1,'#ff4baf');ctx.fillStyle=sun;ctx.beginPath();ctx.arc(360,455,113,Math.PI,0);ctx.lineTo(473,515);ctx.lineTo(247,515);ctx.fill();ctx.fillStyle='#17102b';for(let y=460;y<530;y+=14)ctx.fillRect(235,y,250,5+(y-460)/9);ctx.restore();
 ctx.strokeStyle='#75519424';ctx.lineWidth=1;for(let x=-600;x<1400;x+=115){ctx.beginPath();ctx.moveTo(360+(x-360)*.1,530);ctx.lineTo(x,900);ctx.stroke();}for(let i=0;i<13;i++){const y=530+Math.pow(i/12,1.8)*370;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
 ctx.fillStyle='#a586ba';ctx.font='11px monospace';ctx.textAlign='left';ctx.fillText('SECTOR '+String(g.level+1).padStart(2,'0')+' / '+names[g.level].toUpperCase(),29,52);ctx.textAlign='right';ctx.fillStyle='#71638c';ctx.fillText('PRISM // '+String(g.bricks.length).padStart(2,'0'),690,52);ctx.strokeStyle='#a06e982e';ctx.beginPath();ctx.moveTo(29,68);ctx.lineTo(691,68);ctx.stroke();
 for(const b of g.bricks){const color=colors[b.row%colors.length];ctx.shadowBlur=12;ctx.shadowColor=color+'65';round(b.x,b.y,b.w,b.h,4,color);ctx.shadowBlur=0;round(b.x+3,b.y+3,b.w-6,3,1,'#ffffff42');ctx.fillStyle='#140b2840';ctx.fillRect(b.x+3,b.y+b.h-5,b.w-6,3);if(b.hp>1){ctx.fillStyle='#23162d';for(let i=0;i<b.hp;i++)ctx.fillRect(b.x+b.w/2+(i-(b.hp-1)/2)*9-2,b.y+11,4,4);}}
 ctx=displayCtx;
 }
 ctx.drawImage(staticLayer,0,0,W,H);
 for(const d of g.drops){const info={wide:['#69ebda','↔'],slow:['#84aaff','◷'],multi:['#ffce6b','⁙'],life:['#fa7db5','♥']}[d.type];ctx.save();ctx.shadowColor=info[0];ctx.shadowBlur=15;round(d.x-15,d.y-15,30,30,7,info[0]);ctx.shadowBlur=0;ctx.fillStyle='#161127';ctx.font='bold 23px Arial';ctx.textAlign='center';ctx.fillText(info[1],d.x,d.y+8);ctx.restore();}
 if(g.mode==='playing'){for(const b of g.balls)trail.push({x:b.x,y:b.y});if(trail.length>g.balls.length*12)trail.splice(0,trail.length-g.balls.length*12);}else trail=[];
 for(let i=0;i<trail.length;i++){ctx.globalAlpha=i/trail.length*.23;ctx.fillStyle='#b1fcf1';ctx.beginPath();ctx.arc(trail[i].x,trail[i].y,5*i/trail.length+1,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
 for(const b of g.balls){ctx.shadowBlur=20;ctx.shadowColor='#79ffff';ctx.fillStyle='#ecffff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
 const q=g.paddle;ctx.shadowBlur=20;ctx.shadowColor='#73f1ee88';round(q.x-q.w/2,q.y,q.w,q.h,6,'#82e9e3');ctx.shadowBlur=0;round(q.x-q.w/2+9,q.y+3,q.w-18,3,2,'#e4ffff');round(q.x-13,q.y+6,26,5,2,'#353157');
 if(g.mode==='ready'){ctx.fillStyle='#9f90bd';ctx.font='12px monospace';ctx.textAlign='center';ctx.fillText('SPACE OR LAUNCH BALL',360,775);ctx.setLineDash([4,9]);ctx.strokeStyle='#7ceddf60';ctx.beginPath();ctx.moveTo(q.x,807);ctx.lineTo(q.x+40,704);ctx.stroke();ctx.setLineDash([]);}
}
function frame(t){if(!last)last=t;acc+=Math.min((t-last)/1000,.05);last=t;while(acc>=1/120){if(['playing','ready'].includes(g.mode)){const dir=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a'));if(dir)g.move(g.paddle.x+dir*650/120);}g.update(1/120);acc-=1/120;}sync();render(t);requestAnimationFrame(frame);}sync();requestAnimationFrame(frame);
