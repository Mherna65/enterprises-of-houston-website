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
