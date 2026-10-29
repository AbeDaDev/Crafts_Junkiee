import {COLORS,COLOR_NAMES,SHAPES,PRODUCTS,CUSTOM_KEYCHAIN,cleanOpts,money} from './catalog.js';
import {keySVG,art} from './art.js';
import {add} from './cart.js';
// customizer
const prev=document.getElementById('prev');
if(prev){
let cc=COLORS[0],cs='bow';
const nm=document.getElementById('nm');
function drawPrev(){prev.innerHTML=keySVG(cs,cc,nm.value||'Name','pv')}
const sw=document.getElementById('sw');
COLORS.forEach(c=>{const b=document.createElement('button');b.style.background=c;b.setAttribute('aria-label',COLOR_NAMES[c]);b.setAttribute('aria-pressed',c===cc);b.onclick=()=>{cc=c;[...sw.children].forEach(x=>x.setAttribute('aria-pressed',x===b));drawPrev()};sw.append(b)});
const shp=document.getElementById('shp');
Object.entries(SHAPES).forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',k===cs);b.onclick=()=>{cs=k;[...shp.children].forEach(x=>x.setAttribute('aria-pressed',x===b));drawPrev()};shp.append(b)});
nm.oninput=drawPrev;drawPrev();
document.getElementById('addc').onclick=function(){add(CUSTOM_KEYCHAIN.id,cleanOpts({name:nm.value,color:cc,shape:cs}));this.textContent='Added to cart';setTimeout(()=>this.textContent='Add to cart · $8',1400)};
}
// shop
const P=PRODUCTS;
function card(p,id){
  const d=document.createElement('div');d.className='item';
  d.innerHTML='<div class="pic">'+art(p,id)+'</div><h3>'+p.name+'</h3><div class="row"><span>'+money(p.price)+'</span><button class="add" aria-label="Add '+p.name+' to cart">Add to cart</button></div>';
  const bt=d.querySelector('button');bt.onclick=()=>{add(p.id);bt.textContent='Added';setTimeout(()=>bt.textContent='Add to cart',1200)};
  return d}
const grid=document.getElementById('grid'),tabs=document.getElementById('tabs');
if(grid){
let f=document.body.dataset.cat||'all';
function draw(){grid.innerHTML='';if(!P.some(p=>f==='all'||p.cat===f))grid.innerHTML='<p class="empty">New drops coming soon. Want something now? <a href="/customize.html">Ask for a custom order</a>.</p>';P.forEach((p,i)=>{if(f!=='all'&&p.cat!==f)return;
  grid.append(card(p,'p'+i))})}
if(tabs)[['all','All'],['key','Keychains'],['pen','DIY Pens'],['glitter','Glitter'],['dtf','DTF Prints'],['acc','Accessories']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',k===f);b.dataset.k=k;b.onclick=()=>setF(k);tabs.append(b)});
function setF(k){f=k;[...tabs.children].forEach(x=>x.setAttribute('aria-pressed',x.dataset.k===k));draw()}

draw();
}
// homepage preview: shows 4 products and reshuffles them every few seconds
const shuf=document.getElementById('shuffle');
if(shuf){
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,hover=false,round=0;
const tog=document.getElementById('shuffle-toggle');
function pick(){const a=[...P];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,4)}
function deal(animate){round++;const next=pick();
  if(!animate||!shuf.children.length){shuf.innerHTML='';next.forEach((p,i)=>shuf.append(card(p,'s'+round+i)));return}
  [...shuf.children].forEach((el,i)=>setTimeout(()=>{el.classList.add('out');setTimeout(()=>{const c=card(next[i],'s'+round+i);c.classList.add('in');el.replaceWith(c);requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.remove('in')))},300)},i*110))}
function setPaused(v){paused=v;tog.setAttribute('aria-pressed',v);tog.textContent=v?'Resume shuffle':'Pause shuffle'}
setPaused(paused);tog.onclick=()=>setPaused(!paused);
shuf.onmouseenter=shuf.onfocusin=()=>hover=true;shuf.onmouseleave=shuf.onfocusout=()=>hover=false;
deal(false);
setInterval(()=>{if(!paused&&!hover&&!document.hidden)deal(true)},3800);
}
const nl=document.getElementById('nl');if(nl)nl.onsubmit=e=>{e.preventDefault();const v=document.getElementById('em').value;document.getElementById('nlm').textContent=/\S+@\S+\.\S+/.test(v)?'You’re on the list. Thank you!':'Enter a valid email address, like name@example.com.'};
