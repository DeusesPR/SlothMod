/* SlothMod site interactions: sound toggle, studio switcher, fullscreen lightbox,
   trailer controls, hotbar scroll-spy, XP bar, advancement toasts & easter eggs.
   100% static & self-hosted — zero external requests. */
(function(){
'use strict';
var doc=document,win=window;
var reduce=win.matchMedia&&win.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s){return doc.querySelector(s)}
function $$(s){return[].slice.call(doc.querySelectorAll(s))}
function get(st,k){try{return win[st].getItem(k)}catch(e){return null}}
function set(st,k,v){try{win[st].setItem(k,v)}catch(e){}}

/* ---------- 1. WebAudio Sound Toggle (off by default) ---------- */
var snd=get('localStorage','sloth.snd')==='1'||get('localStorage','sloth.sound')==='1';
var ctx=null,master=null;
function audio(){
  if(ctx){if(ctx.state==='suspended')try{ctx.resume()}catch(e){}return ctx}
  var AC=win.AudioContext||win.webkitAudioContext;if(!AC)return null;
  try{ctx=new AC();master=ctx.createGain();master.gain.value=.12;master.connect(ctx.destination)}catch(e){ctx=null}
  return ctx;
}
function tone(f,t,d,type,v,to){
  var c=ctx;if(!c)return;
  var o=c.createOscillator(),g=c.createGain(),t0=c.currentTime+t;
  o.type=type||'sine';o.frequency.setValueAtTime(f,t0);
  if(to)o.frequency.exponentialRampToValueAtTime(to,t0+d);
  g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(v,t0+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  o.connect(g);g.connect(master);o.start(t0);o.stop(t0+d+.02);
}
function play(kind){
  if(!snd)return;if(!audio())return;
  if(kind==='click'){tone(540,0,.06,'triangle',.65,360)}
  else if(kind==='ding'){tone(880,0,.13,'sine',.75);tone(1319,.09,.2,'sine',.65)}
  else if(kind==='chime'){[523,659,784,1047].forEach(function(f,i){tone(f,i*.08,.26,'sine',.65)})}
}
win.slothAudio={
  enabled:function(){return snd},
  getContext:function(){return snd?audio():null},
  getMaster:function(){return master},
  play:play
};
var sb=$('#snd'),sn=$('#snd-n');
function paintSnd(){
  if(!sb)return;
  sb.setAttribute('aria-pressed',snd?'true':'false');
  if(sn)sn.textContent=snd?'on':'off';
}
if(sb)sb.addEventListener('click',function(){
  snd=!snd;
  set('localStorage','sloth.snd',snd?'1':'0');
  set('localStorage','sloth.sound',snd?'1':'0');
  paintSnd();
  if(snd){audio();play('click')}
});
paintSnd();
function wake(){if(snd)audio();doc.removeEventListener('pointerdown',wake);doc.removeEventListener('keydown',wake)}
doc.addEventListener('pointerdown',wake);doc.addEventListener('keydown',wake);
doc.addEventListener('click',function(e){
  var t=e.target&&e.target.closest&&e.target.closest('.btn,.slot-nav,.studio-tab,.tab,summary,.chapter-pill');
  if(t&&t!==sb&&!t.hasAttribute('data-sound'))play('click');
});

/* ---------- 2. Showcase Audio Samples (.ogg) ---------- */
var clip=null,clipBtn=null;
function canOgg(){try{return!!new Audio().canPlayType('audio/ogg; codecs="vorbis"')}catch(e){return false}}
$$('a[data-sound]').forEach(function(a){
  a.setAttribute('role','button');
  a.addEventListener('click',function(e){
    if(!canOgg())return;e.preventDefault();
    if(clip){clip.pause();if(clipBtn)clipBtn.classList.remove('on')}
    clip=new Audio(a.getAttribute('href'));clipBtn=a;a.classList.add('on');
    clip.onended=clip.onerror=function(){a.classList.remove('on')};
    var p=clip.play();if(p&&p.catch)p.catch(function(){a.classList.remove('on')});
  });
});

/* ---------- 3. Interactive 6-Tab Studio Switcher ---------- */
var studioTabs=$$('#studios [role="tab"][data-studio]');
var studioImg=$('#studio-stage-img');
var studioBadge=$('#studio-stage-badge');
var studioTitle=$('#studio-stage-title');
var studioList=$('#studio-stage-bullets');
var studioCap=$('#studio-stage-caption');
if(studioTabs.length&&studioImg){
  function activateStudio(tab,focusTab){
    studioTabs.forEach(function(t){
      var on=t===tab;
      t.setAttribute('aria-selected',on?'true':'false');
      t.setAttribute('tabindex',on?'0':'-1');
    });
    var src=tab.getAttribute('data-src');
    var shot=tab.getAttribute('data-shot')||'';
    var alt=tab.getAttribute('data-alt')||'';
    var badge=tab.getAttribute('data-badge')||'';
    var title=tab.getAttribute('data-title')||'';
    var bullets=(tab.getAttribute('data-bullets')||'').split('||').filter(Boolean);
    studioImg.src=src;
    studioImg.alt=alt;
    studioImg.setAttribute('data-shot',shot);
    studioImg.setAttribute('data-caption',title+' — '+alt);
    if(studioBadge)studioBadge.textContent=badge;
    if(studioTitle)studioTitle.textContent=title;
    if(studioCap)studioCap.textContent=title+' \u00b7 Click to Zoom';
    if(studioList){
      studioList.textContent='';
      bullets.forEach(function(b){var li=doc.createElement('li');li.textContent=b;studioList.appendChild(li)});
    }
    if(focusTab)tab.focus();
  }
  studioTabs.forEach(function(tab,idx){
    tab.addEventListener('click',function(){activateStudio(tab,false)});
    tab.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();activateStudio(studioTabs[(idx+1)%studioTabs.length],true)}
      else if(e.key==='ArrowLeft'){e.preventDefault();activateStudio(studioTabs[(idx-1+studioTabs.length)%studioTabs.length],true)}
      else if(e.key==='Home'){e.preventDefault();activateStudio(studioTabs[0],true)}
      else if(e.key==='End'){e.preventDefault();activateStudio(studioTabs[studioTabs.length-1],true)}
    });
  });
}

