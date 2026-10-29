// Single source of truth for products and prices. Used by the site and by
// netlify/functions/orders.mjs, so the server always recalculates totals itself.
export const COLORS=['#d6215a','#f6c928','#eab8e0','#2b5fd9','#ffffff','#4a1230'];
export const COLOR_NAMES={'#d6215a':'Raspberry','#f6c928':'Sunflower','#eab8e0':'Blush','#2b5fd9':'Royal blue','#ffffff':'White','#4a1230':'Plum'};
export const SHAPES={bow:'Bow',tag:'Name tag',heart:'Heart',flower:'Flower'};

// cat: key | pen | glitter | dtf | acc   art: how the picture is drawn
export const PRODUCTS=[
  {id:'bow-keychain',name:'Bow Keychain',cat:'key',art:'key',shape:'bow',color:'#d6215a',price:8,label:'Mia'},
  {id:'name-tag-keychain',name:'Name Tag Keychain',cat:'key',art:'key',shape:'tag',color:'#f6c928',price:8,label:'Zoe'},
  {id:'game-day-keychain',name:'Game Day Keychain',cat:'key',art:'key',shape:'tag',color:'#2b5fd9',price:9,label:'Go!'},
  {id:'heart-keychain',name:'Heart Keychain',cat:'key',art:'key',shape:'heart',color:'#eab8e0',price:6,label:''},
  {id:'crayon-bow-tray',name:'Crayon Bow Trinket Tray',cat:'acc',art:'tray',color:'#f6c928',price:16},
  {id:'pink-bow-pen-cup',name:'Pink Bow Pen Cup',cat:'acc',art:'tray',color:'#d6215a',price:18},
  {id:'spiral-gel-pen',name:'Spiral Gel Pen',cat:'pen',art:'pen',color:'#eab8e0',price:10},
  {id:'baseball-fidget',name:'Baseball Fidget',cat:'acc',art:'pen',color:'#ffffff',price:8},
];

// the "Make it yours" designer on the Customize page
export const CUSTOM_KEYCHAIN={id:'custom-keychain',name:'Custom Keychain',price:8};

export const FREE_SHIPPING_AT=35;
export const SHIPPING_FLAT=5; // TODO: confirm real shipping rate

export const findProduct=id=>id===CUSTOM_KEYCHAIN.id?CUSTOM_KEYCHAIN:PRODUCTS.find(p=>p.id===id);

// returns a cleaned copy of a custom keychain's options, or null if invalid
export function cleanOpts(o){
  if(!o||typeof o!=='object')return null;
  const name=String(o.name||'').trim().slice(0,8);
  if(!COLORS.includes(o.color)||!SHAPES[o.shape])return null;
  return {name,color:o.color,shape:o.shape};
}

export function describe(item){
  if(item.id!==CUSTOM_KEYCHAIN.id||!item.opts)return '';
  const o=item.opts;return [SHAPES[o.shape],COLOR_NAMES[o.color],o.name&&'“'+o.name+'”'].filter(Boolean).join(' · ');
}

export function totals(items){
  const subtotal=items.reduce((s,i)=>s+(findProduct(i.id)?.price||0)*i.qty,0);
  const shipping=subtotal===0||subtotal>=FREE_SHIPPING_AT?0:SHIPPING_FLAT;
  return {subtotal,shipping,total:subtotal+shipping};
}

export const money=n=>'$'+n.toFixed(2);
