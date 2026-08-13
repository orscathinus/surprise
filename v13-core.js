'use strict';
const root=document.body.dataset.root||'';
const pageId=document.body.dataset.page||'';
const periodId=document.body.dataset.period||'';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const WIKI=file=>`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=1400`;
const vimg={
  dunk:WIKI('Dunkleosteus.jpg'),
  strom:WIKI('Stromatolites.jpg'),
  bif:WIKI('Banded Iron Formation of Hamersley Range DSCN2938.jpg'),
  kpg:WIKI('K-Pg boundary at Zumaia.jpg')
};
const newPages=[
 {title:'The Tree of Life',url:'tree-of-life.html',category:'Exhibit',tags:'tree life evolution ancestry bacteria archaea eukaryotes animals plants fungi vertebrates dinosaurs birds mammals primates humans'},
 {title:'Size Through Time',url:'size-through-time.html',category:'Exhibit',tags:'size scale organisms anomalocaris dunkleosteus arthropleura tyrannosaurus argentinosaurus megalodon mammoth blue whale human'},
 {title:'One Place Through Time',url:'one-place.html',category:'Exhibit',tags:'New York City NYC geology location ocean pangaea dinosaurs glaciers city deep time'},
 {title:'Geological Cross-Section',url:'cross-section.html',category:'Exhibit',tags:'rocks layers stratigraphy drill geology fossils cross section navigation'}
];
if(typeof PAGES!=='undefined') for(const p of newPages) if(!PAGES.some(x=>x.url===p.url)) PAGES.push(p);
if(typeof EXHIBITS!=='undefined'){
 const add=[
  {slug:'tree-of-life',title:'The Tree of Life',sub:'Follow ancestry backward',desc:'Explore major evolutionary branches and illuminate the ancestor path to humans, birds and whales.'},
  {slug:'size-through-time',title:'Size Through Time',sub:'Put bodies on one scale',desc:'Compare deep-time organisms side by side with lengths, mass estimates, roles and uncertainty.'},
  {slug:'one-place',title:'One Place Through Time',sub:'Stand still for 500 million years',desc:'Watch the ground beneath New York City shift through oceans, mountain building, ice and the modern metropolis.'},
  {slug:'cross-section',title:'Geological Cross-Section',sub:'Drill downward',desc:'Navigate Earth history through a stacked rock column with environments, fossils and evidence.'}
 ]; for(const e of add) if(!EXHIBITS.some(x=>x.slug===e.slug)) EXHIBITS.push(e);
}

function h(tag,attrs={},html=''){const el=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')el.className=v;else if(k.startsWith('data-'))el.setAttribute(k,v);else el[k]=v}el.innerHTML=html;return el}
function setVersion(){
 document.title=document.title.replace(/1\.2/g,'1.3');
 qa('.brand').forEach(b=>{const s=b.querySelector('span:last-child');if(s)s.innerHTML='DEEP TIME <b>1.3</b>'});
 qa('.footer').forEach(f=>f.innerHTML=f.innerHTML.replace(/1\.2/g,'1.3'));
 qa('.eyebrow span').forEach(s=>{if(s.textContent.includes('UPDATE 1.2'))s.textContent='UPDATE 1.3'});
}
function addNavigator(){
 if(q('.museum-nav-btn'))return;
 const btn=h('button',{class:'museum-nav-btn',type:'button','aria-expanded':'false'},'Museum navigator ✦');
 const panel=h('nav',{class:'museum-nav-panel','aria-label':'Museum navigator'},
  `<a href="${root}timeline.html"><b>TIME</b><br><small>Timeline + periods</small></a>
   <a href="${root}tree-of-life.html"><b>LIFE</b><br><small>Tree + living worlds</small></a>
   <a href="${root}paleogeography.html"><b>EARTH</b><br><small>Atlas + atmosphere</small></a>
   <a href="${root}evidence.html"><b>EVIDENCE</b><br><small>Scientific detective lab</small></a>
   <a href="${root}collection.html"><b>COLLECTION</b><br><small>Specimens + fossils</small></a>
   <a href="${root}pages.html"><b>ALL ROOMS</b><br><small>Master directory</small></a>`);
 document.body.append(panel,btn);btn.onclick=()=>{const open=panel.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.classList.remove('open');btn.setAttribute('aria-expanded','false')}})
}
function addBreadcrumb(){
 const main=q('main');if(!main||q('.v13-breadcrumb'))return;
 let text='EXHIBITS'; let trail='';
 if(periodId){const p=PERIODS[periodId];text=`PERIODS → ${p.era.toUpperCase()}`;trail=p.name.toUpperCase()}
 else if(pageId==='home'){text='ENTRANCE';trail='UPDATE 1.3'}
 else if(pageId==='periods'){text='PERIODS';trail='ALL GALLERIES'}
 else if(pageId==='pages'){text='DIRECTORY';trail='ALL PAGES'}
 else {const item=PAGES.find(x=>x.url.endsWith(location.pathname.split('/').pop()));trail=(item?.title||pageId).toUpperCase()}
 const bc=h('div',{class:'v13-breadcrumb'},`<a href="${root}index.html">DEEP TIME</a> → ${text}${trail?` → <span>${trail}</span>`:''}`);main.prepend(bc)
}
function confidenceRow(kind='supported'){return `<div class="museum-label-row"><span class="museum-label high">High confidence: interval dates</span><span class="museum-label ${kind}">${kind==='debate'?'Active debate':'Supported interpretation'}: reconstruction details</span></div>`}

