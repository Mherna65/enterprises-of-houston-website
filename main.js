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
  // Quote form: TODO swap for a real backend. For now, validate and open a pre-filled email.
  var form=document.getElementById('quote-form'),status=document.getElementById('form-status');
  if(!form)return;
  var TO='mhernandez2962@yahoo.com';
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=null;
    form.querySelectorAll('[required]').forEach(function(el){
      var ok=el.value.trim()!==''&&(el.type!=='email'||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.setAttribute('aria-invalid',ok?'false':'true');
      if(!ok&&!bad)bad=el;
    });
    if(bad){status.textContent='Please fill in your name, phone, and a valid email.';status.className='form-status error';bad.focus();return;}
    var d=new FormData(form),lines=[
      'Name: '+d.get('name'),'Company: '+d.get('company'),'Phone: '+d.get('phone'),'Email: '+d.get('email'),
      'Project type: '+d.get('project_type'),'Location: '+d.get('location'),'','Details:',d.get('message')];
    var subject='Quote request'+(d.get('project_type')?' - '+d.get('project_type'):'')+' - '+d.get('name');
    window.location.href='mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    status.textContent='Opening your email app to send the request…';status.className='form-status';
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
