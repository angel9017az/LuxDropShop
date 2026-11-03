/* LuxDropShop · Página de producto  (/productos/<nombre-del-producto>)
   Se carga DESPUÉS de app.js y reutiliza su carrito, favoritos, toast y catálogo. */
(()=>{
const root=$('#pdp');if(!root)return;
const slug=decodeURIComponent(location.pathname.replace(/\/+$/,'').split('/').pop()||'').toLowerCase();
let product=null,qty=1;

const discount=p=>p.oldPrice&&p.oldPrice>p.price?Math.round((1-p.price/p.oldPrice)*100):0;
const gallery=p=>[...new Set((Array.isArray(p.images)&&p.images.length?p.images:[p.image]).filter(Boolean))];

function meta(attr,key,content){let el=document.head.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el)}el.setAttribute('content',content)}
function setSeo(p){
  const url=location.origin+productUrl(p),desc=String(p.description||'').slice(0,155),img=p.image?new URL(p.image,location.origin).href:'';
  document.title=`${p.name} — LuxDropShop`;
  meta('name','description',desc);meta('property','og:title',`${p.name} — LuxDropShop`);meta('property','og:description',desc);meta('property','og:type','product');meta('property','og:url',url);if(img)meta('property','og:image',img);
  let link=document.head.querySelector('link[rel=canonical]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}link.href=url;
  let ld=document.getElementById('productLd');if(!ld){ld=document.createElement('script');ld.type='application/ld+json';ld.id='productLd';document.head.appendChild(ld)}
  ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Product',name:p.name,description:desc,image:img||undefined,category:p.category,brand:p.brand?{'@type':'Brand',name:p.brand}:undefined,
    offers:{'@type':'Offer',url,priceCurrency:'MXN',price:p.price,availability:p.stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock'}});
}

function notFound(title,text){
  document.title='Producto no encontrado — LuxDropShop';
  root.innerHTML=`<div class="review-empty pdp-empty"><span>◇</span><b>${escapeHTML(title)}</b><p>${escapeHTML(text)}</p><a class="btn gold" href="/#productos">Volver a la tienda <span>→</span></a></div>`;
}

function relatedList(p){
  const others=products.filter(x=>x.id!==p.id);
  return [...others.filter(x=>x.category===p.category),...others.filter(x=>x.category!==p.category)].slice(0,4);
}
function relatedHTML(p){return relatedList(p).map(x=>productCard(x,{quick:false})).join('')}

function render(){
  const p=product,name=escapeHTML(p.name),imgs=gallery(p),off=discount(p),saved=favorites.has(p.id),avail=p.stock>0;
  root.innerHTML=`
  <nav class="crumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><i>›</i><a href="/#productos">Productos</a><i>›</i><span aria-current="page">${name}</span></nav>
  <div class="pdp">
    <div class="pdp-gallery${imgs.length>1?' has-thumbs':''}">
      ${imgs.length>1?`<div class="pdp-thumbs">${imgs.map((src,i)=>`<button type="button" class="pdp-thumb${i===0?' active':''}" data-pdp-thumb="${i}" aria-label="Ver imagen ${i+1}"><img src="${escapeHTML(src)}" alt=""></button>`).join('')}</div>`:''}
      <div class="pdp-stage">${off?`<span class="badge">-${off}%</span>`:p.oldPrice?'<span class="badge">Precio especial</span>':''}<img id="pdpImage" src="${escapeHTML(imgs[0]||'')}" alt="${name}"></div>
    </div>
    <div class="pdp-info">
      <div class="pdp-top"><span class="eyebrow">${escapeHTML(p.category)}${p.brand?` · ${escapeHTML(p.brand)}`:''}</span>
        <button type="button" class="pdp-fav${saved?' selected':''}" id="pdpFav" aria-pressed="${saved}" aria-label="${saved?'Quitar de':'Guardar en'} favoritos">${saved?'♥':'♡'}</button></div>
      <h1>${name}</h1>
      <div class="pdp-price"><strong>${money(p.price)}</strong>${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:''}${off?`<span class="pdp-off">${off}% OFF</span>`:''}</div>
      <p class="pdp-desc">${escapeHTML(p.description)}</p>
      <ul class="pdp-points">
        <li class="${avail?'ok':'no'}">${avail?`Disponible · ${p.stock} ${p.stock===1?'unidad':'unidades'}`:'Agotado por el momento'}</li>
        <li>Especificaciones sujetas a validación del proveedor</li>
        <li>Tarifas y cobertura de envío pendientes de configuración</li>
      </ul>
      <div class="pdp-buy">
        ${avail?`<div class="pdp-qty" role="group" aria-label="Cantidad"><button type="button" data-pdp-qty="-1" aria-label="Reducir cantidad">−</button><output id="pdpQty" aria-live="polite">1</output><button type="button" data-pdp-qty="1" aria-label="Aumentar cantidad">＋</button></div>`:''}
        <button type="button" class="btn gold" id="pdpAdd" ${avail?'':'disabled'}>${avail?'Agregar al carrito':'No disponible'} <span>→</span></button>
      </div>
      <a class="pdp-back" href="/#productos">← Seguir explorando la colección</a>
      <div class="pending-note"><b>Compra en preparación</b><br>Los métodos de pago y las tarifas de envío aún no están habilitados. El pedido no se cobrará desde este sitio.</div>
    </div>
  </div>
  <section class="pdp-related" aria-labelledby="relTitle"><div class="section-heading"><div><span class="eyebrow">SELECCIÓN LUXDROP</span><h2 id="relTitle">También te puede interesar</h2></div><a class="text-link" href="/#productos">Ver todo ↗</a></div><div class="product-grid" id="relatedGrid">${relatedHTML(p)}</div></section>`;
}

root.addEventListener('click',e=>{
  if(e.target.closest('#relatedGrid')){gridClick(e);return}
  const th=e.target.closest('[data-pdp-thumb]');
  if(th){root.querySelectorAll('.pdp-thumb').forEach(b=>b.classList.toggle('active',b===th));$('#pdpImage').src=gallery(product)[Number(th.dataset.pdpThumb)];return}
  const q=e.target.closest('[data-pdp-qty]');
  if(q){qty=Math.min(Math.max(1,qty+Number(q.dataset.pdpQty)),Math.max(1,product.stock));$('#pdpQty').textContent=qty;return}
  if(e.target.closest('#pdpFav')){toggleFavorite(product.id);return}
  if(e.target.closest('#pdpAdd'))addQty(product.id,qty);
});

function addQty(id,n){
  const p=products.find(x=>x.id===id);
  if(!p||p.stock<1){toast('Este producto está agotado por el momento.');return}
  const room=p.stock-(cart[id]||0);
  if(room<=0){toast('Ya tienes todas las unidades disponibles en tu carrito.');return}
  const added=Math.min(n,room);cart[id]=(cart[id]||0)+added;setCart();
  toast(added<n?`Añadimos ${added}: es el máximo disponible`:'Añadido a tu carrito');
}

document.addEventListener('favorites:changed',()=>{
  if(!product)return;const saved=favorites.has(product.id),b=$('#pdpFav');
  if(b){b.classList.toggle('selected',saved);b.textContent=saved?'♥':'♡';b.setAttribute('aria-pressed',saved);b.setAttribute('aria-label',`${saved?'Quitar de':'Guardar en'} favoritos`)}
  const g=$('#relatedGrid');if(g)g.innerHTML=relatedHTML(product);
});


productsReady.then(ok=>{
  if(!ok||!products.length){notFound('No pudimos cargar el producto','Comprueba la conexión con el servidor e inténtalo de nuevo.');return}
  product=products.find(p=>productSlug(p)===slug)||products.find(p=>String(p.id).toLowerCase()===slug);
  if(!product){notFound('No encontramos este producto','El enlace puede estar incompleto o el producto ya no está disponible.');return}
  if(productSlug(product)!==slug)history.replaceState(null,'',productUrl(product));
  setSeo(product);render();
});
})();