const randomMoments=[
 ['3.48 billion years ago','Archean','A microbial coast under a fainter Sun','Small protocontinents, broad oceans, no animals or plants, and microbial mats reshaping sediments.','periods/archean.html'],
 ['445 million years ago','Ordovician','A cooling marine world','Rich marine communities persist as glaciation expands and sea level falls toward a major extinction.','periods/ordovician.html'],
 ['315 million years ago','Carboniferous','Coal-swamp afternoon','Humid equatorial wetlands, high oxygen relative to today, giant arthropods and abundant amphibians.','periods/carboniferous.html'],
 ['252 million years ago','Permian','The biosphere in crisis','Siberian Traps volcanism, extreme warming and ocean stress coincide with the largest Phanerozoic extinction.','periods/permian.html'],
 ['150 million years ago','Jurassic','A giant-bodied landscape','Sauropods, theropods, pterosaurs and early birds share warm ecosystems while Pangaea continues to break apart.','periods/jurassic.html'],
 ['20,000 years ago','Quaternary','Ice near its recent maximum','Huge ice sheets cover much of northern North America and sea level is far below modern.','periods/quaternary.html']
];
function upgradeHome(){
 const hero=q('.hero');if(!hero)return;
 const lede=q('.hero .lede');if(lede)lede.textContent='Walk into Earth history as a connected museum complex: different rooms behave differently, scientific evidence stays visible, and every interaction is another way to understand a changing planet.';
 const marquee=q('.marquee');
 const portals=`<section class="page-shell section"><div class="section-head"><div><div class="kicker">CHOOSE YOUR ENTRANCE</div><h2>Five doors into<br><em>the same planet.</em></h2></div><p>Update 1.3 connects the museum around five ways of thinking: chronology, ancestry, Earth systems, evidence and physical objects.</p></div><div class="v13-home-portals">
  <a class="v13-portal" style="--portal:#ffbd63" href="timeline.html"><small>ENTER THROUGH TIME</small><h3>4.54 billion years</h3><p>Scrub the timeline, filter events and walk into a period.</p></a>
  <a class="v13-portal" style="--portal:#8cffb6" href="tree-of-life.html"><small>ENTER THROUGH LIFE</small><h3>Branching ancestry</h3><p>Follow lineages backward through the Tree of Life.</p></a>
  <a class="v13-portal" style="--portal:#6be8ff" href="paleogeography.html"><small>ENTER THROUGH EARTH</small><h3>Moving continents</h3><p>Atlas views, atmosphere and changing geography.</p></a>
  <a class="v13-portal" style="--portal:#a98cff" href="evidence.html"><small>ENTER THROUGH EVIDENCE</small><h3>Read the archive</h3><p>Dating, strata, isotopes, fossils and magnetic signatures.</p></a>
  <a class="v13-portal" style="--portal:#ff7f95" href="collection.html"><small>ENTER THROUGH OBJECTS</small><h3>Open the cabinet</h3><p>Inspect fossils, rocks, traces and climate archives.</p></a>
 </div></section>`;
 if(marquee)marquee.insertAdjacentHTML('afterend',portals);
 const section=q('main .section:last-of-type');
 if(section)section.insertAdjacentHTML('beforebegin',`<section class="page-shell section"><div class="v13-feature"><div><div class="kicker">TONIGHT IN DEEP TIME</div><strong>252 Ma.<br><em style="font-family:Georgia,serif;color:var(--accent);font-weight:400">The world overheats.</em></strong><p class="lede" style="font-size:15px">At the end of the Permian, volcanism, greenhouse warming and ocean stress converge on the most severe known Phanerozoic mass extinction.</p><a class="primary-btn" href="periods/permian.html">Enter the crisis →</a></div><div class="moment-panel"><div class="kicker">RANDOM MOMENT</div><h3 style="font-size:34px">Open a window anywhere in Earth history.</h3><button class="ghost-btn" id="randomMomentBtn">Generate moment ✦</button><div class="random-readout" id="randomMomentReadout"><small>Press the control to begin.</small></div></div></div></section>`);
 const rm=q('#randomMomentBtn');if(rm)rm.onclick=()=>{const d=randomMoments[Math.floor(Math.random()*randomMoments.length)],box=q('#randomMomentReadout');box.innerHTML=`<b>${d[0]} · ${d[1]}</b><h3>${d[2]}</h3><p>${d[3]}</p><a class="ghost-btn" href="${d[4]}">Explore this world →</a>`};
 const grid=q('.card-grid');if(grid){for(const e of EXHIBITS.slice(-4))if(!grid.querySelector(`[href$="${e.slug}.html"]`))grid.insertAdjacentHTML('beforeend',`<a class="museum-card" href="${e.slug}.html"><span class="num">NEW / 1.3</span><span class="go">↗</span><h3>${e.title}</h3><p>${e.desc}</p></a>`)}
 const stats=qa('.hero-stats b');if(stats.length>=4){stats[0].textContent='32';stats[2].textContent='14';stats[3].textContent='23'}
}

