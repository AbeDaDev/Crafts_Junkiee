import {totals,money,findProduct,describe} from './catalog.js';
import {getItems,onChange,clear,lineHTML,openCart} from './cart.js';
import {esc} from './art.js';

const wrap=document.getElementById('co'),form=document.getElementById('co-form'),err=document.getElementById('co-err'),submit=document.getElementById('co-submit');
const $=id=>document.getElementById(id);
const EMAIL='crafts.junkiee@gmail.com';

function renderSummary(){
  const items=getItems();
  if(!items.length){wrap.innerHTML='<div class="co-empty"><p>Your cart is empty.</p><a class="btn" href="/shop.html">Start shopping</a></div>';return}
  $('co-lines').innerHTML=items.map((i,n)=>lineHTML(i,'s'+n,false)).join('');
  const t=totals(items);
  $('co-sub').textContent=money(t.subtotal);$('co-ship').textContent=t.shipping?money(t.shipping):'Free';$('co-total').textContent=money(t.total);
}
renderSummary();onChange(()=>{if($('co-lines'))renderSummary()});
$('co-edit').onclick=openCart;

const RULES={
  firstName:v=>v||'Enter your first name.',lastName:v=>v||'Enter your last name.',
  email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||'Enter a valid email, like name@example.com.',
  address1:v=>v||'Enter your street address.',city:v=>v||'Enter your city.',
  state:v=>/^[A-Za-z]{2}$/.test(v)||'Use the 2-letter state code, like CA.',
  zip:v=>/^\d{5}(-\d{4})?$/.test(v)||'Enter a 5-digit ZIP code.',
};
function validate(data){
  let first=null;
  for(const [k,rule] of Object.entries(RULES)){
    const el=$(k),r=rule(data[k]),bad=r!==true&&typeof r==='string';
    el.setAttribute('aria-invalid',bad);
    let m=el.parentNode.querySelector('.f-err');
    if(bad){if(!m){m=document.createElement('p');m.className='f-err';m.id=k+'-err';el.parentNode.append(m);el.setAttribute('aria-describedby',m.id)}m.textContent=r;first??=el}
    else if(m)m.remove();
  }
  if(first)first.focus();
  return !first;
}

function orderEmail(order,data){
  const t=totals(order.items);
  const lines=order.items.map(i=>{const p=findProduct(i.id),d=describe(i);return '- '+p.name+(d?' ('+d+')':'')+' x'+i.qty+' = '+money(p.price*i.qty)}).join('\n');
  const text='New order\n\n'+lines+'\n\nSubtotal: '+money(t.subtotal)+'\nShipping: '+money(t.shipping)+'\nTotal: '+money(t.total)+
    '\n\n'+data.firstName+' '+data.lastName+'\n'+data.email+(data.phone?'\n'+data.phone:'')+'\n'+data.address1+(data.address2?'\n'+data.address2:'')+'\n'+data.city+', '+data.state+' '+data.zip+(data.notes?'\n\nNotes: '+data.notes:'');
  return 'mailto:'+EMAIL+'?subject='+encodeURIComponent('Order from '+data.firstName+' '+data.lastName)+'&body='+encodeURIComponent(text);
}

function done(html){wrap.innerHTML='<div class="co-done">'+html+'</div>';wrap.querySelector('h2').focus();scrollTo({top:0,behavior:'smooth'})}

form.addEventListener('submit',async e=>{
  e.preventDefault();err.textContent='';
  const data=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,String(v).trim()]));
  data.state=data.state.toUpperCase();
  if(!validate(data))return;
  const order={customer:data,items:getItems().map(({id,qty,opts})=>({id,qty,...(opts&&{opts})}))};
  submit.disabled=true;submit.textContent='Placing order…';
  try{
    const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});
    if(res.status===503||res.status===404||!(res.headers.get('content-type')||'').includes('json')){
      // online ordering not connected yet: hand the order off by email instead
      const href=orderEmail(order,data);
      done('<h2 tabindex="-1">Almost there!</h2><p>Online ordering isn’t switched on yet, so please send your order to us by email. We’ve written it up for you.</p><a class="btn" href="'+esc(href)+'">Email my order</a><p class="opt">Opens your email app with the order filled in. Your cart stays saved until you hear back from us.</p>');
      return;
    }
    const out=await res.json();
    if(!res.ok)throw new Error(out.error||'Could not place order.');
    clear();
    done('<h2 tabindex="-1">Thank you, '+esc(data.firstName)+'!</h2><p>Your order <b>'+esc(out.orderNumber)+'</b> is in. We’ll email <b>'+esc(data.email)+'</b> soon to confirm and send a payment link.</p><p>Total: <b>'+money(out.total)+'</b></p><a class="btn" href="/shop.html">Keep shopping</a>');
  }catch(e2){err.textContent=e2.message||'Something went wrong. Please try again.';submit.disabled=false;submit.textContent='Place order'}
});
