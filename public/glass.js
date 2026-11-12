// Subtle pointer reflection; independent of authentication and draw state.
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const cards=[...document.querySelectorAll('.glass-panel')];
const reset=card=>{card.classList.remove('is-lit');card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');};
for(const card of cards){
 let frame=0,point=null;
 const clear=()=>{cancelAnimationFrame(frame);frame=0;point=null;reset(card);};
 card.addEventListener('pointermove',event=>{
  if(!finePointer.matches||reducedMotion.matches||event.pointerType!=='mouse'||document.body.classList.contains('motion-paused')||card.matches(':focus-within')){clear();return;}
  point={x:event.clientX,y:event.clientY};
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;if(!point)return;
   const bounds=card.getBoundingClientRect();
   if(!bounds.width||!bounds.height)return;
   const x=Math.max(0,Math.min(1,(point.x-bounds.left)/bounds.width));
   const y=Math.max(0,Math.min(1,(point.y-bounds.top)/bounds.height));
   card.style.setProperty('--shine-x',x*100+'%');
   card.style.setProperty('--shine-y',y*100+'%');
   card.classList.add('is-lit');
   if(card.classList.contains('glass-tilt')){
    card.style.setProperty('--tilt-x',(0.5-y)*4+'deg');
    card.style.setProperty('--tilt-y',(x-0.5)*4+'deg');
   }
  });
 });
 card.addEventListener('pointerleave',clear);
 card.addEventListener('pointercancel',clear);
 card.addEventListener('focusin',clear);
 card.addEventListener('pointerdown',clear);
 finePointer.addEventListener('change',clear);
 reducedMotion.addEventListener('change',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
}
