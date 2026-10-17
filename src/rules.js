export const W=720,H=900;
export const layouts=[
 ['111111111','111111111','111111111','111111111'],
 ['002222200','011111110','111101111','011111110','001111100'],
 ['211000112','121101121','112212211','011222110','001111100'],
 ['220020022','122121221','012222210','121121121','220020022','111111111'],
 ['232232232','121121121','212212212','021232120','001212100','000111000'],
];
export class Game{
 constructor(){this.destroyCount=0;this.mode='menu';this.lives=3;this.level=0;this.score=0;this.paddle={x:360,y:834,w:112,h:14};this.balls=[];this.bricks=[];this.drops=[];this.effects={wide:0,slow:0};}
 get speed(){return Math.min(650,390+this.level*48)*(this.effects.slow>0?.68:1);}
 move(x){this.paddle.x=Math.max(this.paddle.w/2,Math.min(W-this.paddle.w/2,x));if(this.mode==='ready'&&this.balls[0])this.balls[0].x=this.paddle.x;}
 launch(){if(this.mode!=='ready')return;this.mode='playing';this.balls[0].vx=this.speed*.32;this.balls[0].vy=-this.speed*.9474;}
 normalize(b){const s=this.speed;let ax=Math.max(.20,Math.min(.93,Math.abs(b.vx)/(Math.hypot(b.vx,b.vy)||1)));b.vx=(Math.sign(b.vx)||1)*s*ax;b.vy=(Math.sign(b.vy)||-1)*s*Math.sqrt(1-ax*ax);}
 pause(){if(this.mode==='paused'){this.mode=this.beforePause;}else if(['playing','ready'].includes(this.mode)){this.beforePause=this.mode;this.mode='paused';}}
 next(){if(this.mode==='complete'&&this.level<4){this.level++;this.loadLevel();}}
 power(type){
 if(type==='wide'){this.effects.wide=12;this.paddle.w=168;this.move(this.paddle.x);}
 if(type==='slow'){this.effects.slow=10;this.balls.forEach(b=>this.normalize(b));}
 if(type==='life')this.lives=Math.min(5,this.lives+1);
 if(type==='multi'&&this.balls.length){const b=this.balls[0];for(const a of [-.65,.85]){if(this.balls.length>=5)break;const angle=Math.atan2(b.vy,b.vx)+a;const c={...b,vx:Math.cos(angle)*this.speed,vy:Math.sin(angle)*this.speed};this.normalize(c);this.balls.push(c);}}
 }
 destroyed(brick){this.destroyCount++;if(this.destroyCount%5===0)this.drops.push({x:brick.x+brick.w/2,y:brick.y,type:['wide','slow','multi','life'][(this.destroyCount/5-1)%4]});}
 resetServe(){this.effects={wide:0,slow:0};this.paddle.w=112;this.move(this.paddle.x);this.drops=[];this.balls=[{x:this.paddle.x,y:822,r:8,vx:0,vy:0}];this.mode='ready';}
 update(dt){
 if(this.mode!=='playing')return;
 for(const key of ['wide','slow'])this.effects[key]=Math.max(0,this.effects[key]-Math.min(dt,.1));this.paddle.w=this.effects.wide>0?168:112;this.move(this.paddle.x);
 const steps=Math.ceil(Math.min(dt,.1)*650/2), h=Math.min(dt,.1)/Math.max(1,steps);
 for(let i=0;i<steps&&this.mode==='playing';i++){
 for(const b of this.balls){this.normalize(b);b.x+=b.vx*h;b.y+=b.vy*h;
 if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx);}if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx);}if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy);}
 const q=this.paddle;
 if(b.vy>0&&b.y+b.r>=q.y&&b.y-b.r<q.y+q.h&&b.x+b.r>q.x-q.w/2&&b.x-b.r<q.x+q.w/2){
 const offset=Math.max(-1,Math.min(1,(b.x-q.x)/(q.w/2)));const angle=offset*1.12;b.vx=Math.sin(angle)*this.speed;b.vy=-Math.cos(angle)*this.speed;b.y=q.y-b.r-.01;this.normalize(b);
 }
 for(const brick of this.bricks){if(brick.hp<=0)continue;const nx=Math.max(brick.x,Math.min(brick.x+brick.w,b.x)),ny=Math.max(brick.y,Math.min(brick.y+brick.h,b.y));let dx=b.x-nx,dy=b.y-ny,d=Math.hypot(dx,dy);if(d>=b.r)continue;
 if(d<.00001){const edges=[{d:b.x-brick.x,x:-1,y:0},{d:brick.x+brick.w-b.x,x:1,y:0},{d:b.y-brick.y,x:0,y:-1},{d:brick.y+brick.h-b.y,x:0,y:1}].sort((a,c)=>a.d-c.d);dx=edges[0].x;dy=edges[0].y;d=1;}
 const ux=dx/d,uy=dy/d,dot=b.vx*ux+b.vy*uy;
 b.x+=ux*(b.r-d+.02);b.y+=uy*(b.r-d+.02);
 if(dot<0){b.vx-=2*dot*ux;b.vy-=2*dot*uy;brick.hp--;this.score+=brick.hp?25:100;if(!brick.hp)this.destroyed(brick);}
 break;
 }
 }
 this.bricks=this.bricks.filter(b=>b.hp>0);
 if(!this.bricks.length){this.mode=this.level===4?'victory':'complete';this.drops=[];break;}
 this.balls=this.balls.filter(b=>b.y-b.r<=H);
 if(!this.balls.length){this.lives--;if(this.lives<=0){this.mode='gameover';this.drops=[];}else this.resetServe();break;}
 for(const drop of this.drops){drop.y+=135*h;if(drop.y>=this.paddle.y-12&&drop.y<=this.paddle.y+20&&Math.abs(drop.x-this.paddle.x)<this.paddle.w/2+12){this.power(drop.type);drop.y=H+40;}}
 this.drops=this.drops.filter(d=>d.y<H);
 }
 }
 start(){this.destroyCount=0;this.lives=3;this.level=0;this.score=0;this.loadLevel();}
 loadLevel(){this.bricks=[];layouts[this.level].forEach((row,r)=>[...row].forEach((v,c)=>{if(+v)this.bricks.push({x:29+c*74,y:112+r*38,w:68,h:26,hp:+v,max:+v,row:r});}));this.mode='ready';this.paddle.x=360;this.effects={wide:0,slow:0};this.paddle.w=112;this.drops=[];this.balls=[{x:360,y:822,r:8,vx:0,vy:0}];}
}
