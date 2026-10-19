// Score your platform: a self-assessment of any agent platform against the 127 services.
// Route #score. State lives in localStorage under 'cm-score'; sharing is by copied Markdown or JSON.
(function(){
  var esc=CM.esc, AREAS=CM.AREAS, SERVICES=CM.SERVICES, PLATFORMS=CM.PLATFORMS;
  var KEY='cm-score';
  var STATES=['absent','shipped','configured','observed'];
  var LABEL={absent:'Absent',shipped:'Shipped',configured:'Configured',observed:'Observed'};
  var HINT={
    absent:'Nothing on this platform delivers the service.',
    shipped:'The schema, binary, or bundled skill exists.',
    configured:'The setting or plugin is turned on.',
    observed:'Real sessions, approvals, jobs, or memories exist.'
  };
  var byId={};SERVICES.forEach(function(s){byId[s.id]=s;});

  // ---------- state ----------
  var S=null;
  function blank(){return {name:'',compare:'none',states:{}};}
  function clean(o){
    var out=blank();
    if(!o||typeof o!=='object')return out;
    if(typeof o.name==='string')out.name=o.name.slice(0,120);
    if(typeof o.compare==='string'&&(o.compare==='none'||CM.byPlat[o.compare]))out.compare=o.compare;
    var st=o.states&&typeof o.states==='object'?o.states:{};
    Object.keys(st).forEach(function(k){
      var s=byId[k]||CM.bySvc[k], v=st[k];
      if(typeof v==='number')v=STATES[v];
      if(s&&STATES.indexOf(v)>0)out.states[s.id]=v;
    });
    return out;
  }
  function load(){
    if(S)return S;
    var raw=null;
    try{raw=localStorage.getItem(KEY);}catch(e){raw=null;}
    try{S=clean(raw?JSON.parse(raw):null);}catch(e){S=blank();}
    return S;
  }
  function save(){
    try{localStorage.setItem(KEY,JSON.stringify({v:1,model:CM.DATA.version,name:S.name,compare:S.compare,states:S.states}));}catch(e){}
  }
  function stateOf(s){return S.states[s.id]||'absent';}
  function setState(s,v){if(v==='absent')delete S.states[s.id];else S.states[s.id]=v;}

  // ---------- numbers ----------
  function areaServices(a){var l=[];a.capabilities.forEach(function(c){l=l.concat(c.services);});return l;}
  function tally(){
    var t={counts:{absent:0,shipped:0,configured:0,observed:0},scored:0,scoredEvid:0,areas:[]};
    SERVICES.forEach(function(s){var v=stateOf(s);t.counts[v]++;if(v!=='absent'){t.scored++;if(s.prevalence!=='open')t.scoredEvid++;}});
    var cmp=S.compare!=='none'?CM.byPlat[S.compare]:null;
    AREAS.forEach(function(a){
      var list=areaServices(a), r={a:a,n:list.length,shipped:0,configured:0,observed:0,k:0,c:0};
      list.forEach(function(s){var v=stateOf(s);if(v!=='absent'){r[v]++;r.k++;}if(cmp&&CM.covers(s,cmp.code))r.c++;});
      t.areas.push(r);
    });
    t.cmp=cmp;
    if(cmp){
      t.mine=SERVICES.filter(function(s){return stateOf(s)!=='absent'&&!CM.covers(s,cmp.code);});
      t.theirs=SERVICES.filter(function(s){return stateOf(s)==='absent'&&CM.covers(s,cmp.code);});
      t.cmpN=CM.countFor(cmp.code);
    }
    var ranks=PLATFORMS.map(function(p){return {p:p,n:CM.countFor(p.code)};}).sort(function(x,y){return y.n-x.n;});
    t.above=ranks.filter(function(r){return r.n>t.scored;});
    t.ties=ranks.filter(function(r){return r.n===t.scored;});
    t.rank=t.above.length+1;
    t.ranks=ranks;
    return t;
  }
  function pct(n,d){return d?Math.round(100*n/d):0;}
  function ord(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
  function displayName(){return S.name.trim()||'Your platform';}

  // ---------- summary card ----------
  function summary(){
    var t=tally(), cmp=t.cmp, name=displayName();
    var stats='<div class="stats scstats">'+
      '<div class="stat"><div class="n">'+t.scored+'</div><div class="k">services above Absent</div><div class="src">of '+CM.TOTAL+' in the model</div></div>'+
      '<div class="stat"><div class="n">'+pct(t.scoredEvid,CM.EVID)+'%</div><div class="k">of the evidenced landscape</div><div class="src">'+t.scoredEvid+' of '+CM.EVID+' evidenced services</div></div>'+
      '<div class="stat"><div class="n">'+ord(t.rank)+'</div><div class="k">rank among the nine by count</div><div class="src">'+rankNote(t)+'</div></div></div>';
    var states='<div class="scstates">'+STATES.slice().reverse().map(function(k){return '<span class="scst"><span class="sw '+k+'"></span>'+LABEL[k]+' <b>'+t.counts[k]+'</b></span>';}).join('')+'</div>';
    var bars='<div class="bars">'+t.areas.map(function(r){
      var w=function(x){return (r.n?100*x/r.n:0).toFixed(2)+'%';};
      var left=0, segs=['observed','configured','shipped'].map(function(k){var h='<span class="bf sc-'+k+'" style="left:'+w(left)+';width:'+w(r[k])+'"></span>';left+=r[k];return h;}).join('');
      var mark=cmp?'<span class="scmark" style="left:'+w(r.c)+'"></span>':'';
      var d=r.k-r.c, delta=cmp?'<span class="scd '+(d>0?'up':d<0?'dn':'eq')+'">'+(d>0?'+':'')+d+'</span>':'';
      var tip='<b>'+esc(r.a.name)+'</b><br>'+r.k+' of '+r.n+' services above Absent<br>Observed '+r.observed+' · Configured '+r.configured+' · Shipped '+r.shipped+(cmp?'<br>'+esc(cmp.name)+': '+r.c:'');
      return '<div class="brow scbrow" data-tip="'+esc(tip)+'"><span class="bl"><span class="scdot" style="background:'+CM.hue(r.a)+'"></span>'+esc(r.a.name)+'</span><span class="bt">'+segs+mark+'</span><span class="bv">'+r.k+' / '+r.n+delta+'</span></div>';
    }).join('')+'</div>';
    var key='<div class="legend sclegend"><span><span class="sw sc-observed"></span>Observed</span><span><span class="sw sc-configured"></span>Configured</span><span><span class="sw sc-shipped"></span>Shipped</span>'+(cmp?'<span><span class="sw scmk"></span>'+esc(cmp.name)+' evidences</span><span class="mono">delta = yours minus '+esc(cmp.code)+'</span>':'')+'</div>';
    var lists='';
    if(cmp){
      lists='<div class="lists sclists"><div><p class="lab">'+esc(name)+' has, '+esc(cmp.name)+' lacks · '+t.mine.length+'</p>'+svcList(t.mine,'Nothing scored here is missing from '+esc(cmp.name)+'.')+'</div>'+
        '<div><p class="lab">'+esc(cmp.name)+' has, '+esc(name)+' lacks · '+t.theirs.length+'</p>'+svcList(t.theirs,'Every service '+esc(cmp.name)+' evidences is scored here.')+'</div></div>';
    }
    return '<div class="eyebrow">Coverage card'+(cmp?' · compared to '+esc(cmp.name):'')+'</div>'+
      '<h2 class="scname">'+esc(name)+'</h2>'+
      '<div class="scgrid"><div>'+stats+states+'</div><div><p class="lab">By area'+(cmp?' · delta vs '+esc(cmp.code):'')+'</p>'+bars+key+'</div></div>'+lists;
  }
  function rankNote(t){
    var parts=[];
    if(t.above.length)parts.push('behind '+t.above.map(function(r){return r.p.code;}).join(', '));
    if(t.ties.length)parts.push('tied with '+t.ties.map(function(r){return r.p.code;}).join(', '));
    if(!t.above.length&&!t.ties.length)parts.push('ahead of all nine');
    return parts.join('; ');
  }
  function svcList(list,empty){
    if(!list.length)return '<p class="empty" style="padding:8px 0">'+empty+'</p>';
    return '<ul>'+list.map(function(s){return '<li><a href="#svc-'+s.slug+'">'+esc(s.name)+'</a> <span class="h">'+esc(s.area.name)+'</span></li>';}).join('')+'</ul>';
  }

  // ---------- checklist ----------
  function seg(s){
    var v=stateOf(s), nm='sc-'+s.slug;
    return '<div class="scseg" id="'+nm+'" role="radiogroup" aria-label="'+esc(s.name)+' state">'+STATES.map(function(k,i){
      var id=nm+'-'+k;
      return '<input type="radio" name="'+nm+'" id="'+id+'" value="'+k+'" data-svc="'+s.id+'"'+(v===k?' checked':'')+'><label for="'+id+'" title="'+esc(HINT[k])+'">'+LABEL[k]+'</label>';
    }).join('')+'</div>';
  }
  function item(s){
    var v=stateOf(s);
    return '<div class="tile sctile'+(v!=='absent'?' on':'')+(s.prevalence==='open'?' open':'')+'" id="sct-'+s.slug+'" style="border-left-color:'+CM.hue(s.area)+'">'+
      '<div class="tn"><a href="#svc-'+s.slug+'">'+esc(s.name)+'</a> <span class="scid">'+s.id+'</span></div>'+
      '<div class="tm"><b>'+esc(s.pattern)+'</b> · '+esc(s.asset)+(s.prevalence==='open'?' · open':'')+'</div>'+
      '<div class="td">'+esc(s.description)+'</div>'+seg(s)+'</div>';
  }
  function areaBlock(a){
    return '<section class="asec" id="sca-'+a.id+'">'+CM.areaHead(a,true)+
      '<div class="scbulk"><label for="scb-'+a.id+'">Mark every service in '+esc(a.name)+' as</label><select id="scb-'+a.id+'">'+STATES.map(function(k){return '<option value="'+k+'">'+LABEL[k]+'</option>';}).join('')+'</select><button type="button" class="scbtn" data-bulk="'+a.id+'">Apply</button><span class="scmsg" id="scbm-'+a.id+'" role="status"></span></div>'+
      a.capabilities.map(function(c){
        return '<div class="csec"><div class="chead"><h3>'+CM.ico(c,'xs')+'<a href="#cap-'+c.key+'">'+esc(c.name)+'</a></h3><p>'+esc(c.description)+'</p></div><div class="tiles sctiles">'+c.services.map(item).join('')+'</div></div>';
      }).join('')+'</section>';
  }

  // ---------- sharing ----------
  function toJSON(){
    var st={};SERVICES.forEach(function(s){var v=stateOf(s);if(v!=='absent')st[s.id]=v;});
    return JSON.stringify({kind:'cm-score',schema:1,model:CM.DATA.name,version:CM.DATA.version,platform:S.name,compare:S.compare,states:st},null,2);
  }
  function toMarkdown(){
    var t=tally(), cmp=t.cmp, L=[];
    L.push('# '+displayName()+': AI Platform Capability Model '+CM.DATA.version+' self-assessment');
    L.push('');
    L.push('- Services above Absent: **'+t.scored+' of '+CM.TOTAL+'**');
    L.push('- Evidenced landscape: **'+pct(t.scoredEvid,CM.EVID)+'%** ('+t.scoredEvid+' of '+CM.EVID+')');
    L.push('- States: Observed '+t.counts.observed+', Configured '+t.counts.configured+', Shipped '+t.counts.shipped+', Absent '+t.counts.absent);
    L.push('- Rank among the nine by count: '+ord(t.rank)+' ('+rankNote(t)+')');
    if(cmp)L.push('- Compared to: '+cmp.name+' ('+t.cmpN+' services evidenced)');
    L.push('');
    L.push('| Area | Scored | Observed | Configured | Shipped |'+(cmp?' '+cmp.code+' | Delta |':''));
    L.push('|---|---:|---:|---:|---:|'+(cmp?'---:|---:|':''));
    t.areas.forEach(function(r){var d=r.k-r.c;L.push('| '+r.a.name+' | '+r.k+' / '+r.n+' | '+r.observed+' | '+r.configured+' | '+r.shipped+' |'+(cmp?' '+r.c+' | '+(d>0?'+':'')+d+' |':''));});
    if(cmp){
      L.push('');
      L.push('**'+displayName()+' has, '+cmp.name+' lacks ('+t.mine.length+'):** '+(t.mine.map(function(s){return s.name;}).join(', ')||'none'));
      L.push('');
      L.push('**'+cmp.name+' has, '+displayName()+' lacks ('+t.theirs.length+'):** '+(t.theirs.map(function(s){return s.name;}).join(', ')||'none'));
    }
    return L.join('\n')+'\n';
  }
  function copy(text,msgEl,label){
    var out=document.getElementById('scOutWrap'), ta=document.getElementById('scOut');
    function fallback(){
      ta.value=text;out.hidden=false;ta.focus();ta.select();
      msgEl.textContent='Clipboard blocked. The '+label+' is selected below; press Ctrl+C or Cmd+C.';
    }
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){out.hidden=true;msgEl.textContent=label.charAt(0).toUpperCase()+label.slice(1)+' copied to the clipboard.';},fallback);
      }else fallback();
    }catch(e){fallback();}
  }

  // ---------- view ----------
  function view(){
    load();
    var right='<div class="scid-form"><label class="scfield"><span>Platform name</span><input id="scName" type="text" autocomplete="off" maxlength="120" placeholder="Your platform" value="'+esc(S.name)+'"></label>'+
      '<label class="scfield"><span>Compare to</span><select id="scCmp"><option value="none">none</option>'+PLATFORMS.map(function(p){return '<option value="'+p.code+'"'+(S.compare===p.code?' selected':'')+'>'+esc(p.name)+' ('+p.code+')</option>';}).join('')+'</select></label></div>';
    return CM.header('Score your platform.','Mark each of the '+CM.TOTAL+' services as <b>Absent</b>, <b>Shipped</b> (the schema, binary, or bundled skill exists), <b>Configured</b> (the setting or plugin is on), or <b>Observed</b> (real sessions, approvals, jobs, or memories exist). The card updates as you go and is saved in this browser.',right)+
      '<div id="scRoot">'+
      '<div class="panel sccard" id="scCard" aria-live="polite">'+summary()+'</div>'+
      '<div class="scactions"><button type="button" class="scbtn" id="scCopyMd">Copy card as Markdown</button><button type="button" class="scbtn" id="scCopyJson">Copy as JSON</button><button type="button" class="scbtn" id="scImpBtn" aria-expanded="false" aria-controls="scImp">Import JSON</button>'+
      '<span class="screset"><button type="button" class="scbtn warn" id="scReset">Reset</button><span id="scResetAsk" hidden><span class="scq">Clear the name, comparison, and all '+CM.TOTAL+' scores?</span><button type="button" class="scbtn warn" id="scResetYes">Yes, reset</button><button type="button" class="scbtn" id="scResetNo">Cancel</button></span></span>'+
      '<span class="scmsg" id="scMsg" role="status"></span></div>'+
      '<div class="panel scbox" id="scOutWrap" hidden><p class="lab">Copy this text</p><textarea id="scOut" rows="10" readonly aria-label="Text to copy"></textarea></div>'+
      '<div class="panel scbox" id="scImp" hidden><p class="lab">Paste a card copied as JSON</p><textarea id="scImpText" rows="8" aria-label="JSON to import" placeholder="{&quot;kind&quot;:&quot;cm-score&quot;, ...}"></textarea><div class="scactions"><button type="button" class="scbtn" id="scImpGo">Import and replace</button><button type="button" class="scbtn" id="scImpCancel">Cancel</button><span class="scmsg" id="scImpMsg" role="status"></span></div></div>'+
      '<div class="legend sckey">'+STATES.map(function(k){return '<span><b>'+LABEL[k]+'</b> '+esc(HINT[k])+'</span>';}).join('')+'</div>'+
      '<div id="scList">'+AREAS.map(areaBlock).join('')+'</div></div>'+CM.foot();
  }

  function after(){
    load();
    var card=document.getElementById('scCard'), list=document.getElementById('scList');
    if(!card||!list)return;
    var msg=document.getElementById('scMsg');
    function refresh(){card.innerHTML=summary();}
    function syncTile(s){
      var t=document.getElementById('sct-'+s.slug);if(!t)return;
      var v=stateOf(s);t.classList.toggle('on',v!=='absent');
      var r=document.getElementById('sc-'+s.slug+'-'+v);if(r)r.checked=true;
    }
    list.addEventListener('change',function(e){
      var el=e.target;if(!el||el.type!=='radio'||!el.getAttribute('data-svc'))return;
      var s=byId[el.getAttribute('data-svc')];if(!s)return;
      setState(s,el.value);syncTile(s);save();refresh();
    });
    list.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-bulk]');if(!b)return;
      var a=CM.byArea[b.getAttribute('data-bulk')], sel=document.getElementById('scb-'+a.id), v=sel.value, l=areaServices(a);
      l.forEach(function(s){setState(s,v);syncTile(s);});save();refresh();
      document.getElementById('scbm-'+a.id).textContent=l.length+' services set to '+LABEL[v]+'.';
    });
    var nm=document.getElementById('scName');
    nm.addEventListener('input',function(){S.name=nm.value.slice(0,120);save();refresh();});
    var cs=document.getElementById('scCmp');
    cs.addEventListener('change',function(){S.compare=cs.value;save();refresh();});
    document.getElementById('scCopyMd').addEventListener('click',function(){copy(toMarkdown(),msg,'Markdown card');});
    document.getElementById('scCopyJson').addEventListener('click',function(){copy(toJSON(),msg,'JSON');});
    var imp=document.getElementById('scImp'), impBtn=document.getElementById('scImpBtn'), impTxt=document.getElementById('scImpText'), impMsg=document.getElementById('scImpMsg');
    function showImp(on){imp.hidden=!on;impBtn.setAttribute('aria-expanded',on?'true':'false');if(on)impTxt.focus();else impMsg.textContent='';}
    impBtn.addEventListener('click',function(){showImp(imp.hidden);});
    document.getElementById('scImpCancel').addEventListener('click',function(){showImp(false);impBtn.focus();});
    document.getElementById('scImpGo').addEventListener('click',function(){
      var o;
      try{o=JSON.parse(impTxt.value);}catch(e){impMsg.textContent='That is not valid JSON. Paste the whole text from Copy as JSON.';return;}
      if(!o||typeof o!=='object'||!o.states||typeof o.states!=='object'){impMsg.textContent='No scores found. The JSON needs a "states" object keyed by service id.';return;}
      var n=clean({name:o.platform!=null?String(o.platform):o.name,compare:o.compare,states:o.states});
      var count=Object.keys(n.states).length, note=o.version&&o.version!==CM.DATA.version?' It was made against model '+String(o.version)+'; ids were matched against '+CM.DATA.version+'.':'';
      S=n;save();CM.rerender();
      var m2=document.getElementById('scMsg');if(m2)m2.textContent='Imported '+count+' scored services'+(n.name?' for '+n.name:'')+'.'+note;
    });
    var rs=document.getElementById('scReset'), ask=document.getElementById('scResetAsk');
    rs.addEventListener('click',function(){rs.hidden=true;ask.hidden=false;document.getElementById('scResetNo').focus();});
    document.getElementById('scResetNo').addEventListener('click',function(){ask.hidden=true;rs.hidden=false;rs.focus();});
    document.getElementById('scResetYes').addEventListener('click',function(){
      S=blank();save();CM.rerender();
      var m2=document.getElementById('scMsg');if(m2)m2.textContent='All scores cleared.';
    });
  }

  CM.addRoute(/^score$/,view,'score',after);
  CM.addNav('Score','#score','score');
})();
