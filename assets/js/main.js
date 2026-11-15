
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const current=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.main-nav a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active');});

// Audio catalogue: add a track to audio-library.json and upload its MP3 to assets/audio/.
const audioLibrary=document.querySelector('#audio-library');
if(audioLibrary){
 fetch('audio-library.json').then(r=>{if(!r.ok)throw new Error('Не удалось загрузить каталог');return r.json();})
 .then(data=>{
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
 }).catch(()=>{audioLibrary.innerHTML='<p class="note">Не удалось загрузить каталог аудиозаписей.</p>';});
}
