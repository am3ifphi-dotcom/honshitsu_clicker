// Start npm run dev first. Install Chromium with: npx playwright install chromium.
import { chromium } from '@playwright/test';
import { tmpdir } from 'node:os';
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:5173';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, headless: true, args: ['--no-sandbox'] });
try {
 const page = await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${baseURL}/scripts/fixtures/evolution.html`);
 await page.locator('.evolution--beat-0').waitFor();
 await page.waitForTimeout(300);
 await page.clock.install();
 await page.clock.fastForward(20000);
 assert.equal(await page.locator('.evolution--beat-0').count(),1,'opening waits indefinitely');
 await page.getByRole('button',{name:'続きを見る'}).click();
 await page.getByRole('button',{name:'進化を解き放つ'}).click();
 assert.equal(await page.locator('.evolution--beat-1').count(),1,'rapid second tap does not skip dialogue');
 await page.clock.fastForward(20000);
 assert.equal(await page.locator('.evolution--beat-1').count(),1,'dialogue waits indefinitely');
 await page.getByRole('button',{name:'進化を解き放つ'}).click();
 await page.clock.fastForward(1950);
 assert.equal(await page.locator('.evolution--beat-3').count(),1);
 await page.clock.fastForward(1400);
 assert.equal(await page.locator('.evolution--beat-4').count(),1);
 await page.screenshot({path:`${tmpdir()}/evo-reveal-desktop.png`});
 await page.clock.fastForward(3400);
 assert.equal(await page.locator('.evolution--beat-5').count(),1);
 await page.getByRole('button',{name:'もう一度観る'}).click();
 await page.clock.fastForward(20000);
 assert.equal(await page.locator('.evolution--beat-0').count(),1,'replay resets reading wait');
 await page.getByRole('button',{name:'続きを見る'}).click();await page.clock.fastForward(500);
 await page.getByRole('button',{name:'進化を解き放つ'}).click();
 await page.getByRole('button',{name:'スキップ'}).click();await page.clock.fastForward(20000);
 assert.equal(await page.locator('.evolution--beat-5').count(),1,'skip cancels pending advance');
 await page.getByRole('button',{name:'鑑賞を終える'}).click();assert.equal(await page.evaluate(()=>window.completed),1);

 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(`${baseURL}/scripts/fixtures/evolution.html?id=ex_terachi`);
 await mobile.locator('.evolution--beat-0').waitFor();
 await mobile.screenshot({path:`${tmpdir()}/evo-opening-mobile.png`});
 await mobile.getByRole('button',{name:'続きを見る'}).tap();
 await mobile.waitForTimeout(500);
 await mobile.getByRole('button',{name:'進化を解き放つ'}).tap();
 await mobile.locator('.evolution--beat-5').waitFor();
 await mobile.screenshot({path:`${tmpdir()}/evo-result-mobile.png`});
 const button=await mobile.getByRole('button',{name:'鑑賞を終える'}).boundingBox();assert.ok(button.y+button.height<844);
 await mobile.goto(`${baseURL}/scripts/fixtures/evolution.html?icons`);await mobile.waitForTimeout(1000);
 await mobile.screenshot({path:`${tmpdir()}/ex-icons.png`,fullPage:true});
 for(const id of ['ex_rei','ex_heikatsu','ex_mie','pregen','jimen']) {
  await mobile.goto(`${baseURL}/scripts/fixtures/evolution.html?id=${id}`);
  await mobile.getByRole('button',{name:'続きを見る'}).tap();await mobile.waitForTimeout(500);
  await mobile.getByRole('button',{name:'進化を解き放つ'}).tap();
  await mobile.getByRole('button',{name:'スキップ'}).tap();assert.equal(await mobile.locator('.evolution--beat-5').count(),1);
 }
 await mobile.emulateMedia({reducedMotion:'reduce'});
 await mobile.goto(`${baseURL}/scripts/fixtures/evolution.html?id=ex_rei`);
 await mobile.getByRole('button',{name:'続きを見る'}).tap();await mobile.waitForTimeout(500);
 await mobile.getByRole('button',{name:'進化を解き放つ'}).tap();
 await mobile.getByRole('button',{name:'スキップ'}).tap();
 assert.equal(await mobile.getByRole('button',{name:'鑑賞を終える'}).isVisible(),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: reading holds, tap progression, timed action, replay, skip cleanup, completion, 7 characters, mobile controls; zero browser errors');
} finally {await browser.close();}
