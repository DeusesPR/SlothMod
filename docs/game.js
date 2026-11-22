/* SlothMod Live 2D Hero Sandbox ("Mod the Game Live!"), Crafting Demo & Mini Loops.
   Zero dependencies, crisp integer pixel scaling, safe keyboard focus model. */
(function(){
'use strict';

var doc=document,win=window,R=Math.random;
var reduce=win.matchMedia&&win.matchMedia('(prefers-reduced-motion: reduce)').matches;
var paused=false;

function rnd(a,b){return a+R()*(b-a)}
function pick(a){return a[(R()*a.length)|0]}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function hx(c){return[parseInt(c.substr(1,2),16),parseInt(c.substr(3,2),16),parseInt(c.substr(5,2),16)]}
function mixa(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function rgb(a){return'rgb('+(a[0]|0)+','+(a[1]|0)+','+(a[2]|0)+')'}
function mk(w,h){var c=doc.createElement('canvas');c.width=w;c.height=h;return c}
function padScore(n){return String(Math.floor(n)).padStart(6,'0').replace(/(\d{3})(?=\d)/g,'$1,')}
function lsGet(k){try{return win.localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{win.localStorage.setItem(k,v)}catch(e){}}

/* ---------- Retro Chiptune WebAudio SFX (strictly respects sound toggle) ---------- */
var sfxCtx=null,sfxMaster=null;
function soundOn(){
  var sb=doc.getElementById('snd');
  if(sb)return sb.getAttribute('aria-pressed')==='true';
  return lsGet('sloth.snd')==='1'||lsGet('sloth.sound')==='1';
}
function getAudio(){
  if(!soundOn())return null;
  if(win.slothAudio&&win.slothAudio.getContext){
    var shared=win.slothAudio.getContext();
    if(shared)return shared;
  }
  if(!sfxCtx){
    var AC=win.AudioContext||win.webkitAudioContext;if(!AC)return null;
    try{sfxCtx=new AC();sfxMaster=sfxCtx.createGain();sfxMaster.gain.value=.13;sfxMaster.connect(sfxCtx.destination)}catch(e){sfxCtx=null}
  }
  if(sfxCtx&&sfxCtx.state==='suspended')try{sfxCtx.resume()}catch(e){}
  return sfxCtx;
}
function getDest(c){
  if(win.slothAudio&&win.slothAudio.getMaster&&win.slothAudio.getContext&&win.slothAudio.getContext()===c){
    return win.slothAudio.getMaster()||c.destination;
  }
  return sfxMaster||c.destination;
}
function chipTone(f0,f1,t,d,type,v){
  var c=getAudio();if(!c)return;
  var o=c.createOscillator(),g=c.createGain(),t0=c.currentTime+(t||0);
  o.type=type||'square';
  o.frequency.setValueAtTime(Math.max(40,f0),t0);
  if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t0+d);
  g.gain.setValueAtTime(.0001,t0);
  g.gain.linearRampToValueAtTime(v||.45,t0+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  o.connect(g);g.connect(getDest(c));o.start(t0);o.stop(t0+d+.02);
}
function chipNoise(t,d,v){
  var c=getAudio();if(!c)return;
  var len=Math.max(64,Math.floor(c.sampleRate*d));
  var buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);
  for(var i=0;i<len;i++)ch[i]=(R()*2-1)*(1-i/len);
  var src=c.createBufferSource();src.buffer=buf;
  var g=c.createGain(),t0=c.currentTime+(t||0);
  g.gain.setValueAtTime(v||.25,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  src.connect(g);g.connect(getDest(c));src.start(t0);
}
function sfx(kind){
  if(!soundOn())return;
  if(kind==='fire'){chipNoise(0,.12,.3);chipTone(340,120,0,.14,'sawtooth',.35)}
  else if(kind==='zap'){chipTone(960,260,0,.09,'sawtooth',.4);chipTone(1380,480,.04,.11,'square',.32);chipNoise(.02,.08,.22)}
  else if(kind==='ice'){chipTone(1240,1880,0,.08,'triangle',.35);chipTone(880,1320,.05,.09,'sine',.3)}
  else if(kind==='shatter'){chipNoise(0,.12,.3);chipTone(1600,620,0,.09,'triangle',.32);chipTone(1100,440,.04,.1,'square',.22)}
  else if(kind==='hammer'){chipTone(740,520,0,.06,'square',.35);chipTone(1480,1220,.02,.08,'triangle',.28)}
  else if(kind==='build'){[392,523,659,784].forEach(function(f,i){chipTone(f,f,i*.055,.11,'square',.28)})}
  else if(kind==='roar'){chipTone(170,68,0,.34,'sawtooth',.48);chipNoise(.04,.28,.35)}
  else if(kind==='win'){[523,659,784,1047,1319].forEach(function(f,i){chipTone(f,f,i*.07,.22,'square',.32)})}
  else if(kind==='coin'){chipTone(988,1319,0,.06,'square',.28);chipTone(1319,1568,.055,.11,'square',.26)}
  else if(kind==='jump'){chipTone(260,560,0,.1,'square',.24)}
  else if(kind==='djump'){chipTone(440,880,0,.12,'triangle',.3)}
  else if(kind==='hit'){chipTone(220,110,0,.07,'square',.28)}
  else if(kind==='forge'){chipTone(880,660,0,.07,'triangle',.35);chipTone(1174,1568,.06,.14,'square',.3)}
  else if(kind==='ally'){chipTone(523,784,0,.08,'triangle',.3);chipTone(659,988,.07,.1,'triangle',.26)}
  else if(kind==='mood'){chipTone(440,659,0,.14,'sine',.32);chipTone(659,880,.08,.18,'triangle',.25)}
  else if(kind==='chaos'){[330,440,587,784,659].forEach(function(f,i){chipTone(f,f*1.12,i*.04,.09,'sawtooth',.28)})}
  else if(kind==='arrow'){chipTone(680,420,0,.06,'triangle',.22)}
}

/* ---------- Procedural Pixel Sprites ---------- */
function spr(rows,pal){
  var h=rows.length,w=0,px=[];
  rows.forEach(function(r){w=Math.max(w,r.length)});
  var c=mk(w,h),x=c.getContext('2d');
  rows.forEach(function(r,j){
    for(var i=0;i<r.length;i++){
      var k=r[i];
      if(k!=='.'&&pal[k]){x.fillStyle=pal[k];x.fillRect(i,j,1,1);px.push([i,j,pal[k]])}
    }
  });
  var f=mk(w,h),fx=f.getContext('2d');fx.drawImage(c,0,0);fx.globalCompositeOperation='source-atop';fx.fillStyle='#fff';fx.fillRect(0,0,w,h);
  var fr=mk(w,h),frx=fr.getContext('2d');frx.drawImage(c,0,0);frx.globalCompositeOperation='source-atop';frx.fillStyle='rgba(120,235,255,.65)';frx.fillRect(0,0,w,h);
  return{c:c,f:f,fr:fr,w:w,h:h,px:px};
}

var SP={
  slime:spr(['....oooo....','..oohhGGoo..','.ohhGGGGGgo.','.ohGGGGGGgo.','ohGGGGGGGGgo','oGGeeGGeeGgo','oGGeeGGeeGgo','oGGGGGGGGggo','.oggggggggo.','..oooooooo..'],{o:'#1b5a22',G:'#5fd64b',g:'#3ca836',h:'#b4ff9c',e:'#10301a'}),
  skeleton:spr(['..oooooo..','.oWWWWWWo.','.oWkWWkWo.','.oWWWWWWo.','..oWkWko..','...oooo...','.ooWddWoo.','oWWoWWoWWo','oW.oWWo.Wo','...oWWo...','..oo..oo..','..oW..Wo..','..oo..oo..'],{o:'#222530',W:'#eceef5',d:'#b8bfd0',k:'#151720'}),
  golem:spr(['...ooooo...','..oCCppqo..','..oeCpeqo..','..oppppqo..','.ooqqqqqoo.','oCCoppqoCCo','oppoCCpoqpo','oqqoppqoqqo','.oo.pCpq.oo','....pppq...','...oppqqo..','...opoqqo..','..ooo.ooo..'],{o:'#1e0f3d',C:'#e2b6ff',p:'#8a4ae0',q:'#5a2aa8',e:'#ffee70'}),
  scare:spr(['....ss....','..oOOOOo..','.oOOOOOOo.','.oOkOOkOo.','.oOOkkOOo.','.oOkkkkOo.','..oOOOOo..','...oddo...','SS.bbbb.SS','.SSbbrbSS.','...bbbb...','....ww....','....ww....','...wwww...'],{o:'#6b3a08',O:'#f39a1f',d:'#b8650d',k:'#2a1400',s:'#4c9a2e',S:'#e8c45c',b:'#5f7fd0',r:'#c4503a',w:'#7a5230'}),
  fire:spr(['...RR...','..ROOR..','.RROORR.','.ROYYOR.','RROYWYOR','ROYWWYOR','ROkYYkOR','.ROYYOR.','..RRRR..'],{R:'#d8321a',O:'#ff8a1a',Y:'#ffe14a',W:'#fffbd0',k:'#3a0d05'}),
  builder:[
    spr(['..yyyy..','.yYYYYy.','.osssso.','.oseeso.','..bbbb..','.bBBBBb.','.bbBBbb.','..b..b..','..k..k..'],{y:'#d99b18',Y:'#ffe066',o:'#3a2515',s:'#d89d72',e:'#1d1510',b:'#2c5d9e',B:'#4886d8',k:'#3c2b1d'}),
    spr(['..yyyy..','.yYYYYy.','.osssso.','.oseeso.','..bbbb..','.bBBBBb.','.bbBBbb.','.b....b.','.k....k.'],{y:'#d99b18',Y:'#ffe066',o:'#3a2515',s:'#d89d72',e:'#1d1510',b:'#2c5d9e',B:'#4886d8',k:'#3c2b1d'})
  ],
  ally:[
    spr(['..iiiii...','.iIIgIIi..','.oMMMMMo..','.oMewWeo..','.oMMmMMo..','.oBMMMBoo.','iIobbboIi.','iIgbbbgIi.','.iIbbbIi..','..bb.bb...','..kk.kk...'],{i:'#4b5366',I:'#b7c2d6',g:'#5fd64b',o:'#3d2a1c',M:'#8f6c4e',e:'#18120e',w:'#fff',W:'#e6d2b5',m:'#4d3320',B:'#6b4e37',b:'#3f7d32',k:'#28201a'}),
    spr(['..iiiii...','.iIIgIIi..','.oMMMMMo..','.oMewWeo..','.oMMmMMo..','.oBMMMBoo.','iIobbboIi.','iIgbbbgIi.','.iIbbbIi..','.bb...bb..','.kk...kk..'],{i:'#4b5366',I:'#b7c2d6',g:'#5fd64b',o:'#3d2a1c',M:'#8f6c4e',e:'#18120e',w:'#fff',W:'#e6d2b5',m:'#4d3320',B:'#6b4e37',b:'#3f7d32',k:'#28201a'})
  ],
  anvil:spr(['.oooooooooo.','oDDDDDDDDDDo','oGGGGGGGGGG.','..oooooooo..','...oDDDDoo..','...oGGGGoo..','..ooDDDDooo.','.oGGGGGGGGGo','oooooooooooo'],{o:'#0d0e12',D:'#6a7284',G:'#3c414f'})
};

var HP={h:'#cfc9b0',j:'#ece8d6',k:'#a9a38c',s:'#b87a52',t:'#96603f',l:'#cf9468',e:'#1c1410',w:'#f2f2f2',p:'#2e8b36',r:'#4eb53b',q:'#1e5e24',c:'#ffe066',n:'#2f3a5c',m:'#222a44',N:'#3d4a74',b:'#5fd64b',B:'#286920'};
var HB=['..jhhhhh.','..hhsssss','.khhtwess','..kttlstl','...ttsll.','..cpppq..','..qqpqpq.','..rppppq.','..ppqqsss','..ppqpq..','..cccqq..'];
SP.hero=[
  spr(HB.concat(['..nnnm...','..nNmm...','..bbBB...']),HP),
  spr(HB.concat(['..nnnmm..','.nn..nn..','.bB..bB..']),HP),
  spr(HB.concat(['.nnn.mm..','.nN...mm.','.bB...bB.']),HP)
];

var IT=[
  {n:'Squeaky Toy',k:'duck',s:spr(['..yyy..','.yykyy.','.yyyoo.','..yyy..','yyyyyy.','.yyyyyy','..yyyy.'],{y:'#ffd84a',k:'#222',o:'#ff8a1a'}),t:['#ffd84a','#ffb020']},
  {n:'Honey Cookie',k:'cookie',s:spr(['..TTT..','.TTcTT.','TTTTTcT','TcTTTTT','TTTcTTT','.TTTTT.','..TTT..'],{T:'#e0aa55',c:'#6a3a1a'}),t:['#e0aa55','#6a3a1a']},
  {n:'Ruby',k:'gem',s:spr(['..rrr..','.rRRRr.','rRwRRRr','rRRRRRr','.rRRRr.','..rRr..','...r...'],{r:'#b3122c',R:'#ff4a5e',w:'#ffd0d6'}),t:['#ff4a5e','#ffd0d6']},
  {n:'Emerald',k:'emerald',s:spr(['..ggg..','.gGGg..','gGwGGGg','gGGGGGg','.gGGGg.','..gGg..','...g...'],{g:'#1c7c28',G:'#5fe65c',w:'#d5ffd4'}),t:['#5fe65c','#b4ff9c']},
  {n:'Diamond',k:'diamond',s:spr(['..ccc..','.cCCCc.','cCwCCCc','cCCCCCc','.cCCCc.','..cCc..','...c...'],{c:'#1ca8c8',C:'#6ef3ff',w:'#ffffff'}),t:['#6ef3ff','#ffffff']},
  {n:'Glow Sword',k:'sword',s:spr(['.....bw','....bw.','...bw..','.kbw...','..kk...','.hk....','h......'],{b:'#9ad7ff',w:'#fff',k:'#d9a93a',h:'#7a4a22'}),t:['#bfe9ff','#ffe066']}
];
var LOOT=['gem','emerald','cookie','duck','diamond','gem','emerald'];
function itemOf(k){for(var i=0;i<IT.length;i++)if(IT[i].k===k)return IT[i];return IT[0]}

var MOB={
  slime:{s:SP.slime,sp:18,hp:3,c:['#5fd64b','#b4ff9c']},
  skeleton:{s:SP.skeleton,sp:15,hp:3,c:['#eceef5','#9aa4ba']},
  golem:{s:SP.golem,sp:10,hp:5,c:['#8a4ae0','#e2b6ff']},
  scare:{s:SP.scare,sp:12,hp:4,c:['#f39a1f','#e8c45c']},
  fire:{s:SP.fire,sp:22,hp:2,fly:1,c:['#ff8a1a','#ffe14a']}
};
var MOBS=['slime','skeleton','golem','scare','fire'];

var DIG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001010010','111101111101111','111101111001111'];

/* ---------- 16x16 Pixel Icons for the 8-Slot Live Mod Hotbar ---------- */
var SLOT_ICONS={
  1:{rows:['............ff..','...........fFF..','..........fFFf..','.........fRYf...','........fRYf....','.......fRYf.....','......fRYf......','.....fRYf.......','....gGYf........','...gGGg.........','..gGgG..........','.hhg............','hHh.............','hh..............','................','................'],pal:{f:'#ff3b30',F:'#ff8c1a',R:'#d91e2a',Y:'#ffe066',g:'#9e7420',G:'#fcd34d',h:'#5a3818',H:'#8a5a2b'}},
  2:{rows:['.........ccc....','........cCWCc...','.......cCWYWCc..','........cCWCc...','........hccc....','.......hH.......','......hH........','.....hH....c....','....hH....cC....','...hH.....c.....','..hH............','.hH.............','hH..............','................','................','................'],pal:{c:'#23b5d3',C:'#72f3ff',W:'#ffffff',Y:'#ffe066',h:'#4a2c16',H:'#7c4d28'}},
  3:{rows:['......ccc.......','....ccCCCc......','...cCC...s......','..cC....s..i....','..cC...s..iI....','.cC...s..iII....','.cC..s..iIi.....','.cC.s..iI.......','.cCs..iI........','..cs.iI.........','..cCiI..........','...ccI..........','....ccc.........','......cc........','................','................'],pal:{c:'#1c88b8',C:'#7ceeff',s:'#dbe8f5',i:'#5ce1e6',I:'#ffffff'}},
  4:{rows:['.......ggg......','.......gGGg.....','.......g..g.....','..s.s.ss.s.s....','..sSsSsSsSsS....','..sSsSssSsSs....','...sSssssSs.....','...sSsdSsSs.....','...sSsdSsSs.....','...sSssssSs.....','..ssSssssSss....','..sSSsddsSSs....','..sSSsddsSSs....','.ssssssssssss...','................','................'],pal:{g:'#2e7d22',G:'#6be052',s:'#4e5464',S:'#8b93a8',d:'#161922'}},
  5:{rows:['..h..........h..','..hH........Hh..','..oRR......RRo..','.oRRRRooooRRRRo.','.oRRRRRRRRRRRRo.','oRRRyYRRRRyYRRRo','oRRRRRRRRRRRRRRo','.oRRkRRRRRRkRRo.','..oRRRRRRRRRRo..','..oRRoYYYYoRRo..','...oRRYYYYRRo...','....ooYYYYoo....','......oooo......','................','................','................'],pal:{h:'#7d6e60',H:'#cfc5b8',o:'#28080c',R:'#c92632',y:'#ff8a1a',Y:'#ffe066',k:'#140508'}},
  6:{rows:['....iiiiii......','...iIIggIIi.....','..iIIIIIIIIi....','..oMMMMMMMMo....','..oMewMMeWMo....','..oMMMmmMMMo....','..oMMooooMMo....','.bbMMMMMMMMbb...','.bBBgMMMMgBBb...','.bBBgMMMMgBBb...','..bbBBBBBBbb....','...oBB..BBo.....','...oo....oo.....','................','................','................'],pal:{i:'#464e62',I:'#b5c0d4',g:'#5fd64b',o:'#3d2a1c',M:'#987454',e:'#14100d',w:'#ffffff',W:'#e8d5b8',m:'#4d3320',b:'#1f5c24',B:'#3fa342'}},
  7:{rows:['.......y........','...y..yYy..y....','....yYYYYy......','...yYYYYYYc.....','..yYYYYYYcCc....','..yYYYYYcCCCc...','..yYYYYYcCCCc...','...yYYYYcCCc....','....yYYYcCCc....','...y..yycCCCc...','.......cCCCCc...','........cCCc....','.........cc.....','................','................','................'],pal:{y:'#ff9f1a',Y:'#ffe066',c:'#6d85d8',C:'#dbe6ff'}},
  8:{rows:['......yyyy......','....yyYYYYyy....','...yYpp..ppYy...','..yYpPPyyPPpYy..','..yYpPYYYYPpYy..','.yYppYWWWWYppYy.','.yYppYWWWWYppYy.','..yYpPYYYYPpYy..','..yYpPPyyPPpYy..','...yYpp..ppYy...','....yyYYYYyy....','......yyyy......','................','................','................','................'],pal:{y:'#d97706',Y:'#fde047',p:'#7e22ce',P:'#c084fc',W:'#ffffff'}}
};
/* Fix frost bow icon row cleanly */
SLOT_ICONS[3].rows=['......ccc.......','....ccCCCc......','...cCC...s......','..cC....s..i....','..cC...s..iI....','.cC...s..iII....','.cC..s..iIi.....','.cC.s..iI.......','.cCs..iI........','..cs.iI.........','..cCiI..........','...ccI..........','....ccc.........','......cc........','................','................'];

function drawSlotIcons(){
  var buttons=doc.querySelectorAll('#mod-hotbar .mod-slot[data-mod]');
  [].forEach.call(buttons,function(btn){
    var id=+btn.getAttribute('data-mod');
    var c=btn.querySelector('canvas.slot-ico');
    var ic=SLOT_ICONS[id];
    if(!c||!ic)return;
    var g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.clearRect(0,0,16,16);
    ic.rows.forEach(function(r,y){
      for(var x=0;x<r.length;x++){
        var k=r[x];if(k!=='.'&&ic.pal[k]){g.fillStyle=ic.pal[k];g.fillRect(x,y,1,1)}
      }
    });
  });
}

/* ---------- Shared Animation Loop ---------- */
var anims=[],raf=0,lastTs=0;
function reg(a){
  a.vis=!('IntersectionObserver' in win);anims.push(a);
  if('IntersectionObserver' in win){
    new IntersectionObserver(function(es){a.vis=es[es.length-1].isIntersecting;sync()},{rootMargin:'60px'}).observe(a.el);
  }
  return a;
}
function frame(ts){
  raf=requestAnimationFrame(frame);
  if(ts-lastTs<16)return;
  var dt=Math.min((ts-lastTs)/1000,.06);lastTs=ts;
  for(var i=0;i<anims.length;i++)if(anims[i].vis)anims[i].step(dt);
}
function sync(){
  var on=!paused&&!doc.hidden&&anims.some(function(a){return a.vis});
  if(on&&!raf){lastTs=performance.now();raf=requestAnimationFrame(frame)}
  else if(!on&&raf){cancelAnimationFrame(raf);raf=0}
}
doc.addEventListener('visibilitychange',sync);

/* ---------- Main Hero Sandbox ---------- */
var cv=doc.getElementById('scene');
if(cv&&cv.getContext)(function(){
  var box=cv.parentNode,frameEl=doc.getElementById('arena-frame');
  var mg=cv.getContext('2d'),g=mg;
  var H=124,GY=96,S=3,W=360,tx=332,anvilX=304,towerX=252;
  var wc=mk(10,H),wg=wc.getContext('2d'),sc=mk(10,H),scg=sc.getContext('2d');
  var slothImg=new Image();slothImg.onload=function(){draw()};slothImg.src='img/sloth-crawl.png';

  /* DOM HUD Elements */
  var hudScore=doc.getElementById('hud-score');
  var hudBest=doc.getElementById('hud-best');
  var hudCombo=doc.getElementById('hud-combo');
  var hudKeys=doc.getElementById('hud-keys');
  var modBanner=doc.getElementById('mod-banner');
  var bossHud=doc.getElementById('boss-hud');
  var bossFill=doc.getElementById('boss-fill');
  var focusBtn=doc.getElementById('stage-focus-btn');
  var pauseBtn=doc.getElementById('scene-pause');
  var hotbar=doc.getElementById('mod-hotbar');
  var slotBtns=hotbar?[].slice.call(hotbar.querySelectorAll('.mod-slot[data-mod]')):[];

  /* World & Gameplay State */
  var MOODS=[
    {id:'day',label:'Day',title:'SUNNY OVERWORLD',top:hx('#358be6'),bot:hx('#bde7ff'),tint:0,grav:1,sun:1,rain:0,stars:0},
    {id:'sunset',label:'Dusk',title:'CRIMSON SUNSET',top:hx('#341b5c'),bot:hx('#ff7a45'),tint:.14,grav:1,sun:2,rain:0,stars:.35},
    {id:'storm',label:'Storm',title:'THUNDERSTORM',top:hx('#121a2d'),bot:hx('#374663'),tint:.28,grav:1,sun:0,rain:1,stars:0},
    {id:'moon',label:'Moon',title:'STARLIGHT MOON · LOW GRAVITY!',top:hx('#06091a'),bot:hx('#1a2658'),tint:.34,grav:.42,sun:3,rain:0,stars:1}
  ];
  var CHAOS_MODES=[
    {id:'giants',title:'GIANT SLIMES!'},
    {id:'meteors',title:'METEOR SHOWER!'},
    {id:'frenzy',title:'2X SPEED FRENZY!'},
    {id:'loot',title:'GOLDEN LOOT RAIN!'}
  ];
  var ALLY_BARKS=['Guard duty!','Got your back!','For the colony!','Shields up!','Threat spotted!'];

  var tt=0,moodIdx=0,weapon='fireblade';
  var score=0,bestScore=parseInt(lsGet('sloth.heroBest')||'0',10)||0;
  var combo=0,comboT=0,hitStop=0,shakeT=0,shakeMag=0;
  var bannerT=0,flashSky=0,stormBolt=null;
  var chaos=null,chaosIdx=0;
  var stageFocused=false,manualIdleT=99,keys={};

  var mobs=[],loot=[],parts=[],texts=[],bolts=[],projs=[],flames=[],stars=[],clouds=[],rain=[];
  var craft=null,spawnT=.8,craftT=9;
  var hero,dragon=null,ally=null;
  var tower={level:0,target:0,prog:0,fireCd:0,blueprintT:0};
  var builder={active:false,x:304,face:-1,state:'idle',t:0,hammerT:0};

  function noise(x,y){var n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n)}
  function buildStatic(){
    sc.width=W;sc.height=H;scg=sc.getContext('2d');
    var x,y,v,d,col;
    for(x=0;x<W;x++){
      for(y=GY;y<H;y++){
        v=noise(x,y);d=y-GY;
        if(d<2)col=v<.5?'#6cc23f':'#56a832';
        else if(d<4)col=v<.5?'#438e27':'#35761e';
        else if(d<15){col=v<.18?'#5d381e':v<.6?'#764b28':'#875732';if(v>.93)col='#9c6b42'}
        else{
          col=v<.25?'#2e3340':v<.7?'#3b4152':'#484f63';
          if(v>.986)col='#5fe65c';
          else if(v>.975)col='#6ef3ff';
          else if(v>.963)col='#fcd34d';
          else if(v>.954)col='#ff4a5e';
        }
        if(d>=4&&(x%16===0||(d===15&&x%16<9)||(d===9&&x%16>8)))col=d>=15?'#222631':'#4c2d17';
        scg.fillStyle=col;scg.fillRect(x,y,1,1);
      }
    }
    /* grass tufts + tiny flowers */
    for(x=2;x<W-2;x++){
      v=noise(x,7.7);
      if(v>.55){scg.fillStyle=v>.82?'#7be04e':'#4a9a2c';scg.fillRect(x,GY-1,1,1);if(v>.9)scg.fillRect(x,GY-2,1,1)}
      else if(v<.025&&Math.abs(x-anvilX)>14&&Math.abs(x-towerX)>16){
        scg.fillStyle='#4a9a2c';scg.fillRect(x,GY-2,1,2);
        scg.fillStyle=v<.012?'#ffe066':'#ff5c77';scg.fillRect(x,GY-3,1,1);
      }
    }
    /* Oak tree on right */
    var tx0=tx;
    for(y=GY+2;y>GY-48;y--)for(x=tx0-4;x<tx0+4;x++){
      v=noise(x*3,y);
      scg.fillStyle=(x===tx0-4||x===tx0+3)?'#3f2610':(x===tx0-1||x===tx0+1)&&v>.5?'#8c5c32':v<.3?'#54351b':'#714824';
      scg.fillRect(x,y,1,1);
    }
    for(x=tx0-34;x<tx0-3;x++)for(y=GY-39;y<GY-35;y++){
      scg.fillStyle=y===GY-39?'#8c5c32':y===GY-36?'#3f2610':'#714824';
      scg.fillRect(x,y-(x<tx0-29?1:0),1,1);
    }
    leaf(tx0-38,GY-44,11,6);
    [[GY-74,13],[GY-68,21],[GY-62,25],[GY-56,22]].forEach(function(r){leaf(tx0-r[1],r[0],r[1]*2,6)});
  }
  function leaf(x0,y0,w,h){
    for(var x=0;x<w;x++)for(var y=0;y<h;y++){
      var v=noise(x0+x,y0+y);
      scg.fillStyle=y===h-1?'#1a5c1d':v<.3?'#297f27':v<.8?'#399c32':'#54bc45';
      if(v>.93)scg.fillStyle='#8be672';
      scg.fillRect(x0+x,y0+y,1,1);
    }
  }

  function layout(){
    var cw=box.clientWidth||360;
    var ns=cw<620?2:3;
    var nw=clamp(Math.floor(cw/ns),176,360);
    if(ns===S&&nw===W&&cv.width===W)return;
    S=ns;W=nw;cv.width=W;cv.height=H;mg=cv.getContext('2d');mg.imageSmoothingEnabled=false;
    cv.style.width=(W*S)+'px';cv.style.height=(H*S)+'px';
    box.style.height=(H*S)+'px';
    wc.width=W;wc.height=H;wg=wc.getContext('2d');wg.imageSmoothingEnabled=false;
    tx=W-24;anvilX=tx-28;towerX=Math.max(66,Math.min(Math.round(W*.66),anvilX-36));
    buildStatic();
    stars=[];for(var i=0;i<Math.ceil(W/3);i++)stars.push([(R()*W)|0,(R()*(GY-16))|0,R()*6.28,R()<.15]);
    clouds=[];for(i=0;i<9;i++){var L=i%3;clouds.push({x:R()*(W+80),y:6+L*13+R()*6,w:18+L*7+R()*10,v:2.2+L*2.4,L:L})}
    rain=[];for(i=0;i<56;i++)rain.push({x:R()*W,y:R()*GY,v:125+R()*55,l:4+R()*4});
    if(hero)hero.x=clamp(hero.x,10,W-10);
    if(ally)ally.x=clamp(ally.x,10,W-10);
    if(dragon)dragon.x=clamp(dragon.x,24,W-24);
    draw();
  }

  /* ---------- Score, HUD, Banner & Focus ---------- */
  function updateHud(){
    if(hudScore)hudScore.textContent=padScore(score);
    if(hudBest)hudBest.textContent=padScore(bestScore);
    if(hudCombo){
      if(combo>=2){hudCombo.textContent='COMBO x'+combo+'!';hudCombo.hidden=false}
      else hudCombo.hidden=true;
    }
    if(bossHud&&bossFill){
      if(dragon&&dragon.hp>0){
        bossHud.hidden=false;
        bossFill.style.width=Math.max(0,Math.round(dragon.hp/dragon.maxHp*100))+'%';
      }else{
        bossHud.hidden=true;
      }
    }
  }
  function addScore(pts,hitCombo){
    if(hitCombo){combo++;comboT=3.6}
    var mult=combo>=10?4:combo>=6?3:combo>=3?2:1;
    score+=Math.round(pts*mult);
    if(score>bestScore){bestScore=score;lsSet('sloth.heroBest',String(bestScore))}
    updateHud();
  }
  function showBanner(msg,tone){
    if(!modBanner)return;
    modBanner.textContent=msg;
    modBanner.className='mod-banner show'+(tone?' tone-'+tone:'');
    bannerT=2.4;
  }
  function setFocus(on){
    stageFocused=!!on;
    if(frameEl)frameEl.classList.toggle('is-focused',stageFocused);
    if(hudKeys)hudKeys.hidden=!stageFocused;
    if(focusBtn){
      focusBtn.setAttribute('aria-pressed',stageFocused?'true':'false');
      focusBtn.textContent=stageFocused?'Keys Active (Esc)':'Play w/ Keys';
    }
    if(!stageFocused){keys={}}else{manualIdleT=0}
  }
  function syncHotbarUI(){
    slotBtns.forEach(function(b){
      var m=+b.getAttribute('data-mod');
      var on=(m===1&&weapon==='fireblade')||(m===2&&weapon==='stormstaff')||(m===3&&weapon==='frostbow')||(m===4&&tower.target>0)||(m===5&&!!dragon)||(m===6&&!!ally)||(m===7&&moodIdx>0)||(m===8&&!!chaos);
      b.classList.toggle('is-active',on);
      b.setAttribute('aria-pressed',on?'true':'false');
      var tag=b.querySelector('.slot-tag');
      if(tag){
        if(m===4)tag.textContent=tower.level>0?'Lv '+tower.level:(tower.target>0?'Build':'Tower');
        else if(m===5)tag.textContent=dragon?'LIVE':'Boss';
        else if(m===6)tag.textContent=ally?'ON':'Ally';
        else if(m===7)tag.textContent=MOODS[moodIdx].label;
        else if(m===8)tag.textContent=chaos?'LIVE':'Chaos';
      }
    });
  }

  /* ---------- Particles, Captions & Shake ---------- */
  function addPart(x,y,vx,vy,l,c,s,gv){
    if(parts.length>220)parts.shift();
    parts.push({x:x,y:y,vx:vx,vy:vy,t:0,l:l,c:c,s:s||1,g:gv==null?220:gv});
  }
  function burst(x,y,cols,n,sp,gv){
    for(var i=0;i<n;i++){
      var a=R()*6.283,v=rnd(.25,1)*sp;
      addPart(x,y,Math.cos(a)*v,Math.sin(a)*v-sp*.38,rnd(.3,.75),pick(cols),R()<.35?2:1,gv);
    }
  }
  function say(t,x,y,c,l){
    if(texts.length>14){var old=texts.shift();if(old.el)old.el.remove()}
    var e=doc.createElement('div'),fs=S*3+5;
    e.className='cap';e.setAttribute('aria-hidden','true');e.textContent=t;
    e.style.color=c||'#ffe066';e.style.fontSize=fs+'px';
    box.appendChild(e);
    texts.push({s:t,el:e,wd:t.length*fs*.55,x:x,y:y,t:0,l:l||1.6});
  }
  function dmgPop(val,x,y,c,big){
    texts.push({n:String(val),x:x,y:y,t:0,l:.75,c:c||'#fff',z:big?2:1});
  }
  function triggerJuice(stopMs,shake){
    if(reduce)return;
    if(stopMs)hitStop=Math.max(hitStop,stopMs/1000);
    if(shake){shakeT=.16;shakeMag=Math.max(shakeMag,shake)}
  }

  /* ---------- Entities & Spawning ---------- */
  function newHero(){
    return{x:W*.34,face:1,sw:0,cd:0,hit:0,tg:null,t:0,wt:0,wx:W*.34,hy:0,vy:0,mv:0,coyote:0,jumps:2,overdrive:0,dashT:0,dashDir:1,aimX:null,aimY:null,manualTarget:null};
  }
  function spawn(type,x,pop,giant){
    if(mobs.length>=7&&!giant)return null;
    type=type||pick(MOBS);
    var d=MOB[type]||MOB.slime;
    var side=R()<.65?-1:1;
    var scScale=giant?1.8:1;
    var m={
      type:type,d:d,w:Math.round(d.s.w*scScale),h:Math.round(d.s.h*scScale),scale:scScale,giant:!!giant,
      x:pop?x:(side<0?-10:W+10),hp:giant?8:d.hp,maxHp:giant?8:d.hp,
      hy:pop?(d.fly?18:22):0,vy:0,kb:0,fl:0,t:R()*9,ht:rnd(.1,.55),lane:(R()*4)|0,dir:1,
      burnT:0,burnTick:0,frozenT:0
    };
    mobs.push(m);
    if(pop)burst(m.x,GY+2-m.h/2,['#fff','#cfd6e8',d.c[0]],10,48);
    return m;
  }
  function spawnLoot(k,x,y){
    if(loot.length>18)loot.shift();
    loot.push({k:k||pick(LOOT),x:x,y:y,vx:rnd(-38,38),vy:-rnd(68,112),t:0,rest:0,age:0,b:0});
  }

  function hitMob(m,dir,dmg,kind){
    if(!m||mobs.indexOf(m)<0)return;
    var crit=dmg>=3;
    m.hp-=dmg;m.fl=.13;m.kb=dir*(kind==='fire'?135:kind==='ally'?110:85);
    if(!m.d.fly&&m.hy<2&&m.frozenT<=0)m.vy=kind==='fire'?64:48;
    var top=GY+3+m.lane-m.h-m.hy;
    var col=kind==='zap'?'#72f3ff':kind==='ice'?'#a5f3fc':kind==='fire'?'#ffae33':crit?'#ffe066':'#fff';
    dmgPop(dmg,m.x,top-3,col,crit||kind==='zap');
    burst(m.x,top+m.h/2,[m.d.c[0],col,'#fff'],crit?10:6,65);
    if(kind==='fire'){m.burnT=2.6;m.burnTick=.75}
    if(kind==='ice'){m.frozenT=2.2;m.kb*=0.35;sfx('ice')}
    else if(kind!=='burn'&&kind!=='arrow'){sfx('hit')}
    addScore(15,true);
    if(crit)triggerJuice(35,1.8);
    if(m.hp<=0)killMob(m,kind==='ice'||m.frozenT>0);
  }
  function killMob(m,shatter){
    var idx=mobs.indexOf(m);if(idx<0)return;
    mobs.splice(idx,1);
    var top=GY+3+m.lane-m.h/2-m.hy;
    addScore(m.giant?95:40,true);
    if(shatter){
      sfx('shatter');
      burst(m.x,top,['#7ceeff','#c8fbff','#ffffff','#38bdf8'],18,95);
      /* frost shatter splash */
      mobs.slice().forEach(function(o){
        if(Math.abs(o.x-m.x)<26){o.hp-=1;o.fl=.12;o.frozenT=Math.max(o.frozenT,1.1);dmgPop(1,o.x,GY-o.h-4,'#a5f3fc',0);if(o.hp<=0)killMob(o,false)}
      });
    }else{
      burst(m.x,top,m.d.c.concat(['#fff','#ffe066']),18,88);
    }
    if(m.giant){
      /* split into 2 mini slimes */
      var s1=spawn('slime',clamp(m.x-10,12,W-12),true,false);
      var s2=spawn('slime',clamp(m.x+10,12,W-12),true,false);
      if(s1){s1.vy=65;s1.kb=-40}
      if(s2){s2.vy=65;s2.kb=40}
    }
    var drops=m.giant?3:(1+(R()<.45?1:0));
    for(var i=0;i<drops;i++)spawnLoot(pick(LOOT),m.x+rnd(-5,5),top+2);
    if(hero.tg===m)hero.tg=null;
  }

  function hitDragon(dmg,kind){
    if(!dragon||dragon.hp<=0)return;
    dragon.hp-=dmg;dragon.fl=.14;
    var col=kind==='zap'?'#72f3ff':kind==='ice'?'#a5f3fc':kind==='fire'?'#ffae33':'#ffe066';
    dmgPop(dmg,dragon.x,dragon.y-12,col,dmg>=3||kind==='zap');
    burst(dragon.x,dragon.y,[col,'#ff4a5e','#ffe066','#fff'],10,75,80);
    addScore(25,true);
    if(kind==='zap'||dmg>=3)triggerJuice(35,2);
    if(dragon.hp<=0){
      var dx=dragon.x,dy=dragon.y;
      dragon=null;
      sfx('win');
      triggerJuice(55,3.2);
      burst(dx,dy,['#ff4a5e','#ff8a1a','#ffe066','#6ef3ff','#fff'],42,120,120);
      for(var i=0;i<8;i++)spawnLoot(i%2?'diamond':'gem',clamp(dx+rnd(-18,18),14,W-14),dy);
      addScore(250,true);
      say('DRAGON SLAIN! +250',dx,Math.max(22,dy-10),'#ffe066',2.6);
      showBanner('EMBER DRAGON SLAIN! +250 SCORE','gold');
      syncHotbarUI();
    }
    updateHud();
  }

  /* ---------- Weapons & Mod Triggers ---------- */
  function fireWeapon(targetX,targetY,clickedMob,clickedDragon){
    var h=hero,bonus=h.overdrive>0?1:0;
    if(targetX!=null)h.face=targetX<h.x?-1:1;

    if(weapon==='fireblade'){
      h.sw=.001;h.hit=0;h.cd=chaos&&chaos.id==='frenzy'?.14:.26;
      sfx('fire');
      /* flame arc wave */
      var reach=34,hitAny=false;
      for(var i=0;i<9;i++){
        var ang=-1.2+i*.3;
        addPart(h.x+h.face*(8+Math.cos(ang)*14),GY-8-h.hy+Math.sin(ang)*11,h.face*rnd(20,55),rnd(-28,12),.28,pick(['#ff3b30','#ff8c1a','#ffe066','#fff']),R()<.5?2:1,30);
      }
      mobs.slice().forEach(function(m){
        var dx=m.x-h.x;
        if((dx*h.face>=-8&&Math.abs(dx)<=reach+m.w/2)&&Math.abs((GY-m.hy)-(GY-h.hy))<28){
          hitMob(m,h.face,2+bonus+(R()<.25?1:0),'fire');hitAny=true;
        }
      });
      if(dragon&&Math.abs(dragon.x-h.x)<42&&Math.abs(dragon.y-(GY-10-h.hy))<30){
        hitDragon(3+bonus,'fire');hitAny=true;
      }
      if(clickedMob&&mobs.indexOf(clickedMob)>=0&&!hitAny){
        /* dash toward clicked mob */
        h.dashT=.18;h.dashDir=clickedMob.x<h.x?-1:1;h.face=h.dashDir;
        h.manualTarget=clickedMob;
      }
    }
    else if(weapon==='stormstaff'){
      h.sw=.001;h.cd=chaos&&chaos.id==='frenzy'?.2:.36;
      sfx('zap');
      /* pick up to 3 targets for chain lightning */
      var pool=[];
      if(clickedDragon&&dragon)pool.push({kind:'dragon',obj:dragon,x:dragon.x,y:dragon.y});
      if(clickedMob&&mobs.indexOf(clickedMob)>=0)pool.push({kind:'mob',obj:clickedMob,x:clickedMob.x,y:GY-clickedMob.h/2-clickedMob.hy});
      var rest=[];
      mobs.forEach(function(m){
        if(m!==clickedMob&&m.x>-6&&m.x<W+6)rest.push({kind:'mob',obj:m,x:m.x,y:GY-m.h/2-m.hy,d:Math.abs(m.x-h.x)});
      });
      if(dragon&&!clickedDragon)rest.push({kind:'dragon',obj:dragon,x:dragon.x,y:dragon.y,d:Math.hypot(dragon.x-h.x,dragon.y-(GY-10-h.hy))});
      rest.sort(function(a,b){return a.d-b.d});
      while(pool.length<3&&rest.length){
        var cand=rest.shift();
        if(cand.d<210)pool.push(cand);
      }
      var sx=h.x+h.face*7,sy=GY-11-h.hy;
      if(pool.length){
        h.face=pool[0].x<h.x?-1:1;sx=h.x+h.face*7;
        var prevX=sx,prevY=sy;
        pool.forEach(function(tg,idx){
          bolts.push({x1:prevX,y1:prevY,x2:tg.x,y2:tg.y,t:0,l:.26,ring:true});
          prevX=tg.x;prevY=tg.y;
          var dmg=(idx===0?2:1)+bonus+(R()<.25?1:0);
          if(tg.kind==='dragon')hitDragon(dmg,'zap');
          else hitMob(tg.obj,tg.x<h.x?-1:1,dmg,'zap');
        });
        triggerJuice(35,2.1);
      }else{
        var ex=clamp(targetX!=null?targetX:h.x+h.face*72,8,W-8);
        var ey=clamp(targetY!=null?targetY:GY-18,12,GY-2);
        bolts.push({x1:sx,y1:sy,x2:ex,y2:ey,t:0,l:.22,ring:true});
        burst(ex,ey,['#72f3ff','#ffe066','#fff'],8,55,40);
      }
    }
    else if(weapon==='frostbow'){
      h.sw=.001;h.cd=chaos&&chaos.id==='frenzy'?.16:.3;
      sfx('arrow');
      var ox=h.x+h.face*6,oy=GY-9-h.hy;
      var tx2=targetX,ty2=targetY;
      if(clickedDragon&&dragon){tx2=dragon.x;ty2=dragon.y}
      else if(clickedMob&&mobs.indexOf(clickedMob)>=0){tx2=clickedMob.x;ty2=GY-clickedMob.h/2-clickedMob.hy}
      else if(tx2==null){
        var nearest=findNearestTarget(h.x,oy);
        if(nearest){tx2=nearest.x;ty2=nearest.y}
        else{tx2=ox+h.face*90;ty2=oy-6}
      }
      var dx2=tx2-ox,dy2=ty2-oy,len=Math.hypot(dx2,dy2)||1;
      h.face=dx2<0?-1:1;
      projs.push({kind:'ice',x:ox,y:oy,vx:(dx2/len)*235,vy:(dy2/len)*235,dmg:2+bonus,t:0,l:1.4,from:'hero'});
      burst(ox,oy,['#7ceeff','#fff'],5,30,20);
    }
  }

  function findNearestTarget(x,y){
    var best=null,bd=1e9;
    mobs.forEach(function(m){
      if(m.x<-4||m.x>W+4)return;
      var d=Math.hypot(m.x-x,(GY-m.h/2-m.hy)-y);
      if(d<bd){bd=d;best={x:m.x,y:GY-m.h/2-m.hy,mob:m}}
    });
    if(dragon&&dragon.hp>0){
      var dd=Math.hypot(dragon.x-x,dragon.y-y);
      if(dd<bd*1.15){best={x:dragon.x,y:dragon.y,dragon:true}}
    }
    return best;
  }

  function forgeBurst(){
    sfx('forge');
    hero.overdrive=6.5;
    addScore(30,false);
    burst(anvilX,GY-7,['#ffe066','#ff8c1a','#7be04e','#fff'],22,90);
    for(var i=0;i<3;i++)spawnLoot(i===0?'emerald':i===1?'gem':'diamond',anvilX+rnd(-8,6),GY-10);
    if(!craft)startCraft();
    say('FORGE POWER-UP!',anvilX-4,GY-22,'#ffe066',1.8);
    showBanner('ANVIL FORGE BURST! +1 WEAPON POWER','gold');
  }

  function startCraft(k){
    if(craft)return;
    var it=k?itemOf(k):pick(IT);
    craft={it:it,t:0,x:anvilX,order:shuffle(it.s.px.length)};
  }
  function shuffle(n){var a=[],i,j,t;for(i=0;i<n;i++)a.push(i);for(i=n-1;i>0;i--){j=(R()*(i+1))|0;t=a[i];a[i]=a[j];a[j]=t}return a}

  function triggerMod(slot){
    slot=+slot;
    burst(anvilX,GY-7,['#ffe066','#7be04e','#fff'],12,55);
    if(slot===1){
      weapon='fireblade';sfx('fire');
      showBanner('MOD LOADED: FIREBLADE!','fire');
      say('Fireblade!',hero.x,GY-22-hero.hy,'#ff8c1a',1.4);
      fireWeapon(hero.x+hero.face*24,GY-8);
    }else if(slot===2){
      weapon='stormstaff';sfx('zap');
      showBanner('MOD LOADED: STORM STAFF!','cyan');
      say('Storm Staff!',hero.x,GY-22-hero.hy,'#72f3ff',1.4);
      fireWeapon(null,null);
    }else if(slot===3){
      weapon='frostbow';sfx('ice');
      showBanner('MOD LOADED: FROST BOW!','cyan');
      say('Frost Bow!',hero.x,GY-22-hero.hy,'#a5f3fc',1.4);
      fireWeapon(null,null);
    }else if(slot===4){
      if(tower.target<3){
        tower.target++;
        tower.blueprintT=2.2;
        if(!builder.active){builder.active=true;builder.x=anvilX;builder.state='toSite';builder.t=0}
        else if(builder.state==='return'){builder.state='toSite'}
        sfx('build');
        showBanner('COLONY MOD: WATCHTOWER LV '+tower.target+'!','emerald');
        say('Blueprint Lv '+tower.target+'!',towerX,GY-20-tower.level*10,'#ffe066',1.7);
      }else{
        sfx('build');
        showBanner('CITADEL LV 3: ARROW BARRAGE!','emerald');
        for(var k=0;k<5;k++){
          var tg=findNearestTarget(towerX,GY-38);
          var ang=tg?Math.atan2(tg.y-(GY-38),tg.x-towerX)+rnd(-.18,.18):-2.7+k*.18;
          projs.push({kind:'tower',x:towerX,y:GY-38,vx:Math.cos(ang)*215,vy:Math.sin(ang)*215,dmg:2,t:0,l:1.5,from:'tower'});
        }
        burst(towerX,GY-38,['#ffe066','#7be04e','#fff'],14,65,40);
      }
    }else if(slot===5){
      if(!dragon){
        dragon={x:W+24,y:28,vx:-40,t:0,hp:24,maxHp:24,fl:0,breathCd:2.2,telegraph:0,face:-1};
        sfx('roar');
        triggerJuice(0,2.2);
        showBanner('BOSS MOD: EMBER DRAGON AWAKENS!','fire');
        say('ROOOAR!',W*.75,26,'#ff5c5c',1.8);
      }else{
        dragon.telegraph=.55;dragon.breathCd=3.2;sfx('roar');
        showBanner('EMBER DRAGON BREATHES FIRE!','fire');
      }
      updateHud();
    }else if(slot===6){
      if(!ally){
        ally={x:clamp(hero.x-hero.face*18,12,W-12),hy:14,vy:40,face:hero.face,t:0,cd:0,barkT:.6,healT:4.5,mv:0};
        sfx('ally');
        burst(ally.x,GY-8,['#7be04e','#ffe066','#fff'],16,65);
        say('Guard duty!',ally.x,GY-22,'#9dff7a',1.7);
        showBanner('BRAIN STUDIO: SLOTH ALLY JOINED!','emerald');
      }else{
        burst(ally.x,GY-8,['#cfd6e8','#7be04e'],12,45);
        say('Back to base!',ally.x,GY-18,'#cbd5e1',1.3);
        ally=null;
        sfx('hit');
        showBanner('SLOTH ALLY RECALLED','');
      }
    }else if(slot===7){
      moodIdx=(moodIdx+1)%MOODS.length;
      sfx('mood');
      var md=MOODS[moodIdx];
      showBanner('WORLD MOOD: '+md.title,md.id==='moon'?'cyan':md.id==='sunset'?'fire':'');
      if(md.id==='moon'){
        hero.vy=Math.max(hero.vy,82);
        if(ally)ally.vy=Math.max(ally.vy,72);
        say('Low Gravity!',hero.x,GY-24-hero.hy,'#7ceeff',1.6);
      }
    }else if(slot===8){
      var cm=CHAOS_MODES[chaosIdx%CHAOS_MODES.length];chaosIdx++;
      chaos={id:cm.id,title:cm.title,t:10,tick:.25};
      sfx('chaos');
      triggerJuice(0,2);
      showBanner('CHAOS WHEEL: '+cm.title,'gold');
      if(cm.id==='giants'){
        spawn('slime',clamp(W*.2,18,W-48),true,true);
        spawn('slime',clamp(W*.52,18,W-48),true,true);
      }else if(cm.id==='frenzy'){
        for(var s=0;s<3;s++)spawn(pick(MOBS),clamp(22+s*55,14,W-60),true,false);
      }else if(cm.id==='loot'){
        for(var l=0;l<10;l++)spawnLoot(pick(LOOT),rnd(18,W-55),rnd(10,34));
        spawn('skeleton',16,true,false);spawn('golem',W*.55,true,false);
      }else if(cm.id==='meteors'){
        spawn(pick(MOBS),W*.25,true,false);spawn(pick(MOBS),W*.58,true,false);
      }
    }
    syncHotbarUI();
    if(paused)draw();
  }

  /* ---------- Simulation Step ---------- */
  function sim(dt){
    if(hitStop>0){hitStop-=dt;if(hitStop<0)hitStop=0;return}
    tt+=dt;
    var md=MOODS[moodIdx],grav=310*md.grav;
    var speedMult=(chaos&&chaos.id==='frenzy')?1.8:1;

    if(shakeT>0){shakeT-=dt;if(shakeT<=0)shakeMag=0}
    if(comboT>0){comboT-=dt;if(comboT<=0){combo=0;updateHud()}}
    if(bannerT>0){bannerT-=dt;if(bannerT<=0&&modBanner)modBanner.classList.remove('show')}
    if(flashSky>0)flashSky=Math.max(0,flashSky-dt*3.2);

    /* Thunderstorm ambient lightning */
    if(md.rain){
      for(var r=0;r<rain.length;r++){
        var rn=rain[r];rn.x-=38*dt;rn.y+=rn.v*dt;
        if(rn.y>=GY){if(R()<.2)addPart(rn.x,GY,rnd(-12,12),-rnd(12,28),.18,'#93c5fd',1,160);rn.y=rnd(-14,0);rn.x=R()*(W+24)}
        if(rn.x<0)rn.x+=W;
      }
      if(R()<dt*.22){
        flashSky=.75;
        var lx=rnd(24,W-40);
        stormBolt={x:lx,t:.22};
      }
    }
    if(stormBolt){stormBolt.t-=dt;if(stormBolt.t<=0)stormBolt=null}

    /* Chaos mutator updates */
    if(chaos){
      chaos.t-=dt;chaos.tick-=dt;
      if(chaos.id==='meteors'&&chaos.tick<=0){
        chaos.tick=.62;
        var mx=rnd(20,W-54);
        projs.push({kind:'meteor',x:mx+36,y:-6,vx:-72,vy:148,dmg:3,t:0,l:1.4,from:'chaos'});
      }else if(chaos.id==='loot'&&chaos.tick<=0){
        chaos.tick=.95;spawnLoot(pick(LOOT),rnd(16,W-56),8);
      }
      if(chaos.t<=0){chaos=null;syncHotbarUI()}
    }

    /* Spawning & idle crafting */
    spawnT-=dt*speedMult;
    if(spawnT<=0){spawnT=rnd(2.6,5.0);if(mobs.length<4)spawn()}
    craftT-=dt;
    if(craftT<=0){craftT=rnd(12,18);startCraft()}

    var i,m,h=hero;
    if(h.overdrive>0)h.overdrive-=dt;
    manualIdleT+=dt;
    var manualActive=stageFocused&&manualIdleT<12;

    /* Colony Builder & Watchtower */
    if(tower.blueprintT>0)tower.blueprintT-=dt;
    if(!builder.active&&tower.level<tower.target){builder.active=true;builder.x=anvilX;builder.state='toSite';builder.t=0}
    if(builder.active){
      builder.t+=dt;
      if(builder.state==='toSite'){
        var bdx=towerX-10-builder.x;
        builder.face=bdx<0?-1:1;
        if(Math.abs(bdx)>2){builder.x+=builder.face*78*dt}
        else{builder.state='build';builder.hammerT=0}
      }else if(builder.state==='build'){
        builder.face=1;builder.hammerT-=dt;
        tower.prog+=dt*1.2;
        if(builder.hammerT<=0){
          builder.hammerT=.18;sfx('hammer');
          burst(towerX,GY-6-tower.level*11-tower.prog*10,['#ffe066','#ffae33','#fff'],6,45,140);
        }
        if(tower.prog>=1){
          tower.level=Math.min(3,tower.level+1);tower.prog=0;
          sfx('build');syncHotbarUI();
          burst(towerX,GY-12-tower.level*9,['#7be04e','#ffe066','#fff'],16,75);
          say('Tower Lv '+tower.level+'!',towerX,GY-18-tower.level*10,'#9dff7a',1.5);
          if(tower.level>=tower.target)builder.state='return';
        }
      }else if(builder.state==='return'){
        var rdx=anvilX-builder.x;builder.face=rdx<0?-1:1;
        if(Math.abs(rdx)>3)builder.x+=builder.face*68*dt;
        else{builder.active=false;builder.state='idle'}
      }
    }
    if(tower.level>0){
      tower.fireCd-=dt*speedMult;
      if(tower.fireCd<=0){
        var tyTower=GY-(14+tower.level*9);
        var tgTower=findNearestTarget(towerX,tyTower);
        if(tgTower){
          tower.fireCd=tower.level===1?1.25:tower.level===2?.85:.58;
          sfx('arrow');
          var count=tower.level===3?2:1;
          for(var a=0;a<count;a++){
            var adx=tgTower.x-towerX,ady=tgTower.y-tyTower,al=Math.hypot(adx,ady)||1;
            var spread=count===2?(a===0?-0.07:0.07):0;
            var ang=Math.atan2(ady/al,adx/al)+spread;
            projs.push({kind:'tower',x:towerX,y:tyTower,vx:Math.cos(ang)*210,vy:Math.sin(ang)*210,dmg:tower.level>=2?2:1,t:0,l:1.5,from:'tower'});
          }
        }
      }
    }

    /* Boss Ember Dragon */
    if(dragon){
      dragon.t+=dt;if(dragon.fl>0)dragon.fl-=dt;
      var targetX=W*.5+Math.sin(dragon.t*0.85)*(W*.36);
      var targetY=28+Math.sin(dragon.t*1.7)*14+(dragon.telegraph>0?8:0);
      var ddx=targetX-dragon.x,ddy=targetY-dragon.y;
      dragon.face=ddx<0?-1:1;
      dragon.x+=clamp(ddx*1.8,-75,75)*dt;
      dragon.y+=clamp(ddy*2.2,-42,42)*dt;
      dragon.breathCd-=dt;
      if(dragon.telegraph>0){
        dragon.telegraph-=dt;
        if(R()<dt*26)addPart(dragon.x+dragon.face*18,dragon.y+2,rnd(-12,12),rnd(-14,6),.3,pick(['#ff3b30','#ff8c1a','#ffe066']),2,10);
        if(dragon.telegraph<=0){
          sfx('fire');
          for(var fb=-1;fb<=1;fb++){
            var fx=hero.x+fb*24-dragon.x,fy=(GY-4)-dragon.y,fln=Math.hypot(fx,fy)||1;
            projs.push({kind:'fireball',x:dragon.x+dragon.face*16,y:dragon.y+3,vx:(fx/fln)*112,vy:(fy/fln)*112,t:0,l:2.4,from:'dragon'});
          }
        }
      }else if(dragon.breathCd<=0){
        dragon.telegraph=.65;dragon.breathCd=rnd(3.4,5.0);
        say('FIRE BREATH!',dragon.x,Math.max(14,dragon.y-12),'#ff7043',1.1);
      }
    }

    /* Brain Studio Sloth Companion */
    if(ally){
      ally.t+=dt;ally.cd-=dt;ally.barkT-=dt;ally.healT-=dt;ally.mv=0;
      if(ally.hy>0||ally.vy>0){ally.vy-=grav*dt;ally.hy+=ally.vy*dt;if(ally.hy<0){ally.hy=0;ally.vy=0}}
      var nearM=null,nd=72;
      for(i=0;i<mobs.length;i++){var md2=Math.abs(mobs[i].x-ally.x);if(md2<nd){nd=md2;nearM=mobs[i]}}
      if(nearM){
        var adx2=nearM.x-ally.x;ally.face=adx2<0?-1:1;
        if(Math.abs(adx2)>11){ally.x+=ally.face*46*speedMult*dt;ally.mv=1}
        else if(ally.cd<=0){
          ally.cd=.65/speedMult;ally.vy=48;
          hitMob(nearM,ally.face,2,'ally');sfx('ally');
          if(ally.barkT<=0){ally.barkT=3.2;say(pick(ALLY_BARKS),ally.x,GY-18-ally.hy,'#9dff7a',1.4)}
        }
      }else{
        var followX=clamp(hero.x-hero.face*18,12,W-12);
        var fdx=followX-ally.x;
        if(Math.abs(fdx)>5){ally.face=fdx<0?-1:1;ally.x+=ally.face*44*speedMult*dt;ally.mv=1}
        else ally.face=hero.face;
      }
      if(ally.healT<=0){
        ally.healT=6.5;
        burst(hero.x,GY-8-hero.hy,['#7be04e','#b4ff9c','#fff'],7,38,-20);
        if(ally.barkT<=0){ally.barkT=3.4;say(pick(ALLY_BARKS),ally.x,GY-18-ally.hy,'#9dff7a',1.4)}
      }
      ally.x=clamp(ally.x,8,W-8);
    }

    /* Mobs */
    for(i=mobs.length-1;i>=0;i--){
      m=mobs[i];m.t+=dt;
      if(m.fl>0)m.fl-=dt;
      if(m.burnT>0){
        m.burnT-=dt;m.burnTick-=dt;
        if(R()<dt*12)addPart(m.x+rnd(-m.w/3,m.w/3),GY-m.h/2-m.hy,rnd(-8,8),-rnd(15,32),.35,pick(['#ff3b30','#ff8c1a','#ffe066']),1,-15);
        if(m.burnTick<=0){m.burnTick=.85;hitMob(m,0,1,'burn');if(mobs.indexOf(m)<0)continue}
      }
      if(m.frozenT>0){
        m.frozenT-=dt;
        m.x+=m.kb*dt;m.kb*=Math.max(0,1-10*dt);
        if(m.hy>0||m.vy>0){m.vy-=grav*dt;m.hy+=m.vy*dt;if(m.hy<0){m.hy=0;m.vy=0}}
        continue;
      }
      var dx=h.x-m.x;m.dir=dx<0?-1:1;var stop=m.w/2+10,mv=0;
      if(Math.abs(dx)>stop){
        if(m.type==='slime'){if(m.hy>0)mv=m.d.sp*1.55}else mv=m.d.sp*(Math.abs(m.kb)>20?.2:1);
      }
      if(mv){
        for(var o=0;o<mobs.length;o++){
          var q=mobs[o];
          if(q!==m&&Math.abs(q.x-h.x)<Math.abs(m.x-h.x)&&(q.x-m.x)*m.dir>0&&Math.abs(q.x-m.x)<(q.w+m.w)/2+2){mv=0;break}
        }
      }
      m.x+=m.dir*mv*dt+m.kb*dt;m.kb*=Math.max(0,1-7*dt);if(Math.abs(m.kb)<4)m.kb=0;
      if(m.d.fly){m.hy=18+Math.sin(m.t*3.3)*4}
      else{
        if(m.hy<=0&&m.vy<=0){m.hy=0;m.vy=0;m.ht-=dt;if(m.type==='slime'&&m.ht<=0&&Math.abs(dx)>stop){m.vy=m.giant?92:74;m.ht=rnd(.45,.82)}}
        if(m.hy>0||m.vy>0){m.vy-=grav*dt;m.hy+=m.vy*dt;if(m.hy<0){m.hy=0;m.vy=0}}
      }
    }

    /* Hero Physics & Controls / Smart Attract AI */
    h.t+=dt;if(h.cd>0)h.cd-=dt;h.mv=0;
    if(h.sw>0){h.sw+=dt;if(h.sw>=.28)h.sw=0}
    if(h.hy<=0){h.coyote=.11;h.jumps=2}else if(h.coyote>0){h.coyote-=dt}

    if(h.dashT>0){
      h.dashT-=dt;h.x+=h.dashDir*145*dt;h.mv=1;
      if(R()<.8)addPart(h.x,GY-6-h.hy,-h.dashDir*15,rnd(-8,8),.2,'#ffe066',2,0);
      if(h.manualTarget&&mobs.indexOf(h.manualTarget)>=0&&Math.abs(h.manualTarget.x-h.x)<26){
        h.dashT=0;fireWeapon(h.manualTarget.x,GY-8,h.manualTarget,false);h.manualTarget=null;
      }
    }else if(manualActive){
      var dirKey=(keys.right?1:0)-(keys.left?1:0);
      if(dirKey){h.face=dirKey;h.x+=dirKey*74*speedMult*dt;h.mv=1}
      if(keys.attack&&h.cd<=0){fireWeapon(null,null)}
    }else{
      /* Smart Attract AI */
      var tg=null,bd=1e9;
      for(i=0;i<mobs.length;i++){var d2=Math.abs(mobs[i].x-h.x);if(d2<bd&&mobs[i].x>-4&&mobs[i].x<W+4){bd=d2;tg=mobs[i]}}
      /* Leap over incoming dragon fireballs */
      if(h.hy<=0){
        for(i=0;i<projs.length;i++){
          var pr=projs[i];
          if(pr.kind==='fireball'&&Math.abs(pr.x-h.x)<22&&pr.y>GY-26){h.vy=108;h.jumps=1;sfx('jump');break}
        }
      }
      if(tg){
        var idealDist=weapon==='fireblade'?(tg.w/2+15):weapon==='stormstaff'?78:92;
        var ddx2=tg.x-h.x;h.face=ddx2<0?-1:1;
        if(Math.abs(ddx2)>idealDist){h.x+=h.face*56*speedMult*dt;h.mv=1}
        else if(h.cd<=0){fireWeapon(tg.x,GY-tg.h/2-tg.hy,tg,false)}
      }else if(dragon&&dragon.hp>0){
        var drx=dragon.x-h.x;h.face=drx<0?-1:1;
        if(weapon==='fireblade'){
          if(Math.abs(drx)>26){h.x+=h.face*58*speedMult*dt;h.mv=1}
          else if(h.hy<=0){h.vy=116;h.jumps=1;sfx('jump')}
          else if(h.hy>18&&h.cd<=0){fireWeapon(dragon.x,dragon.y,null,true)}
        }else if(h.cd<=0){
          fireWeapon(dragon.x,dragon.y,null,true);
        }
      }else{
        var lt=null,ld=1e9;
        for(i=0;i<loot.length;i++)if(loot[i].rest){var d3=Math.abs(loot[i].x-h.x);if(d3<ld){ld=d3;lt=loot[i]}}
        if(lt){
          var lx=lt.x-h.x;h.face=lx<0?-1:1;
          if(Math.abs(lx)>5){h.x+=h.face*56*speedMult*dt;h.mv=1}
        }else{
          h.wt-=dt;
          if(h.wt<=0){h.wt=rnd(1.8,3.6);h.wx=clamp(W*.34+rnd(-W*.2,W*.16),16,towerX-18)}
          var wd=h.wx-h.x;
          if(Math.abs(wd)>3){h.face=wd<0?-1:1;h.x+=h.face*24*dt;h.mv=1}
        }
      }
    }

    /* Hero vertical physics */
    if(h.hy>0||h.vy>0){
      h.vy-=grav*dt;h.hy+=h.vy*dt;
      if(h.hy<0){h.hy=0;h.vy=0}
    }
    h.x=clamp(h.x,8,W-8);

    /* Collect nearby loot automatically */
    for(i=loot.length-1;i>=0;i--){
      var l=loot[i];l.age+=dt;
      if(!l.rest){
        l.vy+=grav*dt;l.y+=l.vy*dt;l.x+=l.vx*dt;l.vx*=Math.max(0,1-1.6*dt);
        var gy=GY+4;
        if(l.y>=gy){l.y=gy;if(l.vy>30){l.vy=-l.vy*.48;l.b++;if(l.k==='duck'&&l.b===1)say('squeak!',l.x,GY-8,'#ffe066',.7)}else{l.vy=0;l.rest=1}}
      }
      if(l.age>.25&&Math.abs(l.x-h.x)<10&&h.hy<14){
        loot.splice(i,1);var it=itemOf(l.k);
        sfx('coin');addScore(25,false);
        say('+'+it.n,h.x,GY-24-h.hy,'#9dff7a',1.2);
        burst(h.x,GY-6-h.hy,it.t.concat(['#fff']),7,42);
        continue;
      }
      if(l.age>15)loot.splice(i,1);
    }

    /* Projectiles (Ice arrows, Tower arrows, Dragon fireballs, Chaos meteors) */
    for(i=projs.length-1;i>=0;i--){
      var p=projs[i];p.t+=dt;
      if(p.kind==='tower')p.vy+=45*dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.kind==='ice'&&R()<.65)addPart(p.x,p.y,0,0,.2,pick(['#7ceeff','#fff']),1,0);
      else if(p.kind==='fireball'||p.kind==='meteor')addPart(p.x,p.y,rnd(-12,12),rnd(-18,4),.25,pick(['#ff3b30','#ff8c1a','#ffe066']),2,-10);

      var dead=p.t>p.l||p.x<-16||p.x>W+16||p.y>GY+5;
      if(p.kind==='ice'||p.kind==='tower'){
        for(var j=mobs.length-1;j>=0;j--){
          var tm=mobs[j];
          if(Math.abs(p.x-tm.x)<tm.w/2+4&&p.y>=GY-tm.h-tm.hy-3&&p.y<=GY-tm.hy+4){
            hitMob(tm,p.vx<0?-1:1,p.dmg,p.kind==='ice'?'ice':'arrow');
            dead=true;break;
          }
        }
        if(!dead&&dragon&&Math.abs(p.x-dragon.x)<18&&Math.abs(p.y-dragon.y)<12){
          hitDragon(p.dmg,p.kind==='ice'?'ice':'arrow');dead=true;
        }
      }else if(p.kind==='meteor'&&p.y>=GY){
        sfx('fire');triggerJuice(0,1.6);
        burst(p.x,GY-2,['#ff3b30','#ff8c1a','#ffe066','#fff'],18,88);
        mobs.slice().forEach(function(mm){if(Math.abs(mm.x-p.x)<32)hitMob(mm,mm.x<p.x?-1:1,3,'fire')});
        if(R()<.55)spawnLoot('gem',clamp(p.x,12,W-12),GY-4);
        dead=true;
      }else if(p.kind==='fireball'&&p.y>=GY){
        burst(p.x,GY-1,['#ff3b30','#ff8c1a','#ffe066'],10,55);
        flames.push({x:p.x,t:0,l:2.4});
        dead=true;
      }
      if(dead)projs.splice(i,1);
    }

    /* Ground fire patches from Dragon */
    for(i=flames.length-1;i>=0;i--){
      var fl=flames[i];fl.t+=dt;
      if(R()<dt*16)addPart(fl.x+rnd(-5,5),GY,rnd(-6,6),-rnd(12,26),.3,pick(['#ff3b30','#ff8c1a','#ffe066']),1,-15);
      if(fl.t>fl.l)flames.splice(i,1);
    }

    /* Lightning bolts */
    for(i=bolts.length-1;i>=0;i--){bolts[i].t+=dt;if(bolts[i].t>bolts[i].l)bolts.splice(i,1)}

    /* Craft animation at anvil */
    if(craft){
      craft.t+=dt;
      if(R()<dt*14)addPart(anvilX+rnd(-8,8),GY-14,rnd(-10,10),-rnd(14,32),.55,pick(['#fff','#ffe066',craft.it.t[0]]),1,-20);
      if(craft.t>=1.5){
        var c=craft;craft=null;
        say(c.it.n+'!',c.x,GY-34,'#ffe066',1.6);
        burst(c.x,GY-12,c.it.t.concat(['#fff','#ffe066']),14,65);
        spawnLoot(c.it.k,c.x-4,GY-8);
      }
    }

    /* Particles & Floating Texts */
    for(i=parts.length-1;i>=0;i--){var pt=parts[i];pt.t+=dt;pt.vy+=pt.g*dt;pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;if(pt.t>pt.l)parts.splice(i,1)}
    for(i=texts.length-1;i>=0;i--){var q=texts[i];q.t+=dt;if(q.t>q.l){if(q.el)q.el.remove();texts.splice(i,1)}}
  }

  /* ---------- Drawing Helpers ---------- */
  function put(s,x,y,flip,sx,sy,mode){
    var w=Math.round(s.w*(sx||1)),h=Math.round(s.h*(sy||1)),dx=Math.round(x-w/2),dy=Math.round(y-h);
    var im=mode==='flash'?s.f:mode==='frozen'?s.fr:s.c;
    if(flip){g.save();g.translate(dx+w,dy);g.scale(-1,1);g.drawImage(im,0,0,w,h);g.restore()}
    else g.drawImage(im,dx,dy,w,h);
  }
  function disc(x,y,r,c){g.fillStyle=c;for(var d=-r;d<=r;d++){var w=Math.floor(Math.sqrt(r*r-d*d));g.fillRect(x-w,y+d,w*2+1,1)}}
  function num(s,x,y,c,z){
    var i,j,w=4*z;x=Math.round(x-(s.length*w-z)/2);y=Math.round(y);
    for(var pass=0;pass<2;pass++){
      g.fillStyle=pass?c:'#000';
      for(i=0;i<s.length;i++){
        var d=DIG[+s[i]];if(!d)continue;
        for(j=0;j<15;j++)if(d[j]==='1')g.fillRect(x+i*w+(j%3)*z+(pass?0:z),y+((j/3)|0)*z+(pass?0:z),z,z);
      }
    }
  }
  function hills(off,sp,base,amp,col){
    g.fillStyle=col;
    for(var x=0;x<W+4;x+=4){
      var X=x+off*sp;
      var h=base+amp*Math.sin(X*.032)+amp*.55*Math.sin(X*.085+1.7);
      h=Math.round(h/3)*3;
      g.fillRect(x,GY-h,4,h+2);
    }
  }
  function cloud(x,y,w,c1,c2){
    x=Math.round(x);y=Math.round(y);
    g.fillStyle=c1;g.fillRect(x,y+3,w,4);g.fillRect(x+3,y,Math.round(w*.35),4);g.fillRect(x+Math.round(w*.42),y-2,Math.round(w*.3),6);
    g.fillStyle=c2;g.fillRect(x,y+6,w,1);
  }
  function drawLightning(x1,y1,x2,y2,col){
    var segs=6,px=x1,py=y1;
    for(var k=1;k<=segs;k++){
      var f=k/segs;
      var nx=k===segs?x2:x1+(x2-x1)*f+rnd(-5,5);
      var ny=k===segs?y2:y1+(y2-y1)*f+rnd(-5,5);
      var steps=Math.max(4,Math.ceil(Math.hypot(nx-px,ny-py)));
      for(var s=0;s<=steps;s++){
        var lx=Math.round(px+(nx-px)*(s/steps)),ly=Math.round(py+(ny-py)*(s/steps));
        g.fillStyle=col||'#72f3ff';g.fillRect(lx,ly,2,2);
        g.fillStyle='#ffffff';g.fillRect(lx,ly,1,1);
      }
      px=nx;py=ny;
    }
  }

  function drawTower(){
    var lv=tower.level,prog=tower.prog;
    if(lv<=0&&prog<=0&&tower.blueprintT<=0)return;
    var x=towerX,by=GY+2;
    /* Blueprint scroll hologram */
    if(tower.blueprintT>0||tower.target>tower.level){
      g.fillStyle='rgba(92,225,230,.18)';
      var bh=14+tower.target*9;
      g.fillRect(x-9,by-bh,18,bh);
      g.fillStyle='#5ce1e6';
      g.fillRect(x-9,by-bh,18,1);g.fillRect(x-9,by-1,18,1);
      if(tower.blueprintT>0){g.fillStyle='#ffe066';g.fillRect(x-3,by-3,6,3);g.fillStyle='#8a5a2b';g.fillRect(x-4,by-3,1,3);g.fillRect(x+3,by-3,1,3)}
    }
    var fullH=lv>0?(14+lv*9):0;
    var curH=fullH+(tower.target>lv?Math.round(prog*9):0);
    if(curH<=0)return;
    var tw=lv>=3?18:lv>=2?16:14;
    var x0=Math.round(x-tw/2),y0=by-curH;
    /* Stone masonry */
    for(var yy=y0;yy<by;yy++){
      for(var xx=x0;xx<x0+tw;xx++){
        var edge=xx===x0||xx===x0+tw-1;
        var br=((yy-y0)%4===0)||((xx-x0+(((yy-y0)>>2)&1)*3)%6===0);
        g.fillStyle=edge?'#262b38':br?'#42495c':(lv>=2?'#6b748b':'#5e6578');
        g.fillRect(xx,yy,1,1);
      }
    }
    /* Arrow slits & wood door */
    g.fillStyle='#141720';g.fillRect(x-1,y0+5,2,4);
    if(lv>=2){g.fillRect(x-5,y0+10,2,3);g.fillRect(x+3,y0+10,2,3)}
    g.fillStyle='#5c3a1d';g.fillRect(x-2,by-6,4,6);g.fillStyle='#2e1b0c';g.fillRect(x-3,by-6,1,6);g.fillRect(x+2,by-6,1,6);
    /* Battlements */
    if(lv>=1){
      var capCol=lv>=3?'#fcd34d':lv>=2?'#8c96b0':'#6e7588';
      var capDark=lv>=3?'#b58014':'#3a4052';
      g.fillStyle=capDark;g.fillRect(x0-2,y0-2,tw+4,3);
      g.fillStyle=capCol;
      for(var m=x0-2;m<x0+tw+2;m+=4)g.fillRect(m,y0-4,2,3);
    }
    /* Lv 2+ torches */
    if(lv>=2){
      var fl=((tt*9)|0)%2;
      g.fillStyle='#6b4423';g.fillRect(x0-2,y0+4,1,3);g.fillRect(x0+tw+1,y0+4,1,3);
      g.fillStyle=fl?'#ffe066':'#ff8c1a';g.fillRect(x0-2,y0+2,1,2);g.fillRect(x0+tw+1,y0+2,1,2);
    }
    /* Lv 3 fluttering emerald banner */
    if(lv>=3){
      g.fillStyle='#e2e8f0';g.fillRect(x,y0-13,1,10);
      var wave=Math.round(Math.sin(tt*8));
      g.fillStyle='#2e7d22';g.fillRect(x+1,y0-13,7,5);
      g.fillStyle='#6be052';g.fillRect(x+1,y0-12,5,3);
      g.fillStyle='#fcd34d';g.fillRect(x+3,y0-11,2,1);
      g.fillStyle='#2e7d22';g.fillRect(x+7,y0-13+wave,2,4);
    }
  }

  function drawDragon(){
    if(!dragon)return;
    var d=dragon,f=d.face,x=Math.round(d.x),y=Math.round(d.y),fl=d.fl>0;
    var flap=Math.sin(d.t*8.5);
    var bodyC=fl?'#ffffff':'#b51d2a',darkC=fl?'#ffe8e8':'#5c0b14',bellyC=fl?'#ffffff':'#f4b942',wingC=fl?'#ffffff':'#841522',memC=fl?'#ffd4d4':'#e04832';
    /* Tail (5 undulating segments) */
    for(var s=5;s>=1;s--){
      var tx2=x-f*(6+s*4),ty2=y+1+Math.round(Math.sin(d.t*6-s*.7)*2.5);
      g.fillStyle=darkC;g.fillRect(tx2-2,ty2-2,5,4);
      g.fillStyle=bodyC;g.fillRect(tx2-1,ty2-1,3,2);
      if(s%2===1){g.fillStyle=bellyC;g.fillRect(tx2,ty2-3,1,1)}
    }
    /* Back Wing */
    var wy=Math.round(flap*10);
    g.fillStyle=darkC;g.fillRect(x-f*2-6,y-5+wy-3,13,3);
    g.fillStyle=wingC;g.fillRect(x-f*2-5,y-4+wy-1,11,5);
    /* Torso */
    g.fillStyle=darkC;g.fillRect(x-8,y-4,16,9);
    g.fillStyle=bodyC;g.fillRect(x-7,y-3,14,6);
    g.fillStyle=bellyC;g.fillRect(x-5,y+2,10,2);
    /* Front Articulated Wing */
    g.fillStyle=darkC;g.fillRect(x-f*4-5,y-3-wy,14,3);
    g.fillStyle=memC;g.fillRect(x-f*4-4,y-1-wy,12,5);
    g.fillStyle=bellyC;g.fillRect(x-f*2,y-4-wy,2,2);
    /* Neck & Horned Head */
    var hx2=x+f*11,hy2=y-3+Math.round(Math.sin(d.t*5)*1.2);
    g.fillStyle=darkC;g.fillRect(x+f*6-2,y-3,6,5);
    g.fillStyle=bodyC;g.fillRect(hx2-5,hy2-4,10,7);
    g.fillStyle=darkC;g.fillRect(hx2-5,hy2-5,10,1);
    /* Horns */
    g.fillStyle=fl?'#fff':'#e5dec9';
    g.fillRect(hx2-f*3,hy2-7,2,3);g.fillRect(hx2-f*1,hy2-6,2,2);
    /* Eye */
    g.fillStyle=d.telegraph>0?'#ffffff':'#ffe066';
    g.fillRect(hx2+f*2,hy2-2,2,2);
    /* Jaw (snaps open on telegraph!) */
    var jaw=d.telegraph>0?3:1;
    g.fillStyle=darkC;g.fillRect(hx2+f*1-3,hy2+2+jaw,8,2);
    if(d.telegraph>0){g.fillStyle='#ff8c1a';g.fillRect(hx2+f*4,hy2+1,3,3)}
  }

  function drawHero(){
    var h=hero,fl=h.face<0;
    var fr=h.hy>1?2:(h.mv?(((h.t*9)|0)%2):0);
    var bob=(h.mv&&fr===1)?1:0,by=GY+4-h.hy-bob;
    g.fillStyle='rgba(0,0,0,.28)';g.fillRect(Math.round(h.x-4),GY+4,8,1);
    /* Overdrive gold aura */
    if(h.overdrive>0){
      g.fillStyle='rgba(252,211,77,.25)';disc(Math.round(h.x),Math.round(by-7),9,'rgba(252,211,77,.22)');
    }
    put(SP.hero[fr],h.x,by,fl);
    /* Held modded weapon */
    var hxp=Math.round(h.x+h.face*4),hyp=Math.round(by-6);
    var swp=h.sw>0?(h.sw/.28):0;
    if(weapon==='fireblade'){
      var a=h.sw>0?(-1.8+3.5*(1-Math.pow(1-swp,2))):.45+Math.sin(h.t*3)*.06;
      var cols=['#5a3818','#8a5a2b','#fcd34d','#ff3b30','#ff6b1a','#ff8c1a','#ffae33','#ffe066','#fff6c2','#ffffff'];
      for(var i=0;i<10;i++){
        var px=Math.round(hxp+Math.sin(a)*h.face*i),py=Math.round(hyp-Math.cos(a)*i);
        g.fillStyle=cols[i];g.fillRect(px,py,1,1);
        if(i===2){g.fillStyle='#fcd34d';g.fillRect(px+Math.round(Math.cos(a)*h.face),py+Math.round(Math.sin(a)),1,1);g.fillRect(px-Math.round(Math.cos(a)*h.face),py-Math.round(Math.sin(a)),1,1)}
      }
      if(h.sw>0){
        for(var j=3;j<10;j++){
          g.fillStyle='rgba(255,140,26,.75)';
          g.fillRect(Math.round(hxp+Math.sin(a-.28)*h.face*j),Math.round(hyp-Math.cos(a-.28)*j),2,1);
        }
      }
    }else if(weapon==='stormstaff'){
      var sa=h.sw>0?1.15:.35+Math.sin(h.t*3)*.05;
      for(var k=0;k<9;k++){
        g.fillStyle=k<7?'#6b4423':'#72f3ff';
        g.fillRect(Math.round(hxp+Math.sin(sa)*h.face*k),Math.round(hyp-Math.cos(sa)*k),1,1);
      }
      var ox=Math.round(hxp+Math.sin(sa)*h.face*9),oy=Math.round(hyp-Math.cos(sa)*9);
      g.fillStyle='#23b5d3';g.fillRect(ox-1,oy-1,3,3);
      g.fillStyle=((tt*12)|0)%2?'#ffffff':'#ffe066';g.fillRect(ox,oy,1,1);
    }else if(weapon==='frostbow'){
      var bx=hxp+h.face*2,by2=hyp-1;
      g.fillStyle='#7ceeff';
      g.fillRect(bx,by2-4,1,2);g.fillRect(bx+h.face,by2-2,1,5);g.fillRect(bx,by2+3,1,2);
      g.fillStyle='#dbe8f5';g.fillRect(bx-h.face,by2-3,1,7);
      if(h.sw>0){g.fillStyle='#ffffff';g.fillRect(bx,by2,h.face*4,1)}
    }
  }

  function draw(){
    if(!W||!cv.width)return;
    var md=MOODS[moodIdx],i;
    var shx=shakeT>0?Math.round((R()*2-1)*shakeMag):0;
    var shy=shakeT>0?Math.round((R()*2-1)*shakeMag):0;

    g=mg;g.imageSmoothingEnabled=false;
    g.save();g.translate(shx,shy);

    /* Sky gradient */
    for(var y=0;y<GY+2;y+=3){
      var col=mixa(md.top,md.bot,clamp(y/GY,0,1));
      if(flashSky>0)col=mixa(col,[220,235,255],flashSky*.6);
      g.fillStyle=rgb(col);g.fillRect(-4,y,W+8,3);
    }

    /* Stars */
    if(md.stars>0){
      for(i=0;i<stars.length;i++){
        var st=stars[i],tw=Math.sin(tt*2.4+st[2])>.6?.45:1;
        g.globalAlpha=md.stars*tw;g.fillStyle='#fff';g.fillRect(st[0],st[1],1,1);
        if(st[3]){g.fillRect(st[0]-1,st[1],3,1);g.fillRect(st[0],st[1]-1,1,3)}
      }
      g.globalAlpha=1;
    }

    /* Sun / Sunset / Moon */
    if(md.sun===1){
      var sx=Math.round(W*.18),sy=22;
      disc(sx,sy,8,'#ffae20');disc(sx,sy,6,'#ffe066');
      g.fillStyle='#ffe066';[[-11,0],[11,0],[0,-11],[0,11]].forEach(function(r){g.fillRect(sx+r[0]-1,sy+r[1]-1,2,2)});
    }else if(md.sun===2){
      var sx2=Math.round(W*.22),sy2=GY-18;
      disc(sx2,sy2,12,'rgba(255,110,60,.35)');disc(sx2,sy2,8,'#ff6b35');disc(sx2,sy2,5,'#ffd166');
    }else if(md.sun===3){
      var mx=Math.round(W*.2),my=24;
      disc(mx,my,11,'rgba(124,238,255,.16)');disc(mx,my,8,'#e2e8ff');
      g.fillStyle='#b8c4ea';g.fillRect(mx-4,my-3,3,2);g.fillRect(mx+1,my+1,3,3);g.fillRect(mx-2,my+3,2,2);
    }

    /* Distant thunderstorm bolt */
    if(stormBolt){drawLightning(stormBolt.x,0,stormBolt.x+10,GY-12,'#e0f2fe')}

    /* Clouds */
    var c1=md.id==='storm'?'#475569':md.id==='moon'?'#3b4876':md.id==='sunset'?'#f59e7a':'#ffffff';
    var c2=md.id==='storm'?'#334155':md.id==='moon'?'#283258':md.id==='sunset'?'#b85d6c':'#d2e4f5';
    for(i=0;i<clouds.length;i++){
      var cl=clouds[i],cx=((cl.x+tt*cl.v)%(W+80))-40;
      cloud(cx,cl.y,cl.w,c1,c2);
    }

    /* World layer */
    g=wg;wg.clearRect(0,0,W,H);wg.imageSmoothingEnabled=false;
    hills(tt,1.1,20,8,md.id==='sunset'?'#5c4368':md.id==='storm'?'#2d3c4a':'#5e9e8b');
    hills(tt,2.8,9,5,md.id==='sunset'?'#3c4e38':md.id==='storm'?'#254434':'#448f3d');
    g.drawImage(sc,0,0);

    /* Anvil */
    put(SP.anvil,anvilX,GY+2,false);

    /* Colony Watchtower */
    drawTower();

    /* Sloth on the branch */
    var fr=craft?((tt*9)|0)%4:((tt*2.2)|0)%4;
    var slx=Math.round(tx-39),sly=GY-37+(craft?0:(Math.sin(tt*1.6)>.6?1:0));
    if(slothImg.complete&&slothImg.naturalWidth)g.drawImage(slothImg,fr*32,0,32,24,slx,sly,32,24);

    /* Craft hologram over anvil */
    if(craft){
      var it=craft.it,pr=craft.t/1.4,cnt=Math.min(it.s.px.length,Math.floor(pr*it.s.px.length));
      var ph=Math.round(craft.x-7),pv=Math.round(GY-24+Math.sin(tt*6)*1.5);
      g.fillStyle='rgba(255,224,102,.18)';g.fillRect(ph-1,pv-1,16,16);
      for(i=0;i<cnt;i++){var px=it.s.px[craft.order[i]];g.fillStyle=px[2];g.fillRect(ph+px[0]*2,pv+px[1]*2,2,2)}
    }

    /* Colony Builder */
    if(builder.active){
      var bfr=((tt*9)|0)%2;
      put(SP.builder[bfr],builder.x,GY+3,builder.face<0);
      if(builder.state==='build'){
        var swing=((tt*12)|0)%2;
        g.fillStyle='#d1d5db';g.fillRect(Math.round(builder.x+4),GY-7-(swing?3:0),4,2);
        g.fillStyle='#8a5a2b';g.fillRect(Math.round(builder.x+3),GY-5-(swing?2:0),2,3);
      }
    }

    /* Loot items */
    loot.forEach(function(l){
      var s=itemOf(l.k).s,by=Math.round(l.y+(l.rest?Math.sin(tt*4.5+l.x)*1.2:0));
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(Math.round(l.x-3),GY+5,6,1);
      if(l.age>12&&((tt*8)|0)%2)return;
      put(s,l.x,by,0);
    });

    /* Entities sorted by lane */
    var ents=[];
    mobs.forEach(function(m){ents.push([m.lane,0,m])});
    if(ally)ents.push([1.8,2,ally]);
    ents.push([2,1,hero]);
    ents.sort(function(a,b){return a[0]-b[0]});
    ents.forEach(function(e){
      if(e[1]===1){drawHero()}
      else if(e[1]===2){
        var al=e[2],afr=al.mv?(((al.t*8)|0)%2):0;
        g.fillStyle='rgba(0,0,0,.25)';g.fillRect(Math.round(al.x-4),GY+4,8,1);
        put(SP.ally[afr],al.x,GY+4-al.hy,al.face<0);
      }else{
        var m=e[2],fy=GY+3+m.lane,sqx=m.scale,sqy=m.scale,off=0;
        g.fillStyle='rgba(0,0,0,.25)';g.fillRect(Math.round(m.x-m.w/2+1),fy,m.w-2,1);
        if(m.type==='slime'&&m.frozenT<=0){
          if(m.hy>0){sqx*=0.92;sqy*=1.12}else if(m.ht>.35){sqx*=1.12;sqy*=0.88}
        }else if(!m.d.fly&&Math.abs(m.kb)<5&&m.hy<1&&m.frozenT<=0){
          off=Math.abs(Math.sin(m.t*7))>.5?1:0;
        }
        var mode=m.fl>0?'flash':m.frozenT>0?'frozen':null;
        put(m.d.s,m.x,fy-m.hy-off,m.dir<0,sqx,sqy,mode);
        /* Crown on Giant Slimes */
        if(m.giant){
          var cy=Math.round(fy-m.hy-m.h-3);
          g.fillStyle='#fcd34d';g.fillRect(Math.round(m.x-4),cy,9,3);
          g.fillRect(Math.round(m.x-4),cy-2,2,2);g.fillRect(Math.round(m.x-1),cy-2,3,2);g.fillRect(Math.round(m.x+3),cy-2,2,2);
          g.fillStyle='#ff4a5e';g.fillRect(Math.round(m.x),cy+1,1,1);
        }
        /* Translucent Pixel Ice Block around frozen mobs */
        if(m.frozenT>0){
          var ix=Math.round(m.x-m.w/2-2),iy=Math.round(fy-m.hy-m.h-2),iw=m.w+4,ih=m.h+3;
          g.fillStyle='rgba(124,238,255,.36)';g.fillRect(ix,iy,iw,ih);
          g.fillStyle='rgba(255,255,255,.75)';g.fillRect(ix,iy,iw,1);g.fillRect(ix,iy,1,ih);g.fillRect(ix+2,iy+2,2,1);
          g.fillStyle='rgba(28,136,184,.75)';g.fillRect(ix,iy+ih-1,iw,1);g.fillRect(ix+iw-1,iy,1,ih);
        }
        /* Mob HP bar */
        if(m.hp<m.maxHp&&m.hp>0){
          var bw=Math.max(10,m.w),bx=Math.round(m.x-bw/2),by2=Math.round(fy-m.hy-m.h-5);
          g.fillStyle='#000';g.fillRect(bx-1,by2-1,bw+2,4);
          g.fillStyle='#991b1b';g.fillRect(bx,by2,bw,2);
          g.fillStyle='#7be04e';g.fillRect(bx,by2,Math.max(1,Math.round(bw*m.hp/m.maxHp)),2);
        }
      }
    });

    /* Boss Dragon */
    drawDragon();

    /* Projectiles */
    projs.forEach(function(p){
      var px=Math.round(p.x),py=Math.round(p.y);
      if(p.kind==='ice'){
        g.fillStyle='#7ceeff';g.fillRect(px-3,py-1,6,2);
        g.fillStyle='#ffffff';g.fillRect(px-1,py-1,3,1);
      }else if(p.kind==='tower'){
        g.fillStyle='#d6b57c';g.fillRect(px-2,py,5,1);
        g.fillStyle='#ffffff';g.fillRect(px+(p.vx<0?-2:2),py,1,1);
      }else if(p.kind==='fireball'||p.kind==='meteor'){
        var r=p.kind==='meteor'?4:3;
        disc(px,py,r,'#ff3b30');disc(px,py,r-1,'#ffae33');g.fillStyle='#fff';g.fillRect(px,py,1,1);
      }
    });

    /* Particles */
    parts.forEach(function(p){
      g.globalAlpha=clamp(1.5-p.t/p.l*1.5+.1,0,1);
      g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);
    });
    g.globalAlpha=1;

    /* Atmosphere tint on world layer */
    if(md.tint>0){
      g.globalCompositeOperation='source-atop';
      g.fillStyle=md.id==='sunset'?'rgba(90,24,48,'+md.tint+')':'rgba(10,16,56,'+md.tint+')';
      g.fillRect(0,0,W,H);
      g.globalCompositeOperation='source-over';
    }

    g=mg;g.drawImage(wc,0,0);

    /* Bright VFX above tint (Chain Lightning, Fire Glow, Storm Rain) */
    bolts.forEach(function(b){
      g.globalAlpha=clamp(1-b.t/b.l,0,1);
      drawLightning(b.x1,b.y1,b.x2,b.y2,'#72f3ff');
      if(b.ring){
        var rr=Math.round(4+b.t*38);
        g.strokeStyle='#ffe066';g.lineWidth=1;g.strokeRect(Math.round(b.x2-rr),Math.round(b.y2-rr),rr*2,rr*2);
      }
    });
    g.globalAlpha=1;

    if(md.rain){
      g.fillStyle='rgba(165,216,255,.55)';
      for(i=0;i<rain.length;i++){
        var rn=rain[i];g.fillRect(Math.round(rn.x),Math.round(rn.y),1,Math.round(rn.l));
      }
    }

    mobs.forEach(function(m){
      if(m.type==='fire'||m.burnT>0){
        var fy=Math.round(GY+3+m.lane-m.hy-4);
        disc(Math.round(m.x),fy,11,'rgba(255,130,30,.12)');
      }
    });

    /* Damage numbers & floating DOM captions */
    texts.forEach(function(q){
      var k=q.t/q.l,yy=q.y-(q.n?k*12:k*10);
      g.globalAlpha=k>.72?clamp((1-k)*3.6,0,1):1;
      if(q.n)num(q.n,q.x,yy,q.c,q.z);
      else if(q.el){
        var cpx=clamp(q.x*S,q.wd/2+6,W*S-q.wd/2-6);
        q.el.style.transform='translate('+cpx.toFixed(1)+'px,'+(yy*S).toFixed(1)+'px) translate(-50%,-100%)';
        q.el.style.opacity=String(g.globalAlpha);
      }
    });
    g.globalAlpha=1;
    g.restore();
  }

  /* ---------- Pointer & Safe Keyboard Controls ---------- */
  function pos(e){var r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
  cv.addEventListener('pointerdown',function(e){
    setFocus(true);manualIdleT=0;
    var p=pos(e),px=p[0],py=p[1];
    /* 1. Boss Dragon click */
    if(dragon&&Math.abs(px-dragon.x)<22&&Math.abs(py-dragon.y)<14){
      fireWeapon(dragon.x,dragon.y,null,true);if(paused)draw();return;
    }
    /* 2. Mob click */
    for(var i=mobs.length-1;i>=0;i--){
      var m=mobs[i],fy=GY+3+m.lane;
      if(Math.abs(px-m.x)<=m.w/2+6&&py>=fy-m.h-m.hy-6&&py<=fy+5){
        fireWeapon(m.x,fy-m.h/2-m.hy,m,false);if(paused)draw();return;
      }
    }
    /* 3. Sloth / Anvil click -> Mod Forge Burst! */
    if((px>tx-44&&px<tx-2&&py>GY-42&&py<GY-8)||(Math.abs(px-anvilX)<14&&py>GY-14&&py<GY+6)){
      forgeBurst();if(paused)draw();return;
    }
    /* 4. Open ground / sky click -> leap/move hero there & spawn challenger if quiet */
    hero.face=px<hero.x?-1:1;
    hero.x=clamp(hero.x+(px-hero.x)*.35,10,W-10);
    if(py<GY-14||(Math.abs(px-hero.x)<18)){
      if(hero.hy<=0||hero.jumps>0){
        var isDouble=hero.hy>2;
        hero.vy=isDouble?104:114;hero.jumps=Math.max(0,hero.jumps-1);
        sfx(isDouble?'djump':'jump');
        if(isDouble)burst(hero.x,GY-hero.hy,['#7be04e','#ffe066','#fff'],10,45,30);
      }
    }
    if(mobs.length<3&&py>=GY-20){spawn(null,clamp(px,12,W-16),true,false)}
    else{fireWeapon(px,py,null,false)}
    if(paused)draw();
  });

  /* Click outside stage + hotbar releases keyboard focus cleanly */
  doc.addEventListener('pointerdown',function(e){
    if(!stageFocused)return;
    var t=e.target;
    if(frameEl&&frameEl.contains(t))return;
    setFocus(false);
  });

  if(focusBtn){
    focusBtn.addEventListener('click',function(){
      setFocus(!stageFocused);
      if(stageFocused)showBanner('KEYBOARD ACTIVE · WASD + SPACE + 1-8 · ESC TO RELEASE','emerald');
    });
  }
  if(pauseBtn){
    pauseBtn.addEventListener('click',function(){
      paused=!paused;
      pauseBtn.textContent=paused?'Resume':'Pause';
      pauseBtn.setAttribute('aria-pressed',paused?'true':'false');
      sync();
    });
  }
  slotBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      triggerMod(+btn.getAttribute('data-mod'));
    });
  });

  doc.addEventListener('keydown',function(e){
    if(!stageFocused)return;
    var k=e.key;
    if(k==='Escape'){setFocus(false);return}
    if(k>='1'&&k<='8'){e.preventDefault();manualIdleT=0;triggerMod(+k);return}
    var low=k.toLowerCase();
    if(low==='a'||k==='ArrowLeft'){keys.left=true;manualIdleT=0;if(k==='ArrowLeft')e.preventDefault()}
    else if(low==='d'||k==='ArrowRight'){keys.right=true;manualIdleT=0;if(k==='ArrowRight')e.preventDefault()}
    else if(low==='w'||k==='ArrowUp'||k===' '){
      e.preventDefault();manualIdleT=0;
      if(!e.repeat&&(hero.coyote>0||hero.jumps>0)){
        var dbl=hero.coyote<=0&&hero.hy>2;
        hero.vy=dbl?106:116;hero.coyote=0;hero.jumps=Math.max(0,hero.jumps-1);
        sfx(dbl?'djump':'jump');
        if(dbl)burst(hero.x,GY-hero.hy,['#7be04e','#ffe066','#fff'],10,48,30);
      }
    }else if(low==='f'||low==='j'||k==='Enter'){
      e.preventDefault();manualIdleT=0;keys.attack=true;
      if(hero.cd<=0)fireWeapon(null,null);
    }
  });
  doc.addEventListener('keyup',function(e){
    var k=e.key,low=k.toLowerCase();
    if(low==='a'||k==='ArrowLeft')keys.left=false;
    else if(low==='d'||k==='ArrowRight')keys.right=false;
    else if(low==='f'||low==='j'||k==='Enter')keys.attack=false;
  });

  /* ---------- Boot Sandbox ---------- */
  drawSlotIcons();
  hero=newHero();
  layout();
  spawn('slime',W*.55,true,false);
  spawn('skeleton',W*.16,true,false);
  for(var k=0;k<45;k++)sim(.033);
  if(reduce){
    paused=false; /* keep calm gentle animation or interactive */
  }
  updateHud();syncHotbarUI();draw();
  reg({el:cv,step:function(dt){sim(reduce?dt*.35:dt);draw()}});
  sync();
  if('ResizeObserver' in win)new ResizeObserver(function(){layout()}).observe(box);
  else win.addEventListener('resize',layout);

  /* Backward-compatible public hook for fun.js & verification */
  win.slothScene={
    time:function(c){moodIdx=c>.7?3:c>.52?2:c>.42?1:0;syncHotbarUI();draw()},
    summon:function(t,x){if(t==='dragon'){triggerMod(5);return dragon}var m=spawn(t,x==null?W*.52:x,true,false);draw();return m},
    craft:function(k){if(paused)return false;forgeBurst();if(k)startCraft(k);draw();return true},
    advance:function(s){for(var i=0;i<s*30;i++)sim(1/30);draw()},
    mod:function(n){triggerMod(n)},
    focus:function(on){setFocus(on)},
    isFocused:function(){return stageFocused},
    getState:function(){return{weapon:weapon,towerLevel:tower.level,towerTarget:tower.target,dragonHp:dragon?dragon.hp:0,ally:!!ally,mood:MOODS[moodIdx].id,chaos:chaos?chaos.id:null,score:score,best:bestScore,focused:stageFocused}}
  };
})();

