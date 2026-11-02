(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EN = !!document.querySelector('main[data-lang="en"]');
  document.body.classList.add('page-in');

  /* Barre de progression de défilement */
  var bar = document.createElement('div');
  bar.className = 'scrollbar';
  document.body.appendChild(bar);
  function updateBar(){
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  var ticking = false;
  addEventListener('scroll', function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){ updateBar(); ticking = false; });
  }, { passive: true });
  updateBar();

  /* Menu plein écran */
  var burger = document.getElementById('burger'), omenu = document.getElementById('omenu');
  if (burger && omenu){
    function closeMenu(){ burger.setAttribute('aria-expanded', 'false'); omenu.classList.remove('is-open'); document.body.classList.remove('menu-open'); }
    function toggleMenu(){
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', open ? 'false' : 'true');
      omenu.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    }
    burger.addEventListener('click', toggleMenu);
    omenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
    addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
  }

  /* Typographie cinétique : scinde chaque titre .kinetic en mots animés */
  function kinetic(el){
    if (!el || el.dataset.kDone) return;
    el.dataset.kDone = '1';
    var frag = document.createDocumentFragment(), idx = 0;
    Array.prototype.forEach.call(Array.prototype.slice.call(el.childNodes), function(node){
      if (node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(function(chunk){
          if (chunk === '') return;
          if (/^\s+$/.test(chunk)){ frag.appendChild(document.createTextNode(chunk)); return; }
          var w = document.createElement('span'); w.className = 'kword';
          var inner = document.createElement('span'); inner.textContent = chunk;
          inner.style.animationDelay = (idx * 0.07) + 's'; idx++;
          w.appendChild(inner); frag.appendChild(w);
        });
      } else {
        var w = document.createElement('span'); w.className = 'kword';
        var inner = document.createElement('span'); inner.appendChild(node.cloneNode(true));
        inner.style.animationDelay = (idx * 0.07) + 's'; idx++;
        w.appendChild(inner); frag.appendChild(w);
      }
    });
    el.innerHTML = '';
    el.appendChild(frag);
  }
  if (!reduce) document.querySelectorAll('.kinetic').forEach(kinetic);

  /* Projecteur qui suit la souris */
  document.querySelectorAll('.spot').forEach(function(c){
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Boutons magnétiques */
  if (!reduce && matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('pointermove', function(e){ var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX-r.left-r.width/2)*.18) + 'px,' + ((e.clientY-r.top-r.height/2)*.25 - 2) + 'px)'; });
      b.addEventListener('pointerleave', function(){ b.style.transform = ''; });
    });
  }

  /* Copier */
  document.querySelectorAll('[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.getElementById(btn.dataset.copy), txt = el.textContent.trim(), lab = btn.textContent;
      function select(){ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = EN ? 'Selected' : 'Sélectionné'; setTimeout(function(){ btn.textContent = lab; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){ btn.textContent = EN ? 'Copied ✓' : 'Copié ✓'; setTimeout(function(){ btn.textContent = lab; }, 1800); }, select); } else select();
    });
  });

  if (!window.gsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Apparitions au défilement : le contenu reste lisible au repos */
  gsap.utils.toArray('.rv').forEach(function(el){
    gsap.from(el, {y:40, duration:.9, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 94%'}});
  });

  /* Les images et vidéos apparaissent une à une au fil du défilement */
  gsap.utils.toArray('main img, main video').forEach(function(media){
    gsap.from(media, {opacity:0, scale:1.07, y:16, duration:1, ease:'power2.out', scrollTrigger:{trigger:media, start:'top 90%'}});
  });

  /* Lignes éditoriales numérotées : légère entrée en cascade */
  gsap.utils.toArray('.erow').forEach(function(el, i){
    gsap.from(el, {y:24, opacity:0, duration:.7, delay:i*.04, ease:'power2.out', scrollTrigger:{trigger:el, start:'top 92%'}});
  });

  /* Compteurs */
  document.querySelectorAll('[data-count]').forEach(function(el){
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '', o = {v:0};
    ScrollTrigger.create({trigger:el, start:'top 95%', once:true, onEnter:function(){
      gsap.to(o, {v:end, duration:1.8, ease:'power2.out', onUpdate:function(){ el.textContent = o.v.toLocaleString(EN ? 'en-US' : 'fr-FR', {minimumFractionDigits:dec, maximumFractionDigits:dec}) + suf; }});
    }});
  });
})();
