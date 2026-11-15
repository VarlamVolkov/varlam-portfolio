const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const current=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.main-nav a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active');});

const audioContainers=[...document.querySelectorAll('#audio-library, #volkoskaz-library')];
if(audioContainers.length){
 const renderAudio=data=>{
   const tracks=data.tracks||[];
   const journal=tracks.filter(track=>(track.category||'').toLowerCase().includes('волкосказ'));
   const samples=tracks.filter(track=>!(track.category||'').toLowerCase().includes('волкосказ'));
   const render=(container,list)=>{
     if(!container)return;
     container.innerHTML='';
     list.forEach(track=>{
       const card=document.createElement('article');card.className='audio-card';
       const info=document.createElement('div');
       const meta=document.createElement('div');meta.className='audio-meta';meta.textContent=[track.category,track.date].filter(Boolean).join(' · ');
       const title=document.createElement('h3');title.textContent=track.title||'Аудиозапись';
       const desc=document.createElement('p');desc.textContent=track.description||'';
       info.append(meta,title,desc);
       const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';
       const source=document.createElement('source');source.src=track.src;source.type='audio/mpeg';
       audio.append(source);card.append(info,audio);container.append(card);
     });
   };
   render(document.querySelector('#audio-library'),samples);
   render(document.querySelector('#volkoskaz-library'),journal);
 };
 fetch(new URL('audio-library.json',document.baseURI),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('catalog');return r.json();}).then(renderAudio).catch(()=>{});
}

const videoLibrary=document.querySelector('#video-library');
if(videoLibrary){
 const renderVideos=data=>{
   videoLibrary.innerHTML='';
   (data.videos||[]).forEach(video=>{
     const card=document.createElement('article');card.className='media-item';
     const meta=document.createElement('div');meta.className='meta';meta.textContent=[video.channel,video.date].filter(Boolean).join(' · ');
     const title=document.createElement('h3');title.textContent=video.title||'Видеосюжет';
     const desc=document.createElement('p');desc.textContent=video.description||'';
     card.append(meta,title,desc);
     if(video.src){
       const player=document.createElement('video');player.className='media-video';player.controls=true;player.preload='metadata';player.playsInline=true;
       if(video.poster)player.poster=video.poster;
       const source=document.createElement('source');source.src=video.src;source.type=video.sourceType||'video/mp4';player.append(source);card.append(player);
     }
     if(video.url){
       const link=document.createElement('a');link.className='button media-link';link.href=video.url;
       link.target='_blank';link.rel='noopener noreferrer';link.textContent=video.linkText||'Открыть первоисточник ↗';
       card.append(link);
     }
     videoLibrary.append(card);
   });
 };
 fetch(new URL('video-library.json',document.baseURI),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('catalog');return r.json();}).then(renderVideos).catch(()=>{});
}
