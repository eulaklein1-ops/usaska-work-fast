(function(){
  const config = window.SITE_CONFIG || {};
  const loader = document.getElementById('siteLoader');
  const cursorGlow = document.querySelector('.cursor-glow');
  const revealElements = document.querySelectorAll('.reveal');
  const form = document.getElementById('leadForm');
  const formMessage = document.getElementById('formMessage');
  const slides = document.querySelectorAll('.hero-slide');
  const counters = document.querySelectorAll('[data-counter]');
  const jobLinks = document.querySelectorAll('[data-job]');
  const jobSelect = document.getElementById('job');

  // loader: убираем быстро, чтобы сайт не висел на белом/тёмном экране из-за тяжёлых картинок
  setTimeout(() => loader?.classList.add('done'), 450);
  window.addEventListener('load', function(){
    loader?.classList.add('done');
  });

  // mouse glow
  if (cursorGlow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function(e){
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  // reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    });
  }, {threshold:0.14});
  revealElements.forEach(el=>observer.observe(el));

  // hero slider
  let currentSlide = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4200);
  }

  // counters
  const counterObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.counter, 10) || 0;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(()=>{
        current += step;
        if(current >= target){
          current = target;
          clearInterval(timer);
        }
        el.textContent = current;
      }, 30);
      counterObserver.unobserve(el);
    });
  }, {threshold:0.5});
  counters.forEach(el=>counterObserver.observe(el));

  // slight tilt effect
  document.querySelectorAll('.tilt-card').forEach(card => {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 7;
      const ry = (px - 0.5) * 9;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // set hidden fields
  document.getElementById('utmField').value = window.location.search.replace(/^\?/, '');
  document.getElementById('pageField').value = window.location.href;
  const params = new URLSearchParams(window.location.search);
  document.getElementById('sourceField').value = params.get('utm_source') || params.get('source') || 'site';

  // quick vacancy choice
  jobLinks.forEach(link => {
    link.addEventListener('click', () => {
      const desired = link.dataset.job;
      Array.from(jobSelect.options).forEach((option, index) => {
        if (option.text === desired) jobSelect.selectedIndex = index;
      });
    });
  });

  function showMessage(type, text) {
    formMessage.className = `form-message show ${type}`;
    formMessage.textContent = text;
  }

  function leadToFormData(lead){
    const fd = new FormData();
    Object.entries(lead).forEach(([key, value]) => fd.append(key, value));
    return fd;
  }

  function buildLeadData(){
    const fd = new FormData(form);
    return {
      name: (fd.get('name') || '').trim(),
      phone: (fd.get('phone') || '').trim(),
      job: (fd.get('job') || '').trim(),
      country: (fd.get('country') || '').trim(),
      experience: (fd.get('experience') || '').trim(),
      messenger: (fd.get('messenger') || '').trim(),
      utm: (fd.get('utm') || '').trim(),
      page: (fd.get('page') || '').trim(),
      source: (fd.get('source') || '').trim(),
      created_at: new Date().toISOString(),
      user_agent: navigator.userAgent
    };
  }

  async function sendLead(lead) {
    const endpoint = config.googleSheetsEndpoint || '';
    if (!endpoint || endpoint.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT')) {
      throw new Error('NO_ENDPOINT');
    }

    // no-cors is used because Apps Script Web App typically doesn't need response handling.
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: leadToFormData(lead)
    });
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const honeypot = form.querySelector('.honeypot');

    if (honeypot && honeypot.value) return;

    const lead = buildLeadData();
    if (!lead.name || !lead.phone || !lead.job) {
      showMessage('err', 'Заполните имя, телефон и выберите вакансию.');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';

    try {
      await sendLead(lead);
      try {
        const backup = JSON.parse(localStorage.getItem('usa_work_backup_leads') || '[]');
        backup.push(lead);
        localStorage.setItem('usa_work_backup_leads', JSON.stringify(backup.slice(-100)));
      } catch (e) {}
      form.reset();
      document.getElementById('utmField').value = window.location.search.replace(/^\?/, '');
      document.getElementById('pageField').value = window.location.href;
      showMessage('ok', config.successMessage || 'Спасибо! Заявка отправлена.');
    } catch (error) {
      if (error.message === 'NO_ENDPOINT') {
        showMessage('err', 'Нужно вставить ссылку Google Apps Script в файл js/config.js. Подробная инструкция лежит в архиве.');
      } else {
        showMessage('err', 'Не удалось отправить заявку. Проверьте ссылку Google Apps Script и попробуйте снова.');
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Оставить заявку';
    }
  });
})();
