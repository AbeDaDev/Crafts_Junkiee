const COLORS=['#d6215a','#f6c928','#eab8e0','#2b5fd9','#ffffff','#4a1230'];
const INK={'#d6215a':'#fff','#f6c928':'#4a1230','#eab8e0':'#4a1230','#2b5fd9':'#fff','#ffffff':'#a3112f','#4a1230':'#fff'};
let n=0;const cartEl=document.getElementById('cart');
function add(){n++;cartEl.textContent='Cart ('+n+')'}
function esc(s){return s.replace(/[&<>"]/g,'')}
const lines='<pattern id="L{id}" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="3" fill="#fff" opacity=".2"/></pattern>';
const BOW='<path d="M150 130C90 70 30 90 38 150c6 50 70 46 112-6zM150 130c60-60 120-40 112 20-6 50-70 46-112-6z"/><rect x="132" y="112" width="36" height="40" rx="12"/><path d="M140 150l-30 42 26-4 14 14zM160 150l30 42-26-4-14 14z"/>';
function traySVG(c,id){
  return '<svg viewBox="0 0 300 230" role="img" aria-label="trinket tray"><defs>'+lines.replace(/\{id\}/g,id)+'</defs><g transform="translate(0 16)"><g fill="'+c+'">'+BOW+'</g><g fill="url(#L'+id+')">'+BOW+'</g><g fill="#4a1230" opacity=".18" transform="translate(150 134) scale(.62) translate(-150 -134)">'+BOW+'</g></g></svg>';
}
function shapeSVG(shape,c,id){
  let b;
  if(shape==='tag')b='<rect x="40" y="80" width="220" height="110" rx="34"/>';
  else if(shape==='bow')b='<g>'+BOW+'</g>';
  else if(shape==='heart')b='<path d="M150 200C60 140 40 100 70 72c24-22 62-8 80 18 18-26 56-40 80-18 30 28 10 68-80 128z"/>';
  else b='<g><circle cx="150" cy="95" r="42"/><circle cx="198" cy="132" r="42"/><circle cx="180" cy="186" r="42"/><circle cx="120" cy="186" r="42"/><circle cx="102" cy="132" r="42"/><circle cx="150" cy="140" r="48"/></g>';
  return '<defs>'+lines.replace(/\{id\}/g,id)+'</defs><circle cx="150" cy="30" r="14" fill="none" stroke="#4a1230" stroke-width="5"/><path d="M150 44v34" stroke="#4a1230" stroke-width="5"/><g fill="'+c+'">'+b+'</g><g fill="url(#L'+id+')">'+b+'</g>';
}
function keySVG(shape,c,name,id){
  const y=shape==='bow'?222:shape==='tag'?144:shape==='heart'?136:146;
  return '<svg viewBox="0 0 300 230" role="img" aria-label="'+shape+' keychain">'+shapeSVG(shape,c,id)+'<text x="150" y="'+y+'" text-anchor="middle" font-family="Bagel Fat One,sans-serif" font-size="'+(name.length>5?32:42)+'" fill="'+(shape==='bow'?'#4a1230':INK[c])+'">'+esc(name)+'</text></svg>';
}
function penSVG(c,id){
  return '<svg viewBox="0 0 300 230" role="img" aria-label="pen"><defs>'+lines.replace(/\{id\}/g,id)+'</defs><g transform="rotate(-35 150 115)"><rect x="30" y="97" width="190" height="36" rx="18" fill="'+c+'"/><rect x="30" y="97" width="190" height="36" rx="18" fill="url(#L'+id+')"/><path d="M220 99l46 16-46 16z" fill="#4a1230"/><rect x="60" y="86" width="70" height="8" rx="4" fill="#4a1230"/></g></svg>';
}
// customizer
let cc=COLORS[0],cs='bow';
const prev=document.getElementById('prev'),nm=document.getElementById('nm');
function drawPrev(){prev.innerHTML=keySVG(cs,cc,nm.value||'Name','pv')}
const sw=document.getElementById('sw');
COLORS.forEach(c=>{const b=document.createElement('button');b.style.background=c;b.setAttribute('aria-label','Color '+c);b.setAttribute('aria-pressed',c===cc);b.onclick=()=>{cc=c;[...sw.children].forEach(x=>x.setAttribute('aria-pressed',x===b));drawPrev()};sw.append(b)});
const shp=document.getElementById('shp');
[['bow','Bow'],['tag','Name tag'],['heart','Heart'],['flower','Flower']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',k===cs);b.onclick=()=>{cs=k;[...shp.children].forEach(x=>x.setAttribute('aria-pressed',x===b));drawPrev()};shp.append(b)});
nm.oninput=drawPrev;drawPrev();
document.getElementById('addc').onclick=function(){add();this.textContent='Added to cart';setTimeout(()=>this.textContent='Add to cart · $8',1400)};
// shop
const P=[
['Bow Keychain','key','bow','#d6215a',8,'Mia'],['Name Tag Keychain','key','tag','#f6c928',8,'Zoe'],['Game Day Keychain','key','tag','#2b5fd9',9,'Go!'],['Heart Keychain','key','heart','#eab8e0',6,''],
['Crayon Bow Trinket Tray','tray','','#f6c928',16],['Pink Bow Pen Cup','tray','','#d6215a',18],
['Spiral Gel Pen','pen','','#eab8e0',10],['Baseball Fidget','pen','','#ffffff',8]];
const grid=document.getElementById('grid'),tabs=document.getElementById('tabs');
let f='all';
function draw(){grid.innerHTML='';P.forEach((p,i)=>{if(f!=='all'&&p[1]!==f)return;
  const d=document.createElement('div');d.className='item';
  d.innerHTML='<div class="pic">'+(p[1]==='key'?keySVG(p[2],p[3],p[5]||'','p'+i):p[1]==='tray'?traySVG(p[3],'p'+i):penSVG(p[3],'p'+i))+'</div><h3>'+p[0]+'</h3><div class="row"><span>$'+p[4]+'.00</span><button class="add">Add to cart</button></div>';
  const bt=d.querySelector('button');bt.onclick=()=>{add();bt.textContent='Added';setTimeout(()=>bt.textContent='Add to cart',1200)};
  grid.append(d)})}
[['all','All'],['key','Keychains'],['tray','Trinket trays'],['pen','Pens & fidgets']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',k===f);b.dataset.k=k;b.onclick=()=>setF(k);tabs.append(b)});
function setF(k){f=k;[...tabs.children].forEach(x=>x.setAttribute('aria-pressed',x.dataset.k===k));draw()}
document.querySelectorAll('[data-go]').forEach(a=>a.onclick=()=>setF(a.dataset.go));
draw();
document.getElementById('nl').onsubmit=e=>{e.preventDefault();const v=document.getElementById('em').value;document.getElementById('nlm').textContent=/\S+@\S+\.\S+/.test(v)?'You’re on the list. Thank you!':'Enter a valid email address, like name@example.com.'};
