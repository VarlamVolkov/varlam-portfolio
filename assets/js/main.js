
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const current=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.main-nav a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active');});

// Audio catalogue: add a track to audio-library.json and upload its MP3 to assets/audio/.
const audioLibrary=document.querySelector('#audio-library');
if(audioLibrary){
 const renderAudio=data=>{
   audioLibrary.innerHTML='';
   (data.tracks||[]).forEach(track=>{
     const card=document.createElement('article');card.className='audio-card';
     const info=document.createElement('div');
     const meta=document.createElement('div');meta.className='audio-meta';meta.textContent=[track.category,track.date].filter(Boolean).join(' · ');
     const title=document.createElement('h3');title.textContent=track.title||'Аудиозапись';
     const desc=document.createElement('p');desc.textContent=track.description||'';
     info.append(meta,title,desc);
     const audio=document.createElement('audio');audio.controls=true;audio.preload='none';
     const source=document.createElement('source');source.src=track.src;source.type='audio/mpeg';
     audio.append(source);card.append(info,audio);audioLibrary.append(card);
   });
   if(!data.tracks||!data.tracks.length)audioLibrary.innerHTML='<p class="note">Пока нет опубликованных аудиозаписей.</p>';
 };
 fetch(new URL('audio-library.json',document.baseURI),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('catalog');return r.json();}).then(renderAudio).catch(()=>{
   renderAudio({tracks:[
     {title:'Либерия Грозного',category:'Волкосказ · выпуск 01',date:'22 марта 2026',description:'История о легендарной библиотеке Ивана Грозного.',src:'assets/audio/volkoskaz-01-liberia.mp3'},
     {title:'Пётр I и зубная драма',category:'Волкосказ · выпуск 02',date:'28 марта 2026',description:'История стоматологии при Петре I.',src:'assets/audio/volkoskaz-02-petr.mp3'},
     {title:'Тайная канцелярия',category:'Волкосказ · выпуск 03',date:'1 апреля 2026',description:'О тайном надзоре в России XVIII века.',src:'assets/audio/volkoskaz-03-kanclery.mp3'},
     {title:'Права: поздно или в самый раз?',category:'Волкосказ · выпуск 04',date:'19 апреля 2026',description:'Личная история о получении водительских прав.',src:'assets/audio/volkoskaz-04-prava.mp3'}
   ]});
 });
}

// Video catalogue: add entries to video-library.json. Links may point to public Google Sites pages or shared video files.
const videoLibrary=document.querySelector('#video-library');
if(videoLibrary){
 const renderVideos=data=>{
   videoLibrary.innerHTML='';
   (data.videos||[]).forEach(video=>{
     const card=document.createElement('article');card.className='media-item';
     const meta=document.createElement('div');meta.className='meta';
     meta.textContent=[video.channel,video.date].filter(Boolean).join(' · ');
     const title=document.createElement('h3');title.textContent=video.title||'Видеосюжет';
     const desc=document.createElement('p');desc.textContent=video.description||'';
     card.append(meta,title,desc);
     if(video.url){
       const link=document.createElement('a');link.className='button media-link';link.href=video.url;
       link.target='_blank';link.rel='noopener noreferrer';link.textContent='Смотреть сюжет ↗';
       card.append(link);
     }
     videoLibrary.append(card);
   });
   if(!data.videos||!data.videos.length)videoLibrary.innerHTML='<p class="note">Ссылки на публикации будут добавлены сюда.</p>';
 };
 fetch(new URL('video-library.json',document.baseURI),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('catalog');return r.json();}).then(renderVideos).catch(()=>renderVideos({videos:[]}));
}