/* ---------- 4. Fullscreen Pixel Lightbox (#lightbox) ---------- */
var lb=$('#lightbox'),lbImg=$('#lb-img'),lbCap=$('#lb-cap'),lbClose=$('#lb-close'),lbLast=null;
function openLightbox(src,alt,caption,trigger){
  if(!lb||!lbImg)return;
  lbLast=trigger||doc.activeElement;
  lbImg.src=src;lbImg.alt=alt||'';
  if(lbCap)lbCap.textContent=caption||alt||'';
  lb.hidden=false;
  doc.body.classList.add('lb-open');
  if(lbClose)lbClose.focus();
}
function closeLightbox(){
  if(!lb||lb.hidden)return;
  lb.hidden=true;
  doc.body.classList.remove('lb-open');
  if(lbLast&&lbLast.focus)try{lbLast.focus()}catch(e){}
}
if(lb){
  if(lbClose)lbClose.addEventListener('click',closeLightbox);
  lb.addEventListener('click',function(e){if(e.target===lb)closeLightbox()});
  doc.addEventListener('keydown',function(e){if(e.key==='Escape'&&!lb.hidden){e.preventDefault();closeLightbox()}});
  doc.addEventListener('click',function(e){
    var el=e.target&&e.target.closest&&e.target.closest('[data-lightbox]');
    if(!el)return;
    var img=el.tagName==='IMG'?el:el.querySelector('img');
    if(!img||!img.getAttribute('src'))return;
    var cap=el.getAttribute('data-caption')||img.getAttribute('data-caption')||img.alt||'';
    openLightbox(img.currentSrc||img.src,img.alt,cap,el);
  });
  doc.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    var el=e.target&&e.target.closest&&e.target.closest('[data-lightbox]');
    if(!el||el.tagName==='BUTTON'||el.tagName==='A')return;
    e.preventDefault();
    var img=el.tagName==='IMG'?el:el.querySelector('img');
    if(img)openLightbox(img.currentSrc||img.src,img.alt,el.getAttribute('data-caption')||img.getAttribute('data-caption')||img.alt,el);
  });
}

