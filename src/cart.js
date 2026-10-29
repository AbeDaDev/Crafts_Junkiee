// Cart: saved in this browser (localStorage) and shown in a slide-out panel
// opened from the header "Cart" button on every page.
import {findProduct,describe,totals,money,cleanOpts,FREE_SHIPPING_AT,CUSTOM_KEYCHAIN} from './catalog.js';
import {art,esc} from './art.js';

const KEY='cj-cart-v2';
const listeners=new Set();
let items=read();

function read(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY))||[];
    // drop anything no longer in the catalog
    return raw.filter(i=>findProduct(i.id)&&i.qty>0&&(i.id!==CUSTOM_KEYCHAIN.id||cleanOpts(i.opts)));
  }catch(e){return[]}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}listeners.forEach(f=>f(items))}
const keyOf=(id,opts)=>id+(opts?'|'+opts.shape+'|'+opts.color+'|'+opts.name:'');

export const getItems=()=>items;
export const count=()=>items.reduce((s,i)=>s+i.qty,0);
export const onChange=f=>listeners.add(f);
export function add(id,opts){
  const k=keyOf(id,opts),hit=items.find(i=>i.key===k);
  if(hit)hit.qty=Math.min(hit.qty+1,99);else items.push({key:k,id,qty:1,...(opts&&{opts})});
  save();bump();
}
export function setQty(k,q){const it=items.find(i=>i.key===k);if(!it)return;if(q<1)items=items.filter(i=>i!==it);else it.qty=Math.min(q,99);save()}
export function clear(){items=[];save()}

// keep tabs in sync
addEventListener('storage',e=>{if(e.key===KEY){items=read();listeners.forEach(f=>f(items))}});

// ---- header button ----
const btn=document.getElementById('cart');
function label(){const n=count();btn.textContent='Cart ('+n+')';btn.setAttribute('aria-label','Open cart, '+n+' item'+(n===1?'':'s'))}
function bump(){btn.classList.remove('bump');void btn.offsetWidth;btn.classList.add('bump')}
btn.removeAttribute('aria-live');btn.setAttribute('aria-haspopup','dialog');
label();onChange(label);

// ---- slide-out panel ----
const dlg=document.createElement('dialog');
dlg.className='drawer';dlg.setAttribute('aria-labelledby','drawer-title');
dlg.innerHTML='<div class="drawer-panel"><div class="drawer-head"><h2 id="drawer-title">Your cart</h2><button class="drawer-x" aria-label="Close cart">×</button></div><div class="drawer-body"></div><div class="drawer-foot"></div></div>';
document.body.append(dlg);
const body=dlg.querySelector('.drawer-body'),foot=dlg.querySelector('.drawer-foot');

export function lineHTML(i,n,controls){
  const p=findProduct(i.id),d=describe(i);
  return '<li class="line" data-key="'+esc(i.key)+'"><div class="line-pic">'+art(p,'c'+n,i.opts)+'</div><div class="line-info"><b>'+esc(p.name)+'</b>'+(d?'<span>'+esc(d)+'</span>':'')+
    (controls?'<div class="qty"><button data-d="-1" aria-label="Decrease quantity of '+esc(p.name)+'">−</button><span aria-live="polite">'+i.qty+'</span><button data-d="1" aria-label="Increase quantity of '+esc(p.name)+'">+</button><button class="line-rm" aria-label="Remove '+esc(p.name)+'">Remove</button></div>':'<span>Qty '+i.qty+'</span>')+
    '</div><div class="line-price">'+money(p.price*i.qty)+'</div></li>';
}
function render(){
  if(!items.length){
    body.innerHTML='<p class="drawer-empty">Your cart is empty.</p>';
    foot.innerHTML='<a class="btn" href="/shop.html">Start shopping</a>';return;
  }
  body.innerHTML='<ul class="lines">'+items.map((i,n)=>lineHTML(i,n,true)).join('')+'</ul>';
  const t=totals(items),left=FREE_SHIPPING_AT-t.subtotal;
  foot.innerHTML='<div class="sum-row"><span>Subtotal</span><b>'+money(t.subtotal)+'</b></div>'+
    '<p class="ship-note">'+(left>0?'Add '+money(left)+' more for free shipping.':'You’ve got free shipping!')+'</p>'+
    '<a class="btn" href="/checkout.html">Checkout</a><button class="btn alt drawer-close">Keep shopping</button>';
}
body.addEventListener('click',e=>{
  const li=e.target.closest('.line');if(!li)return;const k=li.dataset.key,it=items.find(i=>i.key===k);if(!it)return;
  if(e.target.matches('.line-rm')){setQty(k,0);(body.querySelector('.qty button')||dlg.querySelector('.drawer-x')).focus()}
  else if(e.target.dataset.d){const d=e.target.dataset.d;setQty(k,it.qty+ +d);(body.querySelector('.line[data-key="'+CSS.escape(k)+'"] [data-d="'+d+'"]')||dlg.querySelector('.drawer-x')).focus()}
});
dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('.drawer-x,.drawer-close'))dlg.close()});
onChange(()=>{if(dlg.open)render()});
export function openCart(){render();dlg.showModal()}
btn.onclick=openCart;
