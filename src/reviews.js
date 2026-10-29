// Reviews talk to /api/reviews (netlify/functions/reviews.mjs, backed by MongoDB).
// Until the database is connected, the page runs in preview mode: it shows the
// starter reviews below and keeps new ones in this browser only.
const STARTER=[
  {name:'Maya R.',rating:5,product:'Keychains',text:'The name tag came out so crisp and the pink is exactly like the photos. It’s on my backpack now.'},
  {name:'Jess T.',rating:5,product:'DIY Pens',text:'Ordered pens as bridesmaid gifts. Everyone asked where I found them.'},
  {name:'Daniela P.',rating:5,product:'',text:'Fast shipping and a handwritten thank-you note inside. Buying again.'}];
const LOCAL='cj-reviews';
const list=document.getElementById('rv-list'),form=document.getElementById('write'),msg=document.getElementById('rv-msg'),summary=document.getElementById('rv-summary');
let reviews=[],live=false;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stars=n=>'★'.repeat(n)+'<span class="off">'+'★'.repeat(5-n)+'</span>';
function readLocal(){try{return JSON.parse(localStorage.getItem(LOCAL))||[]}catch(e){return[]}}
function saveLocal(r){try{localStorage.setItem(LOCAL,JSON.stringify([r,...readLocal()].slice(0,20)))}catch(e){}}

function render(){
  if(!reviews.length){list.innerHTML='<p class="empty">No reviews yet. Be the first!</p>';summary.textContent='No reviews yet.';return}
  const avg=reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;
  summary.textContent='Rated '+avg.toFixed(1)+' out of 5 from '+reviews.length+' review'+(reviews.length===1?'':'s')+'.';
  list.innerHTML=reviews.map(r=>'<article class="rv"><div class="rv-top"><h3>'+esc(r.name)+'</h3><span class="rv-rating" role="img" aria-label="'+r.rating+' out of 5 stars">'+stars(r.rating)+'</span></div>'+
    '<div class="rv-meta">'+[r.product&&esc(r.product),r.createdAt&&new Date(r.createdAt).toLocaleDateString()].filter(Boolean).join(' · ')+'</div><p>'+esc(r.text)+'</p></article>').join('');
}

async function load(){
  try{const res=await fetch('/api/reviews');if(!res.ok)throw 0;reviews=await res.json();live=true}
  catch(e){reviews=[...readLocal(),...STARTER]}
  render();
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  const fd=new FormData(form);
  const r={name:fd.get('name').trim(),rating:+fd.get('rating')||0,product:fd.get('product')||'',text:fd.get('text').trim(),website:fd.get('website')};
  if(!r.rating){msg.textContent='Please pick a star rating.';return}
  if(!r.name){msg.textContent='Please add your name.';return}
  if(r.text.length<5){msg.textContent='Please write a few words about your order.';return}
  const btn=form.querySelector('button');btn.disabled=true;msg.textContent='Posting…';
  try{
    if(live){const res=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(r)});if(!res.ok)throw new Error((await res.json().catch(()=>({}))).error||'Could not post');reviews.unshift(await res.json())}
    else{delete r.website;r.createdAt=new Date().toISOString();saveLocal(r);reviews.unshift(r)}
    render();form.reset();msg.textContent='Thank you! Your review is posted.';
  }catch(err){msg.textContent=err.message||'Something went wrong. Please try again.'}
  btn.disabled=false;
});

load();