/* ---------- 5. Trailer Cinema Controls (Pause/Freeze & Replay + Chapters) ---------- */
var trImg=$('#trailer-media'),trPause=$('#trailer-pause'),trReplay=$('#trailer-replay'),trFreeze=$('#trailer-freeze');
var trPaused=false,trBaseSrc=trImg?trImg.getAttribute('src'):'';
if(trImg&&trPause&&trFreeze){
  trPause.addEventListener('click',function(){
    trPaused=!trPaused;
    if(trPaused&&trImg.naturalWidth){
      trFreeze.width=trImg.naturalWidth;trFreeze.height=trImg.naturalHeight;
      var g=trFreeze.getContext('2d');if(g)g.drawImage(trImg,0,0);
      trFreeze.hidden=false;trImg.style.visibility='hidden';
      trPause.textContent='Resume Trailer';trPause.setAttribute('aria-pressed','true');
    }else{
      trFreeze.hidden=true;trImg.style.visibility='';
      trPause.textContent='Pause Frame';trPause.setAttribute('aria-pressed','false');
    }
  });
}
if(trImg&&trReplay){
  trReplay.addEventListener('click',function(){
    if(trPaused&&trPause)trPause.click();
    var clean=trBaseSrc.split('?')[0];
    trImg.src=clean+'?r='+Date.now();
  });
}
var chapterPills=$$('.chapter-pill'),chapterNote=$('#trailer-chapter-note');
chapterPills.forEach(function(p){
  p.addEventListener('click',function(){
    chapterPills.forEach(function(x){x.setAttribute('aria-pressed',x===p?'true':'false')});
    if(chapterNote&&p.getAttribute('data-note'))chapterNote.textContent=p.getAttribute('data-note');
  });
});

/* ---------- 6. Hotbar Scroll-Spy ---------- */
var navLinks=$$('.slot-nav[href^="#"]');
if('IntersectionObserver' in win&&navLinks.length){
  var navMap={};navLinks.forEach(function(a){navMap[a.getAttribute('href').slice(1)]=a});
  var navIo=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        navLinks.forEach(function(a){a.classList.remove('on');a.removeAttribute('aria-current')});
        var a=navMap[e.target.id];
        if(a){a.classList.add('on');a.setAttribute('aria-current','true')}
      }
    });
  },{rootMargin:'-40% 0px -52% 0px'});
  Object.keys(navMap).forEach(function(id){var el=doc.getElementById(id);if(el)navIo.observe(el)});
}

/* ---------- 7. Advancement Toasts ---------- */
var box=$('#toasts'),queue=[],busy=false,seen={};
try{seen=JSON.parse(get('sessionStorage','sloth.toasts')||'{}')||{}}catch(e){seen={}}
function toast(id,title,icon){
  if(!box||seen[id])return;
  seen[id]=1;set('sessionStorage','sloth.toasts',JSON.stringify(seen));
  queue.push([title,icon]);nextToast();
}
function nextToast(){
  if(busy||!queue.length)return;
  busy=true;var q=queue.shift();
  var el=doc.createElement('div');el.className='toast';
  var ti=doc.createElement('span');ti.className='ti';
  var im=doc.createElement('img');im.src='img/'+q[1];im.width=32;im.height=32;im.alt='';ti.appendChild(im);
  var tx=doc.createElement('div'),a=doc.createElement('small'),b=doc.createElement('strong');
  a.textContent='Advancement made!';b.textContent=q[0];tx.appendChild(a);tx.appendChild(b);
  el.appendChild(ti);el.appendChild(tx);box.appendChild(el);
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('in');play('ding')})});
  setTimeout(function(){el.classList.remove('in');setTimeout(function(){el.remove();busy=false;nextToast()},reduce?40:380)},3600);
}
var SECS=[
  ['trailer','Cinema Mode','ico-gem.png'],
  ['studios','Master Crafter','ico-castle.png'],
  ['ingame','Dragon Tamer','ico-mob.png'],
  ['showcase','Pixel Artist','ico-palette.png'],
  ['trust','Safety First','ico-shield.png']
];
if('IntersectionObserver' in win){
  var advIo=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){var s=e.target._adv;advIo.unobserve(e.target);toast(s[0],s[1],s[2])}});
  },{threshold:.25});
  SECS.forEach(function(s){var el=doc.getElementById(s[0]);if(el){el._adv=s;advIo.observe(el)}});
}
var dl=$('#dl');if(dl)dl.addEventListener('click',function(){toast('download','Ready to Mod!','ico-chest.png')});

