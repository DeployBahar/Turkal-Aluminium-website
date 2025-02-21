document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || localStorage.getItem('language') || 'en';
  
  Promise.all([
    fetchTranslations(lang),
    fetchSeoMetadata(lang)
  ]).catch(console.error);

  setupLanguageLinks();
  setupLanguageSelector();
  setupSliders();
  setupWhatsAppPopup();
});

const setupLanguageLinks = () => {
  document.querySelectorAll('.language-selector + .sub-menu li a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const selectedLang = link.getAttribute('onclick').match(/'(.*?)'/)[1];
      changeLanguage(selectedLang);
    });
  });
};

const setupLanguageSelector = () => {
  const languageSelector = document.querySelector('.language-selector');
  if (languageSelector) {
    languageSelector.addEventListener('click', toggleLanguageMenu);
  } else {
    console.error('Language selector element not found.');
  }
};

const toggleLanguageMenu = () => {
  const languageSelector = document.querySelector('.language-selector');
  if (languageSelector) {
    languageSelector.classList.toggle('active');
    languageSelector.setAttribute('aria-expanded', languageSelector.classList.contains('active'));
  }
};

const fetchTranslations = async (lang) => {
  try {
    const filePath = `../assets/languages/translations-${lang}.json`;
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Error loading translations for ${lang} from ${filePath}`);

    const translations = await response.json();
    console.log('Translations loaded:', translations);
    setLanguage(translations, lang);
    window.translations = translations;

    updateFlag(lang);
  } catch (error) {
    console.error('Error loading translations:', error);
  }
};

const updateFlag = (lang) => {
  const selectedFlag = document.getElementById('selectedFlag');
  if (selectedFlag) {
    const flags = {
      en: `../assets/img/page/us.png`,
      tr: `../assets/img/page/tr.png`,
      ar: `../assets/img/page/sa.png`,
    };
    selectedFlag.src = flags[lang];
    console.log(`Flag changed to: ${flags[lang]}`);
  } else {
    console.error('Selected flag element not found.');
  }
};

const fetchSeoMetadata = async (lang) => {
  try {
    const filePath = `../assets/languages/seo-metadata.json`;
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Error loading SEO metadata from ${filePath}`);

    const seoMetadata = await response.json();
    console.log('SEO Metadata loaded:', seoMetadata);
    updateMetaTags(seoMetadata, lang);
  } catch (error) {
    console.error('Error loading SEO metadata:', error);
  }
};

const setLanguage = (translations, lang) => {
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.type === 'submit' || el.type === 'button' ? el.value = translations[key] || el.value : el.placeholder = translations[key] || el.placeholder;
    } else {
      el.textContent = translations[key] || el.textContent;
    }
  });
};

const changeLanguage = lang => {
  localStorage.setItem('language', lang);
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  window.history.pushState({}, '', url);
  location.reload();
};

const updateMetaTags = (seoMetadata, lang) => {
  const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  const metadata = seoMetadata[`${pageName}.html`][lang];

  const titleElement = document.querySelector('title');
  if (titleElement && metadata.title) titleElement.textContent = metadata.title;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta && metadata.description) descriptionMeta.setAttribute('content', metadata.description);

  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta && metadata.keywords) keywordsMeta.setAttribute('content', metadata.keywords);
};

const setupSliders = () => {
  document.querySelectorAll('.image-slider-wrapper').forEach(sliderWrapper => {
    const images = sliderWrapper.querySelectorAll('img');
    const navigationIndicator = sliderWrapper.querySelector('.image-navigation');
    
    images.forEach((_, index) => {
      const dot = document.createElement('div');
      if (index === 0) dot.classList.add('active-navigation');
      navigationIndicator.appendChild(dot);
    });

    const dots = navigationIndicator.querySelectorAll('div');
    sliderWrapper.addEventListener('mousemove', e => {
      const rect = sliderWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const activeIndex = Math.min(images.length - 1, Math.max(0, Math.floor(percent * images.length)));

      images.forEach((img, index) => img.classList.toggle('visible-image', index === activeIndex));
      dots.forEach((dot, index) => dot.classList.toggle('active-navigation', index === activeIndex));
      navigationIndicator.classList.add('show-navigation');
    });

    sliderWrapper.addEventListener('mouseleave', () => navigationIndicator.classList.remove('show-navigation'));
  });
};

const setupWhatsAppPopup = () => {
  const whatsappMessage = document.getElementById('whatsappMessage');
  if (whatsappMessage) {
    whatsappMessage.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
  } else {
    console.error('WhatsApp message input element not found.');
  }
};

const togglePopup = () => {
  const popup = document.getElementById('whatsappPopup');
  if (popup) {
    if (popup.classList.contains('show')) {
      popup.classList.remove('show');
      setTimeout(() => popup.style.bottom = '-100%', 300);
    } else {
      popup.style.bottom = window.innerWidth <= 480 ? '80px' : '90px';
      popup.classList.add('show');
      document.getElementById('whatsappMessage').focus();
    }
  } else {
    console.error('WhatsApp popup element not found.');
  }
};

const sendMessage = () => {
  const message = document.getElementById('whatsappMessage').value;
  const phone = '905388786688';
  if (message.trim() !== '') {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  } else {
    alert('Lütfen bir mesaj girin!');
  }
};