/* ---------- 3x3 Animated Crafting Demo (#craft) ---------- */
var cc=doc.getElementById('craft'),ct=4.8,ci=0;
if(cc&&cc.getContext){
  var cx=cc.getContext('2d');cx.imageSmoothingEnabled=false;
  var IMG={};
  ['gem','stick','ingot','star','sword','blade','lamp'].forEach(function(k){var im=new Image();im.onload=function(){if(drawCraft)drawCraft()};im.src='img/engine-'+k+'.png';IMG[k]=im});
  var REC=[
    {n:'Ruby Sword',c:{1:'gem',4:'gem',7:'stick'},o:'sword'},
    {n:'Golden Blade',c:{1:'ingot',4:'ingot',7:'stick'},o:'blade'},
    {n:'Glow Lamp',c:{1:'gem',3:'gem',4:'star',5:'gem',7:'gem'},o:'lamp'}
  ];
  var ok=function(im){return im&&im.complete&&im.naturalWidth>0};
  var slotBox=function(x,y,w,h){
    cx.fillStyle='#0a0c10';cx.fillRect(x,y,w,h);
    cx.fillStyle='#3b4254';cx.fillRect(x+2,y+2,w-2,h-2);
    cx.fillStyle='#1a1e28';cx.fillRect(x+2,y+2,w-4,h-4);
  };
  var drawCraft=function(){
    cx.clearRect(0,0,336,132);
    cx.fillStyle='#1f232e';cx.fillRect(0,0,336,132);
    cx.fillStyle='#3b4254';cx.fillRect(0,0,336,3);cx.fillRect(0,0,3,132);
    cx.fillStyle='#0d0f14';cx.fillRect(0,129,336,3);cx.fillRect(333,0,3,132);
    var r=REC[ci%REC.length],t=ct,i,n=0;
    for(i=0;i<9;i++){
      var sx=18+(i%3)*36,sy=12+((i/3)|0)*36;slotBox(sx,sy,36,36);
      var k=r.c[i];
      if(k){if(t>=n*.38&&ok(IMG[k]))cx.drawImage(IMG[k],sx+2,sy+2,32,32);n++}
    }
    var ap=clamp((t-1.6)/.85,0,1),al=Math.round(ap*42);
    cx.fillStyle='#343a49';cx.fillRect(140,63,42,6);cx.fillRect(170,54,6,24);cx.fillRect(176,57,6,18);
    cx.fillStyle='#7be04e';cx.fillRect(140,63,al,6);
    if(ap>=1){cx.fillRect(170,54,6,24);cx.fillRect(176,57,6,18)}
    slotBox(214,38,56,56);
    if(t>=2.45&&ok(IMG[r.o])){
      var g0=clamp((t-2.45)/.3,0,1),sz=Math.max(16,Math.round(48*g0/16)*16);
      cx.drawImage(IMG[r.o],242-sz/2,66-sz/2,sz,sz);
      if(t>3.0&&t<5.6){
        cx.fillStyle='#fcd34d';
        [[220,44],[262,46],[258,86],[219,84]].forEach(function(s,j){if(((t*12)|0)%2===j%2)cx.fillRect(s[0],s[1],4,4)});
      }
    }
  };
  reg({el:cc,step:function(dt){if(!reduce){ct+=dt;if(ct>6.2){ct=0;ci++}}drawCraft()}});
  drawCraft();
  win.addEventListener('load',drawCraft);
}

/* ---------- Mini Bouncing Slime ---------- */
var mini=doc.querySelector('canvas.mini'),mt=.3;
if(mini&&mini.getContext){
  var mx=mini.getContext('2d');mx.imageSmoothingEnabled=false;
  var drawMini=function(){
    mx.clearRect(0,0,16,16);
    var k=(mt%1.5)/1.5,jh=Math.max(0,Math.sin(Math.min(1,k/.7)*Math.PI))*5;
    var sq=k>.7?.85:(jh>0?1.1:1),sw=k>.7?1.12:(jh>0?.92:1);
    var w=Math.round(12*sw),h=Math.round(10*sq);
    mx.fillStyle='rgba(0,0,0,.3)';mx.fillRect(4,14,8,1);
    mx.drawImage(SP.slime.c,Math.round(8-w/2),Math.round(14-jh-h),w,h);
  };
  reg({el:mini,step:function(dt){if(!reduce)mt+=dt;drawMini()}});drawMini();
}
sync();
})();