/* ---------- 8. XP Scroll Meter ---------- */
var xp=$('#xp'),fill=$('#xp-fill'),lab=$('#xp-lab'),maxed=false,flash=false,tick=false;
function levelUp(){
  flash=true;lab.textContent='Level up!';xp.classList.add('up');play('chime');
  setTimeout(function(){flash=false;xp.classList.remove('up');updXp()},1500);
}
function updXp(){
  tick=false;
  var max=doc.documentElement.scrollHeight-win.innerHeight;
  var p=max>0?Math.min(1,Math.max(0,win.pageYOffset/max)):0;
  fill.style.width=(p*100).toFixed(1)+'%';
  var lv=Math.floor(p*30);
  if(p>=.992){lv=30;if(!maxed){maxed=true;levelUp()}}else if(p<.9)maxed=false;
  if(!flash)lab.textContent='Lv '+lv;
}
if(xp&&fill&&lab){
  win.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(updXp)}},{passive:true});
  win.addEventListener('resize',updXp);updXp();
}

/* ---------- 9. Sloth Mascot Click + Secret Easter Egg ---------- */
var mascot=$('#hero-sloth');
var CODE='sloth',KONAMI=['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'],typed='',keys=[],busyEgg=false;
function egg(){
  toast('secret','Secret Sloth','ico-gem.png');
  if(!mascot||busyEgg)return;
  busyEgg=true;
  if(!reduce){
    mascot.classList.remove('dance');void mascot.offsetWidth;mascot.classList.add('dance');
    setTimeout(function(){
      var b=mascot.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
      var cols=['#7be04e','#fcd34d','#ffffff','#3f9a2e','#5ce1e6'];
      for(var i=0;i<24;i++){
        var p=doc.createElement('i');p.className='pp';p.style.background=cols[i%cols.length];
        p.style.left=(cx-4)+'px';p.style.top=(cy-4)+'px';doc.body.appendChild(p);
        var a=Math.random()*6.283,d=45+Math.random()*85,dx=Math.cos(a)*d,dy=Math.sin(a)*d-35;
        var an=p.animate?p.animate([{transform:'translate(0,0)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px)',opacity:1,offset:.6},{transform:'translate('+dx*1.1+'px,'+(dy+65)+'px)',opacity:0}],{duration:850+Math.random()*450,easing:'ease-out'}):null;
        if(an)an.onfinish=(function(el){return function(){el.remove()}})(p);else p.remove();
      }
    },220);
    if(win.slothScene&&win.slothScene.craft)win.slothScene.craft();
    play('chime');
    setTimeout(function(){mascot.classList.remove('dance');busyEgg=false},1900);
  }else{
    play('chime');busyEgg=false;
  }
}
if(mascot)mascot.addEventListener('click',egg);
doc.addEventListener('keydown',function(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(win.slothScene&&win.slothScene.isFocused&&win.slothScene.isFocused())return;
  var t=e.target,tn=t&&t.tagName;
  if(tn==='INPUT'||tn==='TEXTAREA'||tn==='SELECT'||(t&&t.isContentEditable))return;
  var k=(e.key||'').toLowerCase();if(!k)return;
  if(k.length===1){typed=(typed+k).slice(-CODE.length);if(typed===CODE){typed='';egg();return}}
  keys.push(k);if(keys.length>KONAMI.length)keys.shift();
  if(keys.join()===KONAMI.join()){keys=[];egg()}
});
})();
