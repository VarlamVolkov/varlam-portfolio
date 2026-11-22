// ==========================================
// Varlam Volkov Portfolio & Voice Studio JS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCopyCitations();
  loadAndRenderData();
});

// 1. Navigation & Dynamic Year
function initNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-active', isOpen);
    });

    // Close menu when clicking link on mobile
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('menu-active');
        }
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .voice-header nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href === '#top')) {
      a.classList.add('active');
    }
  });
}

// 2. Helpers
const monthNames = {
  '01': 'января', '02': 'февраля', '03': 'марта', '04': 'апреля',
  '05': 'мая', '06': 'июня', '07': 'июля', '08': 'августа',
  '09': 'сентября', '10': 'октября', '11': 'ноября', '12': 'декабря'
};

function formatItemDate(item) {
  if (item.displayDate) return item.displayDate;
  if (!item.date && !item.year) return '';
  const dateStr = String(item.date || item.sort || '');
  const match = dateStr.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (match) {
    const [, year, month, day] = match;
    const monthName = monthNames[month] || month;
    return day ? `${parseInt(day, 10)} ${monthName} ${year}` : `${monthName} ${year}`;
  }
  return item.year || dateStr;
}

const itemTime = item => {
  const match = String(item.sort || item.date || item.year || '0').match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!match) return 0;
  return Number(match[1]) * 10000 + Number(match[2] || 0) * 100 + Number(match[3] || 0);
};

const newest = items => [...items].sort((a, b) => itemTime(b) - itemTime(a));

function externalLink(url, label, className = '') {
  if (!url) return null;
  const a = document.createElement('a');
  a.href = url;
  a.textContent = label || 'Открыть источник ↗';
  if (/^https?:/.test(url)) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  if (className) a.className = className;
  return a;
}

function metaText(item) {
  const date = formatItemDate(item);
  return [item.source, date].filter(Boolean).join(' · ');
}

// 3. Audio Player Engine
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// Track currently active audio player across the page
let currentlyPlayingAudio = null;

function pauseAllAudio(exceptAudio = null) {
  document.querySelectorAll('audio').forEach(audio => {
    if (audio !== exceptAudio && !audio.paused) {
      audio.pause();
    }
  });
}

