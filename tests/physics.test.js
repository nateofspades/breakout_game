import {it,expect} from 'vitest';
import {Game} from '../src/rules.js';
function play(){const g=new Game();g.start();g.launch();return g;}
it('launch, accurate movement and clamps',()=>{const g=play();g.move(999);expect(g.paddle.x).toBe(664);const y=g.balls[0].y;g.update(.1);expect(g.balls[0].y).toBeLessThan(y);g.move(-1);expect(g.paddle.x).toBe(56);});
it('high speed wall reflection',()=>{const g=play();g.balls=[{x:10,y:500,r:8,vx:-600,vy:-180}];g.update(.03);expect(g.balls[0].vx).toBeGreaterThan(0);expect(g.balls[0].x).toBeGreaterThanOrEqual(8);});
it('paddle offset aim without sticking',()=>{const g=play();g.balls=[{x:400,y:820,r:8,vx:0,vy:500}];g.update(.04);expect(g.balls[0].vy).toBeLessThan(0);expect(g.balls[0].vx).toBeGreaterThan(0);expect(g.balls[0].y).toBeLessThan(826);});
it('multihit, destruction, score and completion',()=>{const g=play();g.bricks=[{x:200,y:200,w:68,h:26,hp:2}];g.balls=[{x:230,y:245,r:8,vx:70,vy:-400}];g.update(.04);expect(g.bricks[0].hp).toBe(1);expect(g.score).toBe(25);g.balls=[{x:230,y:245,r:8,vx:70,vy:-400}];g.update(.04);expect(g.bricks).toHaveLength(0);expect(g.score).toBe(125);expect(g.mode).toBe('complete');});
it('brick side normal',()=>{const g=play();g.bricks=[{x:200,y:200,w:68,h:26,hp:3}];g.balls=[{x:185,y:210,r:8,vx:400,vy:60}];g.update(.03);expect(g.balls[0].vx).toBeLessThan(0);});
it('brick rounded corner normal',()=>{const g=play();g.bricks=[{x:200,y:200,w:68,h:26,hp:3}];g.balls=[{x:188,y:188,r:8,vx:280,vy:280}];g.update(.03);expect(g.balls[0].vx).toBeLessThan(0);expect(g.balls[0].vy).toBeLessThan(0);});
