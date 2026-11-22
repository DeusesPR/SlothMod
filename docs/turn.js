/* Creature viewer, no libraries: real in-game pictures of creatures from four sides (pictures, not 3D). */
(function(){
'use strict';
var tb=document.getElementById('turn');
if(!tb)return;
var im=tb.querySelector('img.pic'),names=[].slice.call(tb.querySelectorAll('[data-who]')),views=[].slice.call(tb.querySelectorAll('[data-view]')),cap=tb.querySelector('[data-cap]');
if(!im||!names.length)return;
var V=['front','three_quarter','side','back'],VL=['Front','Three-quarter','Side','Back'];
var who=names[0].getAttribute('data-who'),wl=names[0].getAttribute('data-label'),vi=1,cache={};
function show(){
  var src='img/turn/'+who+'-'+V[vi]+'.webp';im.src=src;
  im.alt=wl+' in Minecraft, '+VL[vi].toLowerCase()+' view. A real in-game picture.';
  if(cap)cap.textContent=wl+' · '+VL[vi]+' view';
  names.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-who')===who?'true':'false')});
  views.forEach(function(b){b.setAttribute('aria-pressed',+b.getAttribute('data-view')===vi?'true':'false')});
  var nx='img/turn/'+who+'-'+V[(vi+1)%4]+'.webp';
  if(!cache[nx]){cache[nx]=1;var p=new Image();p.src=nx}
}
names.forEach(function(b){b.addEventListener('click',function(){who=b.getAttribute('data-who');wl=b.getAttribute('data-label');show()})});
views.forEach(function(b){b.addEventListener('click',function(){vi=+b.getAttribute('data-view');show()})});
var dx=null;
im.addEventListener('pointerdown',function(e){dx=e.clientX;try{im.setPointerCapture(e.pointerId)}catch(x){}});
im.addEventListener('pointermove',function(e){if(dx===null)return;var d=e.clientX-dx;if(Math.abs(d)>60){vi=(vi+(d<0?1:3))%4;dx=e.clientX;show()}});
im.addEventListener('pointerup',function(){dx=null});
im.addEventListener('pointercancel',function(){dx=null});
im.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'){e.preventDefault();vi=(vi+1)%4;show()}
  else if(e.key==='ArrowLeft'){e.preventDefault();vi=(vi+3)%4;show()}
});
show();
})();
