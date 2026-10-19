// Data view (#data): the open-data release. Explains ids, license, and citation, lists the files
// written by site/export.js, and copies the model JSON or services CSV built in the browser from CM.DATA.
(function(){
  var D=CM.DATA, esc=CM.esc;
  var PATTERNS=['Direct','Manage','Administer','Design','Provision','Fulfill','Operate','Maintain','Track','Monitor','Analyze','Register','Agree','Assess','Allocate','Process'];

  function eachService(fn){D.areas.forEach(function(a){a.capabilities.forEach(function(c){c.services.forEach(function(s){fn(a,c,s);});});});}
  function put(o,k,v){if(v!==undefined&&v!==null&&v!=='')o[k]=v;}

  // Same shape and key order as data/model.json, built from explicit fields so runtime links (area, cap, key) and presentation fields (icon, hue) are left out.
  function modelJson(){
    var m={$schema:'./model.schema.json',name:D.name,version:D.version,generated:D.generated,license:D.license,actors:D.actors.slice(),
      platforms:D.platforms.map(function(p){return {code:p.code,name:p.name,kind:p.kind,vendor:p.vendor,home:p.home,version:p.version,auth:p.auth,model:p.model,note:p.note};}),
      areas:D.areas.map(function(a){
        var ao={id:a.id,name:a.name,slug:a.slug,description:a.description};put(ao,'scope',a.scope);
        ao.capabilities=a.capabilities.map(function(c){
          var co={id:c.id,name:c.name,slug:c.slug,description:c.description};put(co,'scope',c.scope);put(co,'owner',c.owner);
          co.services=c.services.map(function(s){var p=s.profile;return {id:s.id,name:s.name,slug:s.slug,pattern:s.pattern,asset:s.asset,prevalence:s.prevalence,evidence:s.evidence,description:s.description,platforms:s.platforms.slice(),
            profile:{inside:p.inside,excludes:p.excludes,purpose:p.purpose,functions:p.functions,entities:p.entities,inbound:p.inbound,outbound:p.outbound,security:p.security,storage:p.storage,performance:p.performance}};});
          return co;});
        return ao;})};
    return JSON.stringify(m,null,2)+'\n';
  }
  function cell(v){v=v===undefined||v===null?'':String(v);return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
  function servicesCsv(){
    var rows=[['id','area_id','area','capability_id','capability','service','slug','pattern','asset','prevalence','platform_count','platforms','description','evidence']];
    eachService(function(a,c,s){rows.push([s.id,a.id,a.name,c.id,c.name,s.name,s.slug,s.pattern,s.asset,s.prevalence,s.platforms.length,s.platforms.join(' '),s.description,s.evidence]);});
    return rows.map(function(r){return r.map(cell).join(',');}).join('\r\n')+'\r\n';
  }

  var FILES=[
    ['model.json','The full model: areas, capabilities, services with five-section profiles, platforms, and actors.'],
    ['model.yaml','The same model as YAML, with interface rows written as one-line lists.'],
    ['model.schema.json','JSON Schema (draft 2020-12) for model.json, with enums for pattern, prevalence, and platform kind.'],
    ['services.csv','One row per service: ids, area, capability, pattern, asset, prevalence, platforms, description, evidence.'],
    ['coverage.csv','A service by platform matrix of 1 and 0, one column per platform code, with a total.'],
    ['README.md','What each file is, the id scheme, the evidence standard and its limits, and how to regenerate.']
  ];

  function view(){
    var a=D.areas[0], c=a.capabilities[0], s=c.services[2]||c.services[0];
    var nCap=0,nSvc=0;D.areas.forEach(function(x){nCap+=x.capabilities.length;x.capabilities.forEach(function(y){nSvc+=y.services.length;});});
    var cite='Corcoran, P. (2026). AI Platform Capability Model (Version '+D.version+') [Data set]. Released '+D.generated+'. '+D.license+'.';
    return CM.header('Open data.','The model is released as data under <b>'+esc(D.license)+'</b>: '+D.areas.length+' capability areas, '+nCap+' capabilities, and '+nSvc+' services, each with its profile and the platforms that exhibit it. Copy it from here, or run <span class="mono">node site/export.js</span> to write the files.')+
      '<div class="dv">'+
      '<section class="dv-card dv-wide"><h2>Copy the data</h2><p>The text is built in your browser from the model this page was generated from. It matches <span class="mono">data/model.json</span> and <span class="mono">data/services.csv</span>.</p>'+
        '<div class="dv-actions"><button type="button" class="dv-btn" data-copy="json">Copy model JSON</button><button type="button" class="dv-btn" data-copy="csv">Copy services CSV</button><span class="dv-status" id="dvStatus" role="status" aria-live="polite"></span></div>'+
        '<div id="dvFallback" hidden><p class="dv-note">The clipboard is not available here. The text is selected below; copy it with your keyboard.</p><textarea id="dvText" class="dv-text" readonly spellcheck="false" aria-label="Data to copy"></textarea></div></section>'+
      '<section class="dv-card"><h2>Identifiers</h2><p>Ids are position-based. A renamed item keeps its id. A moved or inserted item changes the ids after it, so new services go at the end of their capability.</p>'+
        '<div class="dv-tw"><table class="dv-t"><thead><tr><th>Tier</th><th>Id</th><th>Example</th></tr></thead><tbody>'+
        '<tr><td>Capability Area</td><td class="mono">'+esc(a.id)+'</td><td>'+esc(a.name)+'</td></tr>'+
        '<tr><td>Capability</td><td class="mono">'+esc(c.id)+'</td><td>'+esc(c.name)+'</td></tr>'+
        '<tr><td>Service</td><td class="mono">'+esc(s.id)+'</td><td><a href="#svc-'+esc(s.slug)+'">'+esc(s.name)+'</a></td></tr>'+
        '</tbody></table></div><p class="dv-note">Form: <span class="mono">BA</span> plus area position, then a dot and a two-digit position at each tier. Patterns: '+PATTERNS.join(', ')+'.</p></section>'+
      '<section class="dv-card"><h2>License and citation</h2><p><b>'+esc(D.license)+'.</b> You may share and adapt the model for any purpose, including commercially, if you give credit, link to the license, and say what you changed.</p>'+
        '<p class="dv-cite">'+esc(cite)+'</p><p class="dv-note">Machine-readable citation: <span class="mono">CITATION.cff</span>. License text: <span class="mono">LICENSE</span>. Both are at the repository root.</p></section>'+
      '<section class="dv-card dv-wide"><h2>Files in data/</h2><ul class="dv-files">'+FILES.map(function(f){return '<li><span class="mono">'+esc(f[0])+'</span><span>'+esc(f[1])+'</span></li>';}).join('')+'</ul>'+
        '<p class="dv-note">Coverage is binary presence read from nine homes on one machine on '+esc(D.generated)+', plus documented protocols and flags. It is not a measure of quality.</p></section>'+
      '</div>'+CM.foot();
  }

  function after(){
    var status=document.getElementById('dvStatus'), box=document.getElementById('dvFallback'), ta=document.getElementById('dvText'), timer=null;
    function say(msg){status.textContent=msg;clearTimeout(timer);timer=setTimeout(function(){status.textContent='';},4000);}
    function fallback(text,label){ta.value=text;box.hidden=false;ta.focus();ta.select();say(label+' selected below, '+text.length.toLocaleString()+' characters.');}
    Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'),function(b){
      b.addEventListener('click',function(){
        var isJson=b.getAttribute('data-copy')==='json', text=isJson?modelJson():servicesCsv(), label=isJson?'Model JSON':'Services CSV';
        box.hidden=true;
        try{
          if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('no clipboard');
          navigator.clipboard.writeText(text).then(function(){say(label+' copied, '+text.length.toLocaleString()+' characters.');},function(){fallback(text,label);});
        }catch(e){fallback(text,label);}
      });
    });
  }

  CM.addRoute(/^data$/,view,'data',after);
  CM.addNav('Data','#data','data');
})();