function createCustomAudioPlayer(audioUrl, title = '', options = {}) {
  const { isSlide = false, downloadName = '' } = options;
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-audio-player';

  const audio = document.createElement('audio');
  audio.preload = isSlide ? 'none' : 'metadata';
  audio.src = audioUrl;

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'player-toggle-btn';
  playBtn.setAttribute('aria-label', `Слушать: ${title}`);
  playBtn.innerHTML = `
    <svg class="icon-play" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="7 4 19 12 7 20 7 4"/></svg>
    <svg class="icon-pause" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
  `;

  const timeline = document.createElement('div');
  timeline.className = 'player-timeline';

  const currentTimeEl = document.createElement('span');
  currentTimeEl.className = 'player-time current-time';
  currentTimeEl.textContent = '00:00';

  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'player-slider-wrap';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.step = '0.1';
  slider.className = 'player-slider';
  slider.setAttribute('aria-label', `Позиция воспроизведения: ${title}`);

  const progressBar = document.createElement('div');
  progressBar.className = 'player-progress-bar';

  sliderWrap.append(slider, progressBar);

  const durationEl = document.createElement('span');
  durationEl.className = 'player-time duration-time';
  durationEl.textContent = '00:00';

  timeline.append(currentTimeEl, sliderWrap, durationEl);

  const downloadBtn = document.createElement('a');
  downloadBtn.href = audioUrl;
  downloadBtn.download = downloadName || `${title.replace(/[^\wа-яА-ЯёЁ]+/g, '-').toLowerCase() || 'audio-sample'}.mp3`;
  downloadBtn.className = 'player-download-btn';
  downloadBtn.title = 'Скачать аудио (MP3)';
  downloadBtn.setAttribute('aria-label', `Скачать MP3: ${title}`);
  downloadBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    <span>MP3</span>
  `;

  wrapper.append(audio, playBtn, timeline, downloadBtn);

  // Audio Events
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      pauseAllAudio(audio);
      audio.play().catch(e => console.warn('Audio play prevented:', e));
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    wrapper.classList.add('is-playing');
    currentlyPlayingAudio = audio;
  });

  audio.addEventListener('pause', () => {
    wrapper.classList.remove('is-playing');
    if (currentlyPlayingAudio === audio) currentlyPlayingAudio = null;
  });

  audio.addEventListener('ended', () => {
    wrapper.classList.remove('is-playing');
    slider.value = '0';
    progressBar.style.width = '0%';
    currentTimeEl.textContent = '00:00';
  });

  const updateDuration = () => {
    if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
      durationEl.textContent = formatTime(audio.duration);
    }
  };

  audio.addEventListener('loadedmetadata', updateDuration);
  audio.addEventListener('durationchange', updateDuration);

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    slider.value = percent;
    progressBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  slider.addEventListener('input', () => {
    if (!audio.duration) return;
    const seekTime = (slider.value / 100) * audio.duration;
    currentTimeEl.textContent = formatTime(seekTime);
    progressBar.style.width = `${slider.value}%`;
  });

  slider.addEventListener('change', () => {
    if (!audio.duration) return;
    audio.currentTime = (slider.value / 100) * audio.duration;
  });

  return wrapper;
}

// 4. Citation Button with Toast Feedback
function initCopyCitations() {
  document.addEventListener('click', async event => {
    const button = event.target.closest('.copy-citation');
    if (!button) return;
    const citation = button.dataset.citation || '';
    if (!citation) return;

    let copied = false;
    try {
      await navigator.clipboard.writeText(citation);
      copied = true;
    } catch {
      const field = document.createElement('textarea');
      field.value = citation;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      copied = document.execCommand('copy');
      field.remove();
    }

    const hint = button.querySelector('.citation-feedback') || button;
    const originalText = hint.getAttribute('data-original-hint') || hint.textContent;
    if (!hint.hasAttribute('data-original-hint')) {
      hint.setAttribute('data-original-hint', originalText);
    }

    hint.textContent = copied ? 'Скопировано в буфер обмена ✓' : 'Не удалось скопировать';
    button.classList.add('is-copied');

    setTimeout(() => {
      if (hint.isConnected) {
        hint.textContent = originalText;
        button.classList.remove('is-copied');
      }
    }, 2400);
  });
}

function createCitationButton(citation) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-citation';
  button.dataset.citation = citation;
  button.setAttribute('aria-label', `Скопировать ГОСТ-цитирование: ${citation}`);

  const header = document.createElement('div');
  header.className = 'citation-header';
  header.innerHTML = `
    <span class="citation-label">ГОСТ / Библиографическое описание</span>
    <span class="citation-feedback">Нажмите, чтобы скопировать 📋</span>
  `;

  const text = document.createElement('span');
  text.className = 'citation-text';
  text.textContent = citation;

  button.append(header, text);
  return button;
}

// 5. Timeline Cards & Papers
function renderTimelineCard(item, kind = 'media-item') {
  const card = document.createElement('article');
  card.className = kind;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = metaText(item);
  card.append(meta);

  const title = document.createElement('h3');
  title.textContent = item.title;
  card.append(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.textContent = item.description;
    card.append(desc);
  }

  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.imageAlt || item.title;
    img.loading = 'lazy';
    if (item.imageFit === 'contain') img.classList.add('image-contain');
    card.append(img);
  }

  if (item.video && !item.url) {
    const details = document.createElement('details');
    details.className = 'video-disclosure';
    const summary = document.createElement('summary');
    summary.textContent = 'Смотреть видеозапись';
    const video = document.createElement('video');
    video.className = 'media-video';
    video.controls = true;
    video.preload = 'none';
    video.playsInline = true;
    video.dataset.src = item.video;
    video.dataset.type = item.sourceType || (item.video.endsWith('.mov') ? 'video/quicktime' : 'video/mp4');
    details.append(summary, video);
    details.addEventListener('toggle', () => {
      if (details.open && !video.querySelector('source')) {
        const source = document.createElement('source');
        source.src = video.dataset.src;
        source.type = video.dataset.type;
        video.append(source);
        video.load();
      }
    });
    card.append(details);
  }

  if (item.audio) {
    const player = createCustomAudioPlayer(item.audio, item.title);
    card.append(player);
  }

  if (item.citation) {
    card.append(createCitationButton(item.citation));
  }

  const links = document.createElement('div');
  links.className = 'impact-links';
  [
    [item.url, item.linkText || 'Подробнее ↗'],
    [item.extraUrl, item.extraText],
    [item.thirdUrl, item.thirdText]
  ].forEach(([url, label]) => {
    const link = externalLink(url, label);
    if (link) links.append(link);
  });
  if (links.childElementCount) card.append(links);

  return card;
}

function renderPaper(item) {
  const card = document.createElement('article');
  card.className = 'paper';

  const year = document.createElement('div');
  year.className = 'paper-year';
  year.textContent = item.year;

  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = item.title;
  body.append(title);

  if (item.authors) {
    const authors = document.createElement('p');
    authors.className = 'paper-authors';
    authors.textContent = item.authors;
    body.append(authors);
  }

  if (item.details) {
    const details = document.createElement('p');
    details.className = 'paper-details';
    details.textContent = item.details;
    body.append(details);
  }

  if (item.url) {
    const link = externalLink(item.url, item.linkText || 'Читать публикацию ↗', 'paper-link');
    body.append(link);
  }

  if (item.citation) {
    body.append(createCitationButton(item.citation));
  }

  card.append(year, body);
  return card;
}

// 6. Voice Audio Cards & Filter
function renderVoiceAudioCard(item, isSlide = false, index = 0, total = 0) {
  const card = document.createElement('article');
  card.className = 'audio-card';
  if (isSlide) {
    card.classList.add('audio-carousel-slide');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'слайд');
    card.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} из ${String(total).padStart(2, '0')}`);
  }

  // Format type tag
  const isAd = (item.title || '').toLowerCase().includes('little home') || (item.source || '').toLowerCase().includes('реклам');
  const isIvr = (item.title || '').toLowerCase().includes('автоответчик') || (item.source || '').toLowerCase().includes('информацион');
  const formatTag = isAd ? 'Реклама и бренды' : isIvr ? 'IVR & Автоответчик' : 'Сторителлинг';
  card.dataset.format = isAd ? 'ad' : isIvr ? 'ivr' : 'story';

  const info = document.createElement('div');
  info.className = 'audio-card-info';

  const metaBar = document.createElement('div');
  metaBar.className = 'audio-meta-bar';

  const meta = document.createElement('div');
  meta.className = 'audio-meta';
  meta.textContent = [item.source, item.displayDate || item.year].filter(Boolean).join(' · ');

  const badge = document.createElement('span');
  badge.className = 'audio-format-badge';
  badge.textContent = formatTag;

  metaBar.append(meta, badge);

  const title = document.createElement('h3');
  title.textContent = item.title;

  const desc = document.createElement('p');
  desc.textContent = item.description || '';

  info.append(metaBar, title, desc);

  const coverUrl = item.cover || item.image;
  if (coverUrl) {
    const cover = document.createElement('img');
    cover.className = 'audio-cover';
    cover.src = coverUrl;
    cover.alt = item.coverAlt || item.imageAlt || `Обложка выпуска «${item.title}»`;
    cover.loading = 'lazy';
    card.classList.add('has-cover');
    card.append(cover);
  }

  const player = createCustomAudioPlayer(item.audio, item.title, { isSlide });
  card.append(info, player);

  return card;
}

