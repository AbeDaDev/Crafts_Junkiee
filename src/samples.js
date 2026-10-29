// every image dropped into /Samples shows up here automatically
const photos=Object.entries(import.meta.glob('/Samples/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',{eager:true,query:'?url',import:'default'})).sort(([a],[b])=>a.localeCompare(b)).map(([,url])=>url);
const gallery=document.getElementById('gallery'),lb=document.getElementById('lightbox'),img=document.getElementById('lb-img'),count=document.getElementById('lb-count');
let cur=0;
photos.forEach((url,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Open sample photo '+(i+1));b.innerHTML='<img src="'+url+'" alt="Crafts Junkiee sample piece '+(i+1)+'" loading="lazy" decoding="async">';b.onclick=()=>show(i);gallery.append(b)});
if(!photos.length)gallery.innerHTML='<p class="empty">Samples coming soon.</p>';
function show(i){cur=(i+photos.length)%photos.length;img.src=photos[cur];img.alt='Crafts Junkiee sample piece '+(cur+1);count.textContent=(cur+1)+' / '+photos.length;if(!lb.open)lb.showModal()}
document.getElementById('lb-prev').onclick=()=>show(cur-1);
document.getElementById('lb-next').onclick=()=>show(cur+1);
document.getElementById('lb-close').onclick=()=>lb.close();
lb.onclick=e=>{if(e.target===lb)lb.close()};
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
let x0=null;lb.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));x0=null});
