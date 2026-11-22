const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const current=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.main-nav a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active');});

const monthNames={'01':'январь','02':'февраль','03':'март','04':'апрель','05':'май','06':'июнь','07':'июль','08':'август','09':'сентябрь','10':'октябрь','11':'ноябрь','12':'декабрь'};
const itemTime=item=>{const match=String(item.sort||item.date||item.year||'0').match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);if(!match)return 0;return Number(match[1])*10000+Number(match[2]||0)*100+Number(match[3]||0);};
const newest=items=>[...items].sort((a,b)=>itemTime(b)-itemTime(a));
const external=(url,label,className='')=>{if(!url)return null;const a=document.createElement('a');a.href=url;a.textContent=label||'Открыть источник ↗';if(/^https?:/.test(url)){a.target='_blank';a.rel='noopener noreferrer';}if(className)a.className=className;return a;};
const metaText=item=>[item.displayDate||item.year,item.source].filter(Boolean).join(' · ');
const appendActions=(card,item)=>{const links=document.createElement('div');links.className='impact-links';[[item.url,item.linkText],[item.extraUrl,item.extraText],[item.thirdUrl,item.thirdText]].forEach(([url,label])=>{const link=external(url,label);if(link)links.append(link);});if(links.childElementCount)card.append(links);};
const renderTimelineCard=(item,kind='media-item')=>{
 const card=document.createElement('article');card.className=kind;
 const meta=document.createElement('div');meta.className=kind==='media-item'?'meta':'meta';meta.textContent=metaText(item);card.append(meta);
 const title=document.createElement('h3');title.textContent=item.title;card.append(title);
 const desc=document.createElement('p');desc.textContent=item.description||'';card.append(desc);
 if(item.image){const img=document.createElement('img');img.src=item.image;img.alt=item.imageAlt||item.title;img.loading='lazy';if(item.imageFit==='contain')img.classList.add('image-contain');card.append(img);}
 if(item.video&&!item.url){const details=document.createElement('details');details.className='video-disclosure';const summary=document.createElement('summary');summary.textContent='Открыть видеозапись';const video=document.createElement('video');video.className='media-video';video.controls=true;video.preload='none';video.playsInline=true;video.dataset.src=item.video;video.dataset.type=item.sourceType||(item.video.endsWith('.mov')?'video/quicktime':'video/mp4');details.append(summary,video);details.addEventListener('toggle',()=>{if(details.open&&!video.querySelector('source')){const source=document.createElement('source');source.src=video.dataset.src;source.type=video.dataset.type;video.append(source);video.load();}});card.append(details);}
 if(item.audio){const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';const source=document.createElement('source');source.src=item.audio;source.type='audio/mpeg';audio.append(source);card.append(audio);}
 if(item.citation)card.append(citationButton(item.citation));
 appendActions(card,item);return card;
};
const citationButton=citation=>{const button=document.createElement('button');button.type='button';button.className='copy-citation';button.dataset.citation=citation;button.setAttribute('aria-label','Скопировать цитирование: '+citation);const text=document.createElement('span');text.className='citation-text';text.textContent=citation;const hint=document.createElement('span');hint.className='citation-feedback';hint.textContent='Нажмите, чтобы скопировать';button.append(text,hint);return button;};
document.querySelectorAll('.copy-citation[data-citation]').forEach(button=>{const citation=button.dataset.citation;if(!citation)return;button.setAttribute('aria-label','Скопировать цитирование: '+citation);const text=document.createElement('span');text.className='citation-text';text.textContent=citation;const hint=document.createElement('span');hint.className='citation-feedback';hint.textContent='Нажмите, чтобы скопировать';button.replaceChildren(text,hint);});
document.addEventListener('click',async event=>{const button=event.target.closest('.copy-citation');if(!button)return;const citation=button.dataset.citation||'';let copied=false;try{await navigator.clipboard.writeText(citation);copied=true;}catch{const field=document.createElement('textarea');field.value=citation;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();copied=document.execCommand('copy');field.remove();}let hint=button.querySelector('.citation-feedback');if(!hint){hint=document.createElement('span');hint.className='citation-feedback';button.append(hint);}hint.textContent=copied?'Скопировано в буфер обмена ✓':'Не удалось скопировать';setTimeout(()=>{if(hint.isConnected)hint.textContent='Нажмите, чтобы скопировать';},2400);});
const renderPaper=item=>{const card=document.createElement('article');card.className='paper';const year=document.createElement('div');year.className='paper-year';year.textContent=item.year;const body=document.createElement('div');const title=document.createElement('h3');title.textContent=item.title;body.append(title);const authors=document.createElement('p');authors.textContent=item.authors||'';body.append(authors);if(item.details){const details=document.createElement('p');details.textContent=item.details;body.append(details);}if(item.url){body.append(external(item.url,item.linkText||'Открыть публикацию ↗'));}body.append(citationButton(item.citation));card.append(year,body);return card;};
const renderMedia=(item)=>{const card=renderTimelineCard(item,'media-item');card.querySelector('.meta').textContent=metaText(item);return card;};

const videoLibrary=document.querySelector('#video-library');
fetch(new URL('assets/data/portfolio-data.json',document.baseURI),{cache:'no-store'}).then(r=>r.ok?r.json():{timeline:[],profiles:[]}).catch(()=>({timeline:[],profiles:[]})).then(portfolio=>{
 const timeline=newest(portfolio.timeline||[]);
 const education=portfolio.education||{};
 document.querySelectorAll('[data-education]').forEach(container=>{
  container.replaceChildren();
  (education[container.dataset.education]||[]).forEach(item=>{
   const card=document.createElement('article');card.className='education-card';
   const period=document.createElement('div');period.className='education-year';period.textContent=item.period||'';
   const title=document.createElement('h4');title.textContent=item.title||'';card.append(period,title);
   if(item.institution){const institution=document.createElement('p');institution.textContent=item.institution;card.append(institution);}
   if(item.honor){const honor=document.createElement('span');honor.className='education-honor';honor.textContent=item.honor;card.append(honor);}
   container.append(card);
  });
 });
 document.querySelectorAll('[data-education-skills]').forEach(list=>{
  list.replaceChildren();(education.skills||[]).forEach(skill=>{const item=document.createElement('li');item.textContent=skill;list.append(item);});
 });
 document.querySelectorAll('[data-certificates-link]').forEach(link=>{if(education.certificatesUrl)link.href=education.certificatesUrl;});
 const renderAudio=(container,list)=>{
  if(!container)return;
  const carousel=container.closest('[data-audio-carousel]');
  container.replaceChildren();
  list.forEach((item,index)=>{
   const card=document.createElement('article');card.className='audio-card';
   if(carousel){card.classList.add('audio-carousel-slide');card.setAttribute('role','group');card.setAttribute('aria-roledescription','слайд');card.setAttribute('aria-label',`${String(index+1).padStart(2,'0')} из ${String(list.length).padStart(2,'0')}`);}
   const info=document.createElement('div');const meta=document.createElement('div');meta.className='audio-meta';meta.textContent=[item.source,item.displayDate||item.year].filter(Boolean).join(' · ');
   const title=document.createElement('h3');title.textContent=item.title;const desc=document.createElement('p');desc.textContent=item.description||'';info.append(meta,title,desc);
   const coverUrl=item.cover||item.image;if(coverUrl){const cover=document.createElement('img');cover.className='audio-cover';cover.src=coverUrl;cover.alt=item.coverAlt||item.imageAlt||`Обложка выпуска «${item.title}»`;cover.loading='lazy';card.classList.add('has-cover');card.append(cover);}
   const audio=document.createElement('audio');audio.controls=true;audio.preload=carousel?'none':'metadata';audio.setAttribute('aria-label',`Слушать: ${item.title}`);
   const source=document.createElement('source');source.src=item.audio;source.type='audio/mpeg';audio.append(source);card.append(info,audio);container.append(card);
  });
  if(carousel)setupAudioCarousel(carousel,container,list.length);
 };
 const setupAudioCarousel=(carousel,track,count)=>{
  const counter=carousel.querySelector('[data-carousel-counter]');const dots=carousel.querySelector('[data-carousel-dots]');
  const previous=carousel.querySelector('[data-carousel-prev]');const next=carousel.querySelector('[data-carousel-next]');
  const viewport=carousel.querySelector('.audio-carousel-viewport');let active=0;
  if(!count){if(counter)counter.textContent='00 / 00';if(previous)previous.disabled=true;if(next)next.disabled=true;return;}
  if(dots){dots.replaceChildren();for(let i=0;i<count;i++){const dot=document.createElement('button');dot.type='button';dot.className='carousel-dot';dot.setAttribute('aria-label',`Перейти к выпуску ${i+1}`);dot.addEventListener('click',()=>goTo(i));dots.append(dot);}}
  const goTo=index=>{active=(index+count)%count;track.style.transform=`translateX(-${active*100}%)`;track.querySelectorAll('.audio-carousel-slide').forEach((slide,i)=>{const visible=i===active;slide.setAttribute('aria-hidden',String(!visible));const player=slide.querySelector('audio');if(player)player.tabIndex=visible?0:-1;});if(counter)counter.textContent=`${String(active+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`;dots?.querySelectorAll('.carousel-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===active);dot.setAttribute('aria-current',i===active?'true':'false');});};
  previous?.addEventListener('click',()=>goTo(active-1));next?.addEventListener('click',()=>goTo(active+1));
  carousel.addEventListener('keydown',event=>{if(event.target.closest('audio'))return;if(event.key==='ArrowLeft'){event.preventDefault();goTo(active-1);}if(event.key==='ArrowRight'){event.preventDefault();goTo(active+1);}});
  if(viewport){let startX=0,startY=0;viewport.addEventListener('touchstart',event=>{const touch=event.changedTouches[0];startX=touch.clientX;startY=touch.clientY;},{passive:true});viewport.addEventListener('touchend',event=>{const touch=event.changedTouches[0];const deltaX=touch.clientX-startX;const deltaY=touch.clientY-startY;if(Math.abs(deltaX)>48&&Math.abs(deltaX)>Math.abs(deltaY)*1.2)goTo(active+(deltaX<0?1:-1));},{passive:true});}
  goTo(0);
 };
 renderAudio(document.querySelector('#audio-library'),timeline.filter(item=>(item.category||[]).includes('audio')&&!(item.category||[]).includes('projects')));
 renderAudio(document.querySelector('#volkoskaz-library'),timeline.filter(item=>(item.category||[]).includes('audio')&&(item.category||[]).includes('projects')));
 if(videoLibrary){videoLibrary.replaceChildren();timeline.filter(item=>item.type==='video').forEach(video=>videoLibrary.append(renderMedia(video)));}
 const researchItems=timeline.filter(item=>(item.category||[]).includes('research'));
 const papers=document.querySelector('#research-papers');if(papers){papers.replaceChildren();researchItems.forEach(item=>papers.append(renderPaper(item)));}
 const aboutResearch=document.querySelector('#about-research-list');if(aboutResearch){aboutResearch.replaceChildren();researchItems.forEach(item=>aboutResearch.append(renderPaper(item)));}
 const homePapers=document.querySelector('#portfolio-research');if(homePapers){homePapers.replaceChildren();researchItems.forEach(item=>homePapers.append(renderPaper(item)));}
 const media=document.querySelector('#media-timeline');if(media){media.replaceChildren();timeline.filter(item=>item.type!=='video'&&item.type!=='audio'&&(item.category||[]).some(cat=>['media','press','talks'].includes(cat))&&!(item.category||[]).some(cat=>['awards','volunteering'].includes(cat))).forEach(item=>media.append(renderMedia(item)));}
 const experience=document.querySelector('#about-experience-list');if(experience){experience.replaceChildren();timeline.filter(item=>(item.category||[]).includes('media')&&item.type!=='video'&&item.type!=='audio').forEach(item=>experience.append(renderMedia(item)));}
 const profiles=document.querySelector('#profile-links');if(profiles){profiles.replaceChildren();(portfolio.profiles||[]).forEach(profile=>{const link=external(profile.url,profile.title+' ↗','profile-link');const group=document.createElement('span');group.textContent=profile.group;const card=document.createElement('div');card.className='profile-card';card.append(group,link);profiles.append(card);});}
 const renderGroup=(selector,items)=>{const container=document.querySelector(selector);if(container){container.replaceChildren();items.forEach(item=>container.append(renderTimelineCard(item,'impact-card')));}};
 renderGroup('#portfolio-volunteering',timeline.filter(item=>(item.category||[]).includes('volunteering')));
 renderGroup('#portfolio-awards',timeline.filter(item=>(item.category||[]).includes('awards')));
 renderGroup('#about-public-list',timeline.filter(item=>(item.category||[]).includes('volunteering')));
 renderGroup('#about-awards-list',timeline.filter(item=>(item.category||[]).includes('awards')));
 renderGroup('#portfolio-featured',timeline.filter(item=>item.type!=='video'&&item.type!=='audio'&&(item.category||[]).some(cat=>['press','talks'].includes(cat))).slice(0,4).map(item=>{const copy={...item};if(item.image)copy.imageAlt=item.title;return copy;}));
 document.querySelectorAll('#portfolio-projects').forEach(container=>{container.replaceChildren();timeline.filter(item=>(item.category||[]).includes('projects')&&!item.featuredProject&&item.type!=='audio').forEach(item=>container.append(renderTimelineCard(item,'media-item')));});
});
