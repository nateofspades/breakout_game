import {describe,it,expect} from 'vitest';
import {Game,layouts} from '../src/rules.js';
describe('campaign',()=>{
 it('begins with three lives and five distinct reachable layouts',()=>{
 const g=new Game(); expect(g.lives).toBe(3);expect(g.mode).toBe('menu');
 expect(layouts).toHaveLength(5);expect(new Set(layouts.map(x=>JSON.stringify(x))).size).toBe(5);
 g.start();expect(g.mode).toBe('ready');expect(g.bricks.length).toBeGreaterThan(20);
 });
});