// 7. Audio Carousel Setup (for Volkoskaz)
function setupAudioCarousel(carousel, track, count) {
  const counter = carousel.querySelector('[data-carousel-counter]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const viewport = carousel.querySelector('.audio-carousel-viewport');
  let active = 0;

  if (!count) {
    if (counter) counter.textContent = '00 / 00';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  if (dots) {
    dots.replaceChildren();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Перейти к выпуску ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dots.append(dot);
    }
  }

  const goTo = index => {
    active = (index + count) % count;
    track.style.transform = `translateX(-${active * 100}%)`;
    track.querySelectorAll('.audio-carousel-slide').forEach((slide, i) => {
      const visible = i === active;
      slide.setAttribute('aria-hidden', String(!visible));
      const player = slide.querySelector('audio');
      if (player && !visible && !player.paused) {
        player.pause();
      }
    });

    if (counter) {
      counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
    }

    dots?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
      dot.setAttribute('aria-current', i === active ? 'true' : 'false');
    });
  };

  prevBtn?.addEventListener('click', () => goTo(active - 1));
  nextBtn?.addEventListener('click', () => goTo(active + 1));

  carousel.addEventListener('keydown', event => {
    if (event.target.closest('input, audio, button.player-toggle-btn')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(active - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(active + 1);
    }
  });

  if (viewport) {
    let startX = 0, startY = 0;
    viewport.addEventListener('touchstart', event => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });

    viewport.addEventListener('touchend', event => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        goTo(active + (deltaX < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  goTo(0);
}

// 8. Robust Data Loader
async function loadPortfolioData() {
  const candidateUrls = [
    new URL('assets/data/portfolio-data.json', document.baseURI).href,
    new URL('portfolio-data.json', document.baseURI).href,
    'https://raw.githubusercontent.com/VarlamVolkov/varlam-portfolio/main/assets/data/portfolio-data.json'
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // try next fallback
    }
  }
  return { timeline: [], profiles: [], education: {} };
}

// 9. Main Render Routine
async function loadAndRenderData() {
  const portfolio = await loadPortfolioData();
  const timeline = newest(portfolio.timeline || []);
  const education = portfolio.education || {};

  // Education columns
  document.querySelectorAll('[data-education]').forEach(container => {
    container.replaceChildren();
    (education[container.dataset.education] || []).forEach(item => {
      const card = document.createElement('article');
      card.className = 'education-card';

      const period = document.createElement('div');
      period.className = 'education-year';
      period.textContent = item.period || '';

      const title = document.createElement('h4');
      title.textContent = item.title || '';
      card.append(period, title);

      if (item.institution) {
        const inst = document.createElement('p');
        inst.textContent = item.institution;
        card.append(inst);
      }

      if (item.honor) {
        const honor = document.createElement('span');
        honor.className = 'education-honor';
        honor.textContent = item.honor;
        card.append(honor);
      }

      container.append(card);
    });
  });

  // Skills
  document.querySelectorAll('[data-education-skills]').forEach(list => {
    list.replaceChildren();
    (education.skills || []).forEach(skill => {
      const item = document.createElement('li');
      item.textContent = skill;
      list.append(item);
    });
  });

  // Certificates Link
  document.querySelectorAll('[data-certificates-link]').forEach(link => {
    if (education.certificatesUrl) link.href = education.certificatesUrl;
  });

  // Voice Samples (Audio Library)
  const audioLibrary = document.querySelector('#audio-library');
  const voiceItems = timeline.filter(item =>
    (item.category || []).includes('audio') && !(item.category || []).includes('projects')
  );

  if (audioLibrary) {
    audioLibrary.replaceChildren();
    voiceItems.forEach(item => {
      audioLibrary.append(renderVoiceAudioCard(item));
    });

    // Voice tabs filter
    const filterTabs = document.querySelectorAll('[data-voice-filter]');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.voiceFilter;
        audioLibrary.querySelectorAll('.audio-card').forEach(card => {
          if (filter === 'all' || card.dataset.format === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Volkoskaz Podcast Carousel
  const volkoskazLibrary = document.querySelector('#volkoskaz-library');
  const volkoskazItems = timeline.filter(item =>
    (item.category || []).includes('audio') && (item.category || []).includes('projects')
  );

  if (volkoskazLibrary) {
    const carousel = volkoskazLibrary.closest('[data-audio-carousel]');
    volkoskazLibrary.replaceChildren();
    volkoskazItems.forEach((item, index) => {
      volkoskazLibrary.append(renderVoiceAudioCard(item, Boolean(carousel), index, volkoskazItems.length));
    });
    if (carousel) {
      setupAudioCarousel(carousel, volkoskazLibrary, volkoskazItems.length);
    }
  }

  // Videos
  const videoLibrary = document.querySelector('#video-library');
  if (videoLibrary) {
    videoLibrary.replaceChildren();
    timeline.filter(item => item.type === 'video').forEach(video => {
      videoLibrary.append(renderTimelineCard(video, 'media-item'));
    });
  }

  // Research Papers
  const researchItems = timeline.filter(item => (item.category || []).includes('research'));
  ['#research-papers', '#about-research-list', '#portfolio-research'].forEach(sel => {
    const container = document.querySelector(sel);
    if (container) {
      container.replaceChildren();
      researchItems.forEach(item => container.append(renderPaper(item)));
    }
  });

  // Media & Press
  const mediaContainer = document.querySelector('#media-timeline');
  if (mediaContainer) {
    mediaContainer.replaceChildren();
    timeline
      .filter(item =>
        item.type !== 'video' &&
        item.type !== 'audio' &&
        (item.category || []).some(cat => ['media', 'press', 'talks'].includes(cat)) &&
        !(item.category || []).some(cat => ['awards', 'volunteering'].includes(cat))
      )
      .forEach(item => mediaContainer.append(renderTimelineCard(item, 'media-item')));
  }

  const experience = document.querySelector('#about-experience-list');
  if (experience) {
    experience.replaceChildren();
    timeline
      .filter(item => (item.category || []).includes('media') && item.type !== 'video' && item.type !== 'audio')
      .forEach(item => experience.append(renderTimelineCard(item, 'media-item')));
  }

  // Profiles
  const profiles = document.querySelector('#profile-links');
  if (profiles) {
    profiles.replaceChildren();
    (portfolio.profiles || []).forEach(profile => {
      const card = document.createElement('div');
      card.className = 'profile-card';
      const group = document.createElement('span');
      group.textContent = profile.group;
      const link = externalLink(profile.url, profile.title + ' ↗', 'profile-link');
      card.append(group, link);
      profiles.append(card);
    });
  }

  // Helper for groups
  const renderGroup = (selector, items) => {
    const container = document.querySelector(selector);
    if (container) {
      container.replaceChildren();
      items.forEach(item => container.append(renderTimelineCard(item, 'impact-card')));
    }
  };

  renderGroup('#portfolio-volunteering', timeline.filter(item => (item.category || []).includes('volunteering')));
  renderGroup('#portfolio-awards', timeline.filter(item => (item.category || []).includes('awards')));
  renderGroup('#about-public-list', timeline.filter(item => (item.category || []).includes('volunteering')));
  renderGroup('#about-awards-list', timeline.filter(item => (item.category || []).includes('awards')));

  renderGroup(
    '#portfolio-featured',
    timeline
      .filter(item => item.type !== 'video' && item.type !== 'audio' && (item.category || []).some(cat => ['press', 'talks'].includes(cat)))
      .slice(0, 4)
      .map(item => {
        const copy = { ...item };
        if (item.image) copy.imageAlt = item.title;
        return copy;
      })
  );

  document.querySelectorAll('#portfolio-projects').forEach(container => {
    container.replaceChildren();
    timeline
      .filter(item => (item.category || []).includes('projects') && !item.featuredProject && item.type !== 'audio')
      .forEach(item => container.append(renderTimelineCard(item, 'media-item')));
  });
}
