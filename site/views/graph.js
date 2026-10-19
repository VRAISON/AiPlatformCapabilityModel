// Service dependency graph: #graph and #graph-<slug>. Positions come from views/graph-data.js (GRAPH), computed
// offline by graph-layout.js, so the page does no physics. Pan by drag, zoom by wheel/pinch/buttons, hover or
// click a node to highlight its neighbourhood and open the side panel.
(function(){
  if(typeof GRAPH==='undefined')return;
  var esc=CM.esc, NS='http://www.w3.org/2000/svg';
  var W=GRAPH.w, H=GRAPH.h, LABEL_ZOOM=1.8;
  var NODES=GRAPH.nodes, EDGES=GRAPH.edges, bySlug={};
  NODES.forEach(function(n,i){n.i=i;n.deg=n.inDeg+n.outDeg;n.ins=[];n.outs=[];bySlug[n.slug]=n;});
  EDGES.forEach(function(e,i){e.i=i;e.a=bySlug[e.from];e.b=bySlug[e.to];e.a.outs.push(e);e.b.ins.push(e);});
  var SVC=NODES.filter(function(n){return n.kind==='service';});
  var dmin=Math.min.apply(null,SVC.map(function(n){return n.deg;})), dmax=Math.max.apply(null,SVC.map(function(n){return n.deg;}));
  function rad(n){return n.kind==='actor'?8:6+16*Math.sqrt((n.deg-dmin)/Math.max(1,dmax-dmin));}
  NODES.forEach(function(n){n.r=rad(n);});
  var MECHS={};EDGES.forEach(function(e){e.mechs.forEach(function(m){MECHS[m]=(MECHS[m]||0)+1;});});
  var MECH_LIST=Object.keys(MECHS).sort(function(a,b){return MECHS[b]-MECHS[a]||(a<b?-1:1);});
  var TOP_IN=SVC.slice().sort(function(a,b){return b.inDeg-a.inDeg||(a.id<b.id?-1:1);}).slice(0,5);
  function areaOf(n){return CM.byArea[n.area];}
  function fillOf(n){return n.kind==='actor'?'var(--surface)':CM.hue(areaOf(n));}

  // State survives re-renders (theme toggle) so the view does not reset under the reader.
  var S={areasOff:{},actors:true,open:true,mech:'',sel:null,hover:null,k:1,tx:0,ty:0,route:null};

  function view(focus){
    var right='';
    var stats='<div class="gv-stats" id="gv-stats"><span><b>'+NODES.length+'</b> nodes <small>('+SVC.length+' services · '+(NODES.length-SVC.length)+' actors)</small></span><span><b>'+EDGES.length+'</b> edges</span>'+
      '<span class="gv-hubs">most depended on: '+TOP_IN.map(function(n){return '<a href="#graph-'+n.slug+'">'+esc(n.name)+' <small>'+n.inDeg+'</small></a>';}).join('')+'</span></div>';
    var chips='<div class="gv-filters" id="gv-filters"><div class="gv-chiprow" role="group" aria-label="Capability areas">'+CM.AREAS.map(function(a){
      return '<button type="button" class="gv-chip" id="gv-area-'+a.id+'" data-area="'+a.id+'" aria-pressed="'+(!S.areasOff[a.id])+'"><span class="gv-sw" style="background:'+CM.hue(a)+'"></span>'+esc(a.name)+'</button>';}).join('')+'</div>'+
      '<div class="gv-chiprow"><button type="button" class="gv-chip" id="gv-actors" aria-pressed="'+S.actors+'"><span class="gv-sw gv-sw-actor"></span>Actors</button>'+
      '<button type="button" class="gv-chip" id="gv-open" aria-pressed="'+S.open+'"><span class="gv-sw gv-sw-open"></span>Open services</button>'+
      '<label class="gv-mech" for="gv-mech">mechanism <select id="gv-mech"><option value="">all</option>'+MECH_LIST.map(function(m){return '<option value="'+esc(m)+'"'+(S.mech===m?' selected':'')+'>'+esc(m)+' ('+MECHS[m]+')</option>';}).join('')+'</select></label></div></div>';
    var lede='Every service\'s interface tables name the services it calls and is called by. Drawn together they form a directed graph of <b>'+EDGES.length+'</b> dependencies; circle size is total degree, colour is capability area, hollow squares are external actors.';
    return CM.crumbs([{text:'Model',href:'#explorer'},{text:'Graph'}].concat(focus?[{text:focus.name}]:[]))+
      CM.header('Service dependency graph',lede,right)+stats+chips+
      '<div class="gv-grid"><div class="gv-card"><div class="gv-stage" id="gv-stage">'+svg()+
      '<div class="gv-zoom"><button type="button" id="gv-zin" aria-label="Zoom in">+</button><button type="button" id="gv-zout" aria-label="Zoom out">&minus;</button><button type="button" id="gv-reset" aria-label="Reset view">fit</button></div></div>'+
      '<p class="gv-hint">Drag to pan · wheel or +/&minus; to zoom · hover or click a node · Tab to reach nodes, Enter to select, Esc to clear</p></div>'+
      '<aside class="gv-panel" id="gv-panel" aria-live="polite"></aside></div>'+CM.foot();
  }

  function trimmed(e){
    var a=e.a,b=e.b,dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/d,uy=dy/d;
    return [a.x+ux*(a.r+1),a.y+uy*(a.r+1),b.x-ux*(b.r+3),b.y-uy*(b.r+3)];
  }
  function f1(v){return Math.round(v*10)/10;}
  function labelAttrs(n){
    var off=n.r+(n.kind==='actor'?5:4);
    if(n.lp==='r')return 'x="'+f1(n.x+off)+'" y="'+f1(n.y)+'" dy=".35em" text-anchor="start"';
    if(n.lp==='l')return 'x="'+f1(n.x-off)+'" y="'+f1(n.y)+'" dy=".35em" text-anchor="end"';
    if(n.lp==='t')return 'x="'+f1(n.x)+'" y="'+f1(n.y-off)+'" dy="-.25em" text-anchor="middle"';
    return 'x="'+f1(n.x)+'" y="'+f1(n.y+off)+'" dy=".95em" text-anchor="middle"';
  }
  function baseCls(n){return 'gv-n'+(n.kind==='actor'?' gv-actor':'')+(n.prevalence==='open'?' gv-openn':'')+(n.hub?' gv-hub':'');}
  function svg(){
    var h='<svg class="gv-svg" id="gv-svg" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Service dependency graph">'+
      '<defs><marker id="gv-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" style="fill:var(--axis)"/></marker>'+
      '<marker id="gv-arr-hl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" style="fill:var(--muted)"/></marker>'+
      '<marker id="gv-arr-mx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" style="fill:var(--accent)"/></marker></defs>'+
      '<rect class="gv-bg" x="-10000" y="-10000" width="20000" height="20000"/><g id="gv-view"><g id="gv-edges" class="gv-edges">';
    EDGES.forEach(function(e){var t=trimmed(e);h+='<line data-e="'+e.i+'" x1="'+f1(t[0])+'" y1="'+f1(t[1])+'" x2="'+f1(t[2])+'" y2="'+f1(t[3])+'"/>';});
    h+='</g><g id="gv-nodes">';
    NODES.forEach(function(n){
      var lab=esc(n.name)+(n.kind==='actor'?', external actor':', '+n.id)+', '+n.inDeg+' inbound, '+n.outDeg+' outbound';
      var cls=baseCls(n);
      h+='<g class="'+cls+'" data-n="'+n.i+'" tabindex="0" role="button" aria-label="'+lab+'">';
      if(n.kind==='actor')h+='<rect x="'+f1(n.x-n.r)+'" y="'+f1(n.y-n.r)+'" width="'+f1(2*n.r)+'" height="'+f1(2*n.r)+'" rx="2"/>';
      else h+='<circle cx="'+n.x+'" cy="'+n.y+'" r="'+f1(n.r)+'" style="fill:'+fillOf(n)+(n.prevalence==='open'?';stroke:'+fillOf(n):'')+'"/>';
      h+='</g>';
    });
    h+='</g><g id="gv-labels" class="gv-labels">';
    NODES.forEach(function(n){h+='<text data-l="'+n.i+'" class="gv-l'+(n.hub||n.kind==='actor'?' gv-always':'')+(n.hub?' gv-lhub':'')+'" '+labelAttrs(n)+'>'+esc(n.name)+'</text>';});
    return h+'</g></g></svg>';
  }

  // ---------- panel ----------
  function nodeLink(n){return n.kind==='service'?'<a href="#svc-'+n.slug+'">'+esc(n.name)+'</a>':'<span class="gv-actorname">'+esc(n.name)+'</span>';}
  function relList(list,end){
    if(!list.length)return '<p class="gv-none">none</p>';
    return '<ul class="gv-rel">'+list.slice().sort(function(x,y){return x[end].name<y[end].name?-1:1;}).map(function(e){var o=e[end];
      return '<li><span class="gv-dot'+(o.kind==='actor'?' gv-dot-actor':'')+'" style="background:'+(o.kind==='actor'?'transparent':CM.hue(areaOf(o)))+'"></span>'+nodeLink(o)+
        ' <button type="button" class="gv-go" data-go="'+o.i+'" aria-label="Select '+esc(o.name)+' in graph" title="Select in graph">&#9678;</button><small>'+esc(e.mechs.join(', '))+'</small></li>';}).join('')+'</ul>';
  }
  function panel(){
    var p=document.getElementById('gv-panel');if(!p)return;
    var n=S.hover!=null?NODES[S.hover]:S.sel!=null?NODES[S.sel]:null;
    if(!n){
      p.innerHTML='<div class="lab">Legend</div><ul class="gv-legend">'+
        '<li><svg width="34" height="20" aria-hidden="true"><circle cx="8" cy="10" r="5" style="fill:var(--a1)"/><circle cx="24" cy="10" r="9" style="fill:var(--a1)"/></svg>service, sized by in + out degree</li>'+
        '<li><svg width="34" height="20" aria-hidden="true"><circle cx="17" cy="10" r="7" class="gv-legend-open"/></svg>open service (no platform evidence yet)</li>'+
        '<li><svg width="34" height="20" aria-hidden="true"><rect x="10" y="3" width="14" height="14" rx="2" class="gv-legend-actor"/></svg>external actor</li>'+
        '<li><svg width="34" height="20" aria-hidden="true"><line x1="2" y1="10" x2="30" y2="10" class="gv-legend-edge" marker-end="url(#gv-arr-hl)"/></svg>dependency: caller &rarr; callee</li></ul>'+
        '<p class="gv-help">Hover or select a node to see what it depends on and what depends on it. Each list item links to the service page; &#9678; selects it here.</p>';
      return;
    }
    var a=areaOf(n), head;
    if(n.kind==='actor')head='<div class="gv-pid">external actor</div><h2>'+esc(n.name)+'</h2><p class="gv-pdesc">Outside the platform; appears as a source or target in service interfaces.</p>';
    else{var s=CM.bySvc[n.slug];
      head='<div class="gv-pid"><span class="gv-sw" style="background:'+CM.hue(a)+'"></span>'+esc(n.id)+' · '+esc(a.name)+(n.prevalence==='open'?' · open':'')+'</div><h2><a href="#svc-'+n.slug+'">'+esc(n.name)+'</a></h2>'+
        '<div class="gv-pmeta"><b>'+esc(s.pattern)+'</b> · '+esc(s.asset)+'</div><p class="gv-pdesc">'+esc(s.description)+'</p>';}
    p.innerHTML=head+'<div class="gv-deg"><span><b>'+n.inDeg+'</b> in</span><span><b>'+n.outDeg+'</b> out</span>'+
      '<a class="gv-focus" id="gv-focus" href="#graph-'+n.slug+'">Focus</a>'+(S.sel!=null?'<button type="button" class="gv-clear" id="gv-clear">Clear</button>':'')+'</div>'+
      '<div class="lab">Inbound · depended on by</div>'+relList(n.ins,'a')+'<div class="lab">Outbound · depends on</div>'+relList(n.outs,'b');
  }

  // ---------- highlighting and filters ----------
  function visible(n){
    if(n.kind==='actor')return S.actors;
    if(S.areasOff[n.area])return false;
    if(n.prevalence==='open'&&!S.open)return false;
    return true;
  }
  function apply(){
    var svgEl=document.getElementById('gv-svg');if(!svgEl)return;
    var act=S.hover!=null?S.hover:S.sel, nb={};
    if(act!=null){nb[act]=1;NODES[act].ins.forEach(function(e){nb[e.a.i]=1;});NODES[act].outs.forEach(function(e){nb[e.b.i]=1;});}
    var mxN={};
    var lines=document.getElementById('gv-edges').children;
    EDGES.forEach(function(e){
      var el=lines[e.i], vis=visible(e.a)&&visible(e.b), mx=S.mech&&e.mechs.indexOf(S.mech)>=0, hl=act!=null&&(e.a.i===act||e.b.i===act);
      el.setAttribute('class',(vis?'':'gv-off ')+(hl?'gv-hl ':'')+(mx?'gv-mx ':'')+((act!=null&&!hl)||(S.mech&&!mx)?'gv-dim':''));
      el.setAttribute('marker-end','url(#'+(hl?'gv-arr-hl':mx?'gv-arr-mx':'gv-arr')+')');
      if(mx&&vis){mxN[e.a.i]=1;mxN[e.b.i]=1;}
    });
    var gs=document.getElementById('gv-nodes').children, ls=document.getElementById('gv-labels').children;
    NODES.forEach(function(n){
      var vis=visible(n), dim=(act!=null&&!nb[n.i])||(S.mech&&!mxN[n.i]&&!(act!=null&&nb[n.i]));
      var c=(vis?'':' gv-off')+(dim?' gv-dim':'')+(n.i===act?' gv-act':'')+(act!=null&&nb[n.i]&&n.i!==act?' gv-nb':'')+(n.i===S.sel?' gv-sel':'');
      gs[n.i].setAttribute('class',baseCls(n)+c);
      var lc='gv-l'+(n.hub||n.kind==='actor'?' gv-always':'')+(n.hub?' gv-lhub':'')+(vis?'':' gv-off')+(dim?' gv-dim':'')+(act!=null&&nb[n.i]?' gv-show':'')+(n.i===act?' gv-lact':'');
      ls[n.i].setAttribute('class',lc);
      if(n.kind==='service'&&!vis&&n.i===S.sel)S.sel=null;
    });
    svgEl.classList.toggle('gv-has-act',act!=null);
    panel();
  }

  // ---------- pan and zoom ----------
  function setT(){
    var g=document.getElementById('gv-view');if(!g)return;
    g.setAttribute('transform','translate('+f1(S.tx)+' '+f1(S.ty)+') scale('+Math.round(S.k*1000)/1000+')');
    var s=document.getElementById('gv-svg');
    s.classList.toggle('gv-zoomed',S.k>=LABEL_ZOOM);
    document.getElementById('gv-edges').setAttribute('stroke-width',f1(1/Math.pow(S.k,.7)*10)/10);
    document.getElementById('gv-labels').setAttribute('font-size',f1(15/Math.pow(S.k,.8)));
  }
  function zoomAt(f,px,py){
    var k=Math.max(.6,Math.min(8,S.k*f));f=k/S.k;
    S.tx=px-(px-S.tx)*f;S.ty=py-(py-S.ty)*f;S.k=k;setT();
  }
  function toSvg(svgEl,cx,cy){var m=svgEl.getScreenCTM();if(!m)return {x:W/2,y:H/2};var p=svgEl.createSVGPoint();p.x=cx;p.y=cy;p=p.matrixTransform(m.inverse());return {x:p.x,y:p.y};}
  function center(n,k){S.k=k||Math.max(S.k,2.2);S.tx=W/2-n.x*S.k;S.ty=H/2-n.y*S.k;setT();}
  function reset(){S.k=1;S.tx=0;S.ty=0;setT();}

  function select(i){S.sel=i;S.hover=null;apply();}

  function wire(m){
    var svgEl=document.getElementById('gv-svg'), stage=document.getElementById('gv-stage');
    var hash=location.hash;
    if(S.route!==hash){S.route=hash;S.k=1;S.tx=0;S.ty=0;S.hover=null;S.sel=null;
      if(m&&m[1]&&bySlug[m[1]]){var n=bySlug[m[1]];if(n.kind==='actor')S.actors=true;else{delete S.areasOff[n.area];if(n.prevalence==='open')S.open=true;}S.sel=n.i;center(n,2.4);}}
    setT();apply();
    // filters
    document.querySelectorAll('#gv-filters [data-area]').forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-area');if(S.areasOff[id])delete S.areasOff[id];else S.areasOff[id]=1;b.setAttribute('aria-pressed',String(!S.areasOff[id]));apply();});});
    var ba=document.getElementById('gv-actors'),bo=document.getElementById('gv-open'),ms=document.getElementById('gv-mech');
    ba.addEventListener('click',function(){S.actors=!S.actors;ba.setAttribute('aria-pressed',String(S.actors));if(!S.actors&&S.sel!=null&&NODES[S.sel].kind==='actor')S.sel=null;apply();});
    bo.addEventListener('click',function(){S.open=!S.open;bo.setAttribute('aria-pressed',String(S.open));apply();});
    ms.addEventListener('change',function(){S.mech=ms.value;apply();});
    // zoom buttons
    document.getElementById('gv-zin').addEventListener('click',function(){zoomAt(1.4,W/2,H/2);});
    document.getElementById('gv-zout').addEventListener('click',function(){zoomAt(1/1.4,W/2,H/2);});
    document.getElementById('gv-reset').addEventListener('click',reset);
    svgEl.addEventListener('wheel',function(e){e.preventDefault();var p=toSvg(svgEl,e.clientX,e.clientY);zoomAt(Math.pow(1.0018,-e.deltaY*(e.deltaMode===1?16:1)),p.x,p.y);},{passive:false});
    // pointer: drag pans, a tap without movement selects or clears; two pointers pinch
    var pts={}, drag=null, pinch=null;
    svgEl.addEventListener('pointerdown',function(e){
      if(e.button!==undefined&&e.button>0)return;
      pts[e.pointerId]={x:e.clientX,y:e.clientY};
      var ids=Object.keys(pts);
      if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,k:S.k};drag=null;return;}
      var g=e.target.closest('[data-n]');
      drag={x:e.clientX,y:e.clientY,tx:S.tx,ty:S.ty,moved:false,node:g?+g.getAttribute('data-n'):null,id:e.pointerId};
    });
    svgEl.addEventListener('pointermove',function(e){
      if(pts[e.pointerId])pts[e.pointerId]={x:e.clientX,y:e.clientY};
      if(pinch){var ids=Object.keys(pts);if(ids.length<2)return;var a=pts[ids[0]],b=pts[ids[1]];var mid=toSvg(svgEl,(a.x+b.x)/2,(a.y+b.y)/2);zoomAt(pinch.k*(Math.hypot(a.x-b.x,a.y-b.y)/pinch.d)/S.k,mid.x,mid.y);return;}
      if(!drag||drag.id!==e.pointerId)return;
      var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved&&Math.abs(dx)+Math.abs(dy)>4){drag.moved=true;stage.classList.add('gv-dragging');try{svgEl.setPointerCapture(e.pointerId);}catch(_){}}
      if(drag.moved){var m=svgEl.getScreenCTM(),sc=m?m.a:1;S.tx=drag.tx+dx/sc;S.ty=drag.ty+dy/sc;setT();}
    });
    function up(e){
      delete pts[e.pointerId];
      if(pinch){if(Object.keys(pts).length<2)pinch=null;drag=null;return;}
      if(!drag||drag.id!==e.pointerId)return;
      if(!drag.moved&&e.type==='pointerup'){if(drag.node!=null)select(drag.node);else if(S.sel!=null)select(null);}
      drag=null;stage.classList.remove('gv-dragging');
    }
    svgEl.addEventListener('pointerup',up);svgEl.addEventListener('pointercancel',up);
    // hover
    svgEl.addEventListener('pointerover',function(e){if(drag&&drag.moved)return;if(e.pointerType==='touch')return;var g=e.target.closest('[data-n]');if(g){S.hover=+g.getAttribute('data-n');apply();}});
    svgEl.addEventListener('pointerout',function(e){var g=e.target.closest('[data-n]');if(g&&S.hover!=null&&!(e.relatedTarget&&g.contains(e.relatedTarget))){S.hover=null;apply();}});
    // keyboard
    svgEl.addEventListener('keydown',function(e){
      var g=e.target.closest('[data-n]');
      if(e.key==='Escape'){select(null);return;}
      if(!g)return;
      if(e.key==='Enter'||e.key===' '){e.preventDefault();var i=+g.getAttribute('data-n');select(S.sel===i?null:i);}
    });
    svgEl.addEventListener('focusin',function(e){var g=e.target.closest('[data-n]');if(g){S.hover=+g.getAttribute('data-n');apply();}});
    svgEl.addEventListener('focusout',function(){if(S.hover!=null){S.hover=null;apply();}});
    // panel: select-in-graph buttons and clear
    document.getElementById('gv-panel').addEventListener('click',function(e){
      var b=e.target.closest('[data-go]');
      if(b){var i=+b.getAttribute('data-go'),n=NODES[i];if(!visible(n)){if(n.kind==='actor'){S.actors=true;ba.setAttribute('aria-pressed','true');}else{delete S.areasOff[n.area];var c=document.getElementById('gv-area-'+n.area);if(c)c.setAttribute('aria-pressed','true');if(n.prevalence==='open'){S.open=true;bo.setAttribute('aria-pressed','true');}}}select(i);if(S.k>1.2)center(n,S.k);return;}
      if(e.target.id==='gv-clear')select(null);
    });
  }

  CM.addRoute(/^graph$/,function(){return view(null);},'graph',function(m){wire(m);});
  CM.addRoute(/^graph-(.+)$/,function(m){return view(bySlug[m[1]]||null);},'graph',function(m){wire(m);});
  CM.addNav('Graph','#graph','graph');
})();
