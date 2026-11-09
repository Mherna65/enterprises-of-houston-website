// Mobile nav toggle
(function(){
  var btn=document.querySelector('.nav-toggle'),nav=document.getElementById('site-nav');
  if(btn&&nav){
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open);
    });
    nav.addEventListener('click',function(e){
      if(e.target.closest('a')){btn.setAttribute('aria-expanded','false');nav.classList.remove('open');}
    });
  }
  // Quote form: validate on-site, then POST to Jotform so submissions land in the account.
  var form=document.getElementById('quote-form'),status=document.getElementById('form-status');
  if(!form)return;
  var FORM_ID='263125866892065';
  var SUBMIT_URL='https://submit.jotform.com/submit/'+FORM_ID;
  var TO='mhernandez2962@yahoo.com';
  var submitting=false;

  function setStatus(msg,kind){
    status.textContent=msg;
    status.className='form-status'+(kind?' '+kind:'');
  }

  function validate(){
    var bad=null;
    form.querySelectorAll('[required]').forEach(function(el){
      var ok=el.value.trim()!==''&&(el.type!=='email'||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.setAttribute('aria-invalid',ok?'false':'true');
      if(!ok&&!bad)bad=el;
    });
    if(bad){
      setStatus('Please fill in your name, phone, and a valid email.','error');
      bad.focus();
      return false;
    }
    return true;
  }

  function jotformFields(d){
    return {
      formID:FORM_ID,
      simple_spc:FORM_ID+'-'+FORM_ID,
      website:'',
      q9_name:d.get('name')||'',
      q3_q3_textbox1:d.get('company')||'',
      'q4_q4_phone2[full]':d.get('phone')||'',
      q5_q5_email3:d.get('email')||'',
      q6_q6_dropdown4:d.get('project_type')||'',
      q7_q7_textbox5:d.get('location')||'',
      q8_q8_textarea6:d.get('message')||''
    };
  }

  function appendHidden(f,name,value){
    var input=document.createElement('input');
    input.type='hidden';
    input.name=name;
    input.value=value==null?'':String(value);
    f.appendChild(input);
  }

  // Hidden-iframe POST avoids CORS issues and still stores the submission in Jotform.
  function submitViaIframe(fields){
    return new Promise(function(resolve,reject){
      var frameName='jotform_submit_frame_'+Date.now();
      var iframe=document.createElement('iframe');
      iframe.name=frameName;
      iframe.setAttribute('aria-hidden','true');
      iframe.style.cssText='position:absolute;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(iframe);

      var ghost=document.createElement('form');
      ghost.method='POST';
      ghost.action=SUBMIT_URL;
      ghost.target=frameName;
      ghost.acceptCharset='UTF-8';
      ghost.style.display='none';
      Object.keys(fields).forEach(function(k){appendHidden(ghost,k,fields[k]);});
      document.body.appendChild(ghost);

      var settled=false;
      function finish(ok,err){
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        setTimeout(function(){
          if(ghost.parentNode)ghost.parentNode.removeChild(ghost);
          if(iframe.parentNode)iframe.parentNode.removeChild(iframe);
        },400);
        if(ok)resolve(true);else reject(err||new Error('Jotform iframe submit failed'));
      }

      // Cross-origin iframe load usually fires after Jotform accepts the POST.
      iframe.addEventListener('load',function(){finish(true);});
      var timer=setTimeout(function(){finish(true);},2800);

      try{ghost.submit();}
      catch(err){finish(false,err);}
    });
  }

  function mailtoBackup(d){
    var lines=[
      'Name: '+d.get('name'),'Company: '+d.get('company'),'Phone: '+d.get('phone'),'Email: '+d.get('email'),
      'Project type: '+d.get('project_type'),'Location: '+d.get('location'),'','Details:',d.get('message')];
    var subject='Quote request'+(d.get('project_type')?' - '+d.get('project_type'):'')+' - '+d.get('name');
    return 'mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(submitting)return;
    if(!validate())return;

    var d=new FormData(form);
    var fields=jotformFields(d);
    var btn=form.querySelector('[type="submit"]');
    submitting=true;
    if(btn){btn.disabled=true;}
    setStatus('Sending your quote request…','');

    submitViaIframe(fields).then(function(){
      form.reset();
      setStatus('Thanks, we received your quote request and will get back to you soon.','');
    }).catch(function(){
      var href=mailtoBackup(d);
      status.innerHTML='Sorry — we could not submit that right now. Please try again, or '+
        '<a href="'+href+'">email us directly</a>.';
      status.className='form-status error';
    }).then(function(){
      submitting=false;
      if(btn){btn.disabled=false;}
    });
  });
})();

// Job videos: lazy-load the source when near the section, then autoplay muted + looped
// as soon as they're in view (no tap needed). Browsers only allow autoplay when muted.
(function(){
  var vids=[].slice.call(document.querySelectorAll('video.lazy-video'));
  if(!vids.length)return;
  vids.forEach(function(v){
    v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
    v.playsInline=true;v.loop=true;
    // if the visitor pauses a video themselves, don't force it to restart
    v.addEventListener('pause',function(){if(!v._auto&&v._inView&&!v.ended)v._userPaused=true;});
    v.addEventListener('play',function(){v._userPaused=false;});
    v.addEventListener('playing',function(){if(v._inView===false)autoPause(v);});
  });
  function load(v){
    if(v.dataset.loaded)return;
    v.querySelectorAll('source[data-src]').forEach(function(s){s.src=s.dataset.src;});
    v.preload='auto';v.load();v.dataset.loaded='1';
    v.addEventListener('canplay',function(){if(v._inView)tryPlay(v);});
  }
  function tryPlay(v){
    if(v._userPaused||!v.paused)return;
    v.muted=true;
    var p=v.play();
    if(p&&p.catch)p.catch(function(){v._blocked=true;});
  }
  function autoPause(v){if(!v.paused){v._auto=true;v.pause();v._auto=false;}}
  if(!('IntersectionObserver' in window)){vids.forEach(function(v){v._inView=true;load(v);tryPlay(v);});return;}
  // start fetching a bit before the section scrolls into view
  var near=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){load(e.target);near.unobserve(e.target);}});},{rootMargin:'600px 0px'});
  var seen=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v=e.target;v._inView=e.isIntersecting;
      if(e.isIntersecting){load(v);tryPlay(v);}else{autoPause(v);}
    });
  },{threshold:0.2});
  vids.forEach(function(v){near.observe(v);seen.observe(v);});
  // Fallback: some phones (e.g. iOS Low Power Mode) block autoplay until the first touch anywhere on the page.
  function kick(){vids.forEach(function(v){if(v._inView)tryPlay(v);});}
  ['touchstart','pointerdown','scroll','keydown'].forEach(function(t){window.addEventListener(t,kick,{passive:true});});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)kick();});
})();
