// SOURCE-PHASE DRAFT: do not execute until coordinator grants exclusive lane.
import {test, expect} from "@playwright/test";
const sizes = [[1920,1080],[1366,768],[768,1024],[390,844],[320,568],[844,390]];
function collect(page) {
  const errors = [];
  page.on("pageerror", e=>errors.push(`page: ${e.message}`));
  page.on("console", m=>{if(m.type()==="error") errors.push(`console: ${m.text()}`);});
  page.on("requestfailed", r=>errors.push(`request: ${r.url()} ${r.failure()?.errorText}`));
  page.on("response", r=>{if(r.status()>=400) errors.push(`http: ${r.status()} ${r.url()}`);});
  return errors;
}
async function fits(page, width, height, menu) {
  await expect.poll(()=>page.evaluate(({width,height})=>{
    const ids = ["game","drag","music","volume","pause","restart","launch",...(document.querySelector("#overlay").hidden?[]:["primary"])];
    return innerWidth===width && innerHeight===height && document.documentElement.scrollWidth<=width && document.documentElement.scrollHeight<=height && ids.every(id=>{
      const e=document.getElementById(id),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      // The menu overlay intentionally covers the canvas, never its launch controls.
      const overlay = id==="game" && !document.querySelector("#overlay").hidden;
      return r.width>0 && r.height>0 && r.x>=0 && r.y>=0 && r.right<=width && r.bottom<=height && (overlay||hit===e||e.contains(hit));
    });
  },{width,height})).toBe(true);
  await expect(page.locator("#overlay")).toBeVisible({visible:menu});
  for (const id of ["drag","music","volume","pause","restart","launch"]) {
    const r=await page.locator(`#${id}`).boundingBox(); expect(r.height,id).toBeGreaterThanOrEqual(44);
  }
}
for (const [width,height] of sizes) test(`BrikaVolt final initial and active geometry ${width}x${height}`,async({page,browserName})=>{
  const errors=collect(page); await page.setViewportSize({width,height});
  const response=await page.goto("./"); expect(response.status()).toBe(200);
  await expect(page).toHaveTitle(/^BrikaVolt(?:\s*[—|·-].*)?$/);
  await expect(page.getByRole("heading",{name:"BrikaVolt",exact:true})).toBeVisible();
  await expect(page.getByRole("link",{name:"BrikaVolt home",exact:true})).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content",/^BrikaVolt:/);
  await fits(page,width,height,true);
  await page.screenshot({path:`${process.env.RELEASE_SCREENSHOTS || 'test-results'}/${browserName}-menu-${width}x${height}.png`});
  expect(await page.evaluate(()=>prismAudio.snapshot().contextCount)).toBe(0);
  await page.locator("#primary").click(); await page.locator("#launch").click();
  await expect(page.locator("#status")).toHaveText("IN PLAY"); await fits(page,width,height,false);
  await page.screenshot({path:`${process.env.RELEASE_SCREENSHOTS || 'test-results'}/${browserName}-active-${width}x${height}.png`});
  if(process.env.LIVE_URL) expect(await page.evaluate(()=>typeof window.prismTest)).toBe("undefined");
  await page.locator("#pause").click(); await expect(page.locator("#status")).toHaveText("PAUSED");
  await page.locator("#pause").click(); await page.locator("#restart").click();
  await expect(page.locator("#status")).toHaveText("SPACE / TAP LAUNCH");
  expect(errors).toEqual([]);
});
test("native Space still activates focused visible Start and Resume buttons",async({page})=>{
  await page.goto("./"); await page.locator("#primary").focus(); await page.keyboard.press("Space");
  await expect(page.locator("#status")).toHaveText("SPACE / TAP LAUNCH");
  await page.locator("#pause").click(); await page.locator("#primary").focus(); await page.keyboard.press("Space");
  await expect(page.locator("#status")).toHaveText("SPACE / TAP LAUNCH");
});
test("five-sector browser progression preserves score and lives through real Continue buttons",async({page})=>{
  test.skip(Boolean(process.env.LIVE_URL),"Local deterministic scenarios only");
  await page.goto("./?test=1"); await page.locator("#primary").click();
  await expect.poll(()=>page.evaluate(()=>prismAudio.measure().rms)).toBeGreaterThan(0.003);
  const audio=await page.evaluate(()=>prismAudio.snapshot());
  for(let level=1;level<=5;level++) {
    await expect(page.locator("#level")).toHaveText(`0${level} / 05`);
    await page.locator("#launch").click();
    await page.screenshot({path:`${process.env.RELEASE_SCREENSHOTS || 'test-results'}/sector-${level}.png`});
    await page.evaluate(()=>prismTest.scenario("complete"));
    await expect(page.locator("#status")).toHaveText(level===5?"VICTORY":"SECTOR CLEAR");
    expect(await page.evaluate(()=>prismState().lives)).toBe(3);
    await expect.poll(()=>page.evaluate(()=>prismAudio.measure().rms)).toBeGreaterThan(0.003);
    expect(await page.evaluate(()=>prismAudio.snapshot())).toMatchObject({contextCount:1,sourceCount:1,startedAt:audio.startedAt});
    if(level<5) await page.getByRole("button",{name:"Continue",exact:true}).click();
  }
  await page.getByRole("button",{name:"Play again",exact:true}).click();
  expect(await page.evaluate(()=>prismState())).toMatchObject({level:0,lives:3,score:0,mode:"ready"});
});
test("same-origin old/new repository paths retain seeded legacy records and music preferences",async({page,baseURL})=>{
  test.skip(Boolean(process.env.LIVE_URL),"Local route simulation, not real-user migration");
  const origin=new URL(baseURL).origin;
  // Serve identical runtime under both paths without changing production server.
  await page.route(`${origin}/**`,async route=>{
    const u=new URL(route.request().url());
    const prefix=["/breakout_game/","/BrikaVolt_Game/"].find(p=>u.pathname.startsWith(p));
    if(!prefix) return route.continue();
    u.pathname="/"+(u.pathname.slice(prefix.length)||"index.html");
    const response=await route.fetch({url:u.href}); await route.fulfill({response});
  });
  await page.goto(`${origin}/breakout_game/`);
  await page.evaluate(()=>{localStorage.setItem("prism-break.best","9876");localStorage.setItem("prism-break.music.enabled","false");localStorage.setItem("prism-break.music.volume","0.31");localStorage.setItem("unrelated.best","123");});
  await page.reload(); await expect(page.locator("#best")).toHaveText("009876");
  await page.goto(`${origin}/BrikaVolt_Game/`);
  await expect(page.locator("#best")).toHaveText("009876");
  await expect(page.locator("#music")).toHaveText("Music Off");
  await expect(page.locator("#volume")).toHaveValue("31");
  await page.locator("#primary").click(); await page.locator("#restart").click();
  expect(await page.evaluate(()=>localStorage.getItem("unrelated.best"))).toBe("123");
  expect(await page.evaluate(()=>prismAudio.snapshot())).toMatchObject({enabled:false,volume:0.31,contextCount:1,sourceCount:1});
});
test("real output clock crosses full loop with one transport through pause restart and orientation",async({page})=>{
  await page.goto("./"); await page.locator("#primary").click();
  await expect.poll(()=>page.evaluate(()=>prismAudio.measure().rms),{timeout:15000}).toBeGreaterThan(0.003);
  await expect.poll(()=>page.evaluate(()=>prismAudio.snapshot().elapsed)).toBeGreaterThan(0.03);
  const before=await page.evaluate(()=>prismAudio.snapshot());
  const duration=await page.evaluate(async()=> (await import("./src/music.js")).DURATION);
  await page.locator("#pause").click(); await page.locator("#restart").click();
  await page.setViewportSize({width:844,height:390}); await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>prismAudio.snapshot().elapsed),{timeout:45000}).toBeGreaterThan(before.elapsed+duration);
  expect(await page.evaluate(()=>prismAudio.snapshot())).toMatchObject({contextCount:1,sourceCount:1,startedAt:before.startedAt,error:null});
  await page.locator("#music").click();
  await expect.poll(()=>page.evaluate(()=>prismAudio.measure().rms)).toBeLessThan(0.001);
  await page.locator("#music").click(); await page.locator("#volume").fill("60");
  await expect.poll(()=>page.evaluate(()=>prismAudio.measure().rms)).toBeGreaterThan(0.003);
});
for(const viewport of [{width:320,height:568},{width:844,height:390}]) test(`touch-only edge mapping and release ${viewport.width}x${viewport.height}`,async({browser,browserName})=>{
  test.skip(browserName==="firefox","Firefox isMobile unsupported; desktop six-size checks remain mandatory");
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage(); const errors=collect(page);
  try {
    await page.goto(process.env.LIVE_URL||process.env.BASE_URL||"http://127.0.0.1:4279/");
    await page.locator("#primary").tap(); const r=await page.locator("#drag").boundingBox();
    await page.touchscreen.tap(r.x+1,r.y+r.height/2);
    expect(await page.evaluate(()=>prismState().paddle.x)).toBe(56);
    await page.touchscreen.tap(r.x+r.width-1,r.y+r.height/2);
    expect(await page.evaluate(()=>prismState().paddle.x)).toBe(664);
    await page.locator("#launch").tap(); await page.locator("#pause").tap();
    const before=await page.evaluate(()=>prismState());
    await page.waitForTimeout(120); expect(await page.evaluate(()=>prismState())).toEqual(before);
    await page.locator("#pause").tap(); await page.locator("#restart").tap();
    expect(await page.evaluate(()=>prismState().mode)).toBe("ready"); expect(errors).toEqual([]);
  } finally {await context.close();}
});
