(() => {
  'use strict';
  const D = window.NPC_DATA;
  const STORE = 'npc-forge-v1';
  const PARTS = ['identity', 'look', 'voice', 'social', 'intrigue'];
  const ACTIONS = [
    {id:'threat',label:'Угрожают'},
    {id:'bribe',label:'Предлагают деньги'},
    {id:'flatter',label:'Льстят'},
    {id:'help',label:'Просят помочь'},
    {id:'lie',label:'Ловят на лжи'}
  ];
  const REACTIONS = {
    threat:{
      wary:'Замолкает и изучает, насколько угроза реальна. Отвечает только на самое необходимое.',
      friendly:'Пугается и чувствует себя преданным. Поможет разве что из страха, а после избегает героев.',
      afraid:'Почти сразу уступает в мелочах, но может соврать, лишь бы его отпустили.',
      greedy:'Пытается договориться: безопасность для него тоже имеет цену.',
      proud:'Публично идёт на конфликт, даже если это крайне неразумно.',
      indifferent:'Пробует оборвать разговор и отойти. При серьёзной угрозе ищет свидетелей.',
      curious:'Первой реакцией задаёт вопрос: кто их послал и чего они добиваются?',
      hostile:'Воспринимает угрозу как подтверждение своих подозрений. Ищет поддержку или путь к отступлению.',
      helpful:'Больше беспокоится о тех, кто окажется рядом, чем о себе.',
      suspicious:'Решает, что его вычислили. Скрывает детали, которые могли бы выдать сообщников.'
    },
    bribe:{
      wary:'Не берёт монеты сразу: сначала выясняет, что от него потребуется и кто узнает.',
      friendly:'Ему неловко брать деньги за простую помощь. За опасную услугу всё-таки попросит плату.',
      afraid:'Сомневается, что сможет отказаться. Проверяет, не ловушка ли это.',
      greedy:'Оживляется, повышает ставку и предлагает «дополнительные услуги».',
      proud:'Считает прямую взятку оскорблением. Может согласиться, если назвать её вознаграждением.',
      indifferent:'Становится внимательнее лишь при сумме, которая решает его проблему.',
      curious:'Интересуется, зачем героям именно его помощь, прежде чем назвать цену.',
      hostile:'Может взять задаток, ничего не обещая. Доверять ему пока нельзя.',
      helpful:'Предлагает помочь без оплаты, если дело не противоречит его принципам.',
      suspicious:'Подозревает подставу. Просит передать плату через посредника.'
    },
    flatter:{
      wary:'Слушает с недоверием, но начинает чуть охотнее делиться опытом.',
      friendly:'Расцветает и пытается быть ещё полезнее, иногда обещая слишком многое.',
      afraid:'Успокаивается, хотя не сразу понимает, чего от него хотят.',
      greedy:'Принимает комплимент как знак, что цену можно поднять.',
      proud:'С удовольствием разворачивает монолог о собственных заслугах.',
      indifferent:'Кивает без интереса. Лучше работает конкретная просьба.',
      curious:'Спрашивает, откуда герои о нём слышали, и начинает выспрашивать о них.',
      hostile:'Подозревает насмешку. Искренняя похвала делу, а не личности может сработать.',
      helpful:'Благодарит, но переводит разговор на практическую помощь.',
      suspicious:'Улыбается, не выдавая чувств, и пытается выяснить источник комплимента.'
    },
    help:{
      wary:'Просит объяснить, почему обратились именно к нему. Маленькую услугу может оказать.',
      friendly:'Соглашается на посильную помощь и просит потом рассказать, чем всё закончилось.',
      afraid:'Оглядывается и говорит, что не хочет ввязываться. Нуждается в гарантиях безопасности.',
      greedy:'Сперва спрашивает об оплате, потом — о самой просьбе.',
      proud:'Ожидает уважительного тона. Услугу считает одолжением, которое потом припомнит.',
      indifferent:'Спросит конкретно: «Что нужно, сколько это займёт и зачем?»',
      curious:'Готов подключиться, если история покажется достаточно необычной.',
      hostile:'Отказывает автоматически. Изменит решение только ради общей выгоды или сильного аргумента.',
      helpful:'Ищет, как помочь прямо сейчас, даже если это затруднит его собственные дела.',
      suspicious:'Сперва хочет убедиться, что просьба не сделает его крайним.'
    },
    lie:{
      wary:'Застывает, а потом требует доказательств, прежде чем признать ложь.',
      friendly:'Краснеет от стыда и пытается объяснить, почему не сказал всей правды.',
      afraid:'Начинает путаться в объяснениях. Может выдать чужое имя, чтобы от него отстали.',
      greedy:'Предлагает обменять правду на обещание молчать или вознаграждение.',
      proud:'Отрицает до последнего и переводит всё в спор о формулировках.',
      indifferent:'Вздыхает: «Ладно, поймали. Что дальше?»',
      curious:'Поражается, как герои заметили нестыковку, и начинает расспрашивать их.',
      hostile:'Злится и пытается закончить беседу. Вполне может предупредить союзников.',
      helpful:'Признаёт обман и пытается исправить его последствия.',
      suspicious:'Заявляет, что именно этого вопроса и ждал. Проверяет, что герои уже знают.'
    }
  };

  const el = id => document.getElementById(id);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const oneOf = (items, weights) => {
    let sum = weights.reduce((a,b)=>a+b,0), x=Math.random()*sum;
    for (let i=0;i<items.length;i++) {x-=weights[i];if (x<0) return items[i];}
    return items[items.length-1];
  };
  const randomId = () => `npc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = x => JSON.parse(JSON.stringify(x));
  const filterEls = ['sceneFilter','roleFilter','speciesFilter','genderFilter','toneFilter','weirdFilter'];
  const defaults = {sceneFilter:'any',roleFilter:'any',speciesFilter:'any',genderFilter:'any',toneFilter:'grim',weirdFilter:'medium'};
  let activeTab = 'saved';
  let activeReaction = 'threat';
  let toastTimer = null;
  let persistenceOk = true;
  const state = {
    current:null,
    saved:[],
    history:[],
    locks:Object.fromEntries(PARTS.map(k=>[k,false])),
    filters:{...defaults}
  };

  function notify(message) {
    const node=el('toast');
    node.textContent=message;
    node.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>node.classList.remove('visible'),2400);
  }
  function safeRead() {
    try {
      const raw=localStorage.getItem(STORE);
      if (!raw) return;
      const data=JSON.parse(raw);
      if (data && typeof data==='object') {
        state.saved=Array.isArray(data.saved)?data.saved.filter(isValidNpc).slice(0,500):[];
        state.history=Array.isArray(data.history)?data.history.filter(isValidNpc).slice(0,20):[];
        state.current=isValidNpc(data.current)?data.current:null;
        state.locks={...state.locks,...Object.fromEntries(PARTS.map(k=>[k,Boolean(data.locks?.[k])]))};
        state.filters={...defaults,...(data.filters||{})};
      }
    } catch(err) {console.warn('Не удалось прочитать хранилище:',err);persistenceOk=false;}
  }
  function persist() {
    try {
      localStorage.setItem(STORE,JSON.stringify({current:state.current,saved:state.saved,history:state.history,locks:state.locks,filters:state.filters}));
      persistenceOk=true;
    } catch(err) {
      console.warn('Не удалось сохранить:',err);
      if (persistenceOk) notify('Хранилище браузера недоступно — сделай экспорт базы');
      persistenceOk=false;
    }
  }
  function isValidNpc(n) {return !!(n && typeof n==='object' && typeof n.id==='string' && n.identity && typeof n.identity.name==='string' && typeof n.identity.firstName==='string' && D.roles[n.identity.roleKey] && D.species[n.identity.speciesKey] && D.scenes[n.identity.sceneKey] && ['m','f'].includes(n.identity.gender) && n.look && typeof n.look.feature==='string' && typeof n.look.dress==='string' && typeof n.look.gesture==='string' && n.voice && typeof n.voice.pitch==='string' && typeof n.voice.tempo==='string' && n.voice.quirk && typeof n.voice.quirk.title==='string' && typeof n.voice.quirk.id==='string' && Number.isInteger(n.voice.lineIndex) && n.social && typeof n.social.temperament==='string' && typeof n.social.immediate==='string' && typeof n.social.want==='string' && typeof n.social.fear==='string' && typeof n.social.principle==='string' && n.social.attitude && typeof n.social.attitude.id==='string' && typeof n.social.attitude.title==='string' && typeof n.social.attitude.first==='string' && n.intrigue && typeof n.intrigue.secret==='string' && typeof n.intrigue.offer==='string' && typeof n.intrigue.lead==='string');}
  function fillSelect(id, choices, placeholder) {
    const node=el(id);
    node.innerHTML=`<option value="any">${esc(placeholder)}</option>` + Object.entries(choices).filter(([key])=>key!=='any').map(([key,data])=>`<option value="${esc(key)}">${esc(data.label)}</option>`).join('');
  }
  function setupFilters(){
    fillSelect('sceneFilter',D.scenes,'Любое место');
    fillSelect('roleFilter',D.roles,'Случайная');
    fillSelect('speciesFilter',D.species,'Случайный');
    for (const id of filterEls) {
      const node=el(id);
      if ([...node.options].some(o=>o.value===state.filters[id])) node.value=state.filters[id];
      node.addEventListener('change',()=>{state.filters[id]=node.value;persist();});
    }
  }
  function speciesSelection(){
    const value=el('speciesFilter').value;
    if(D.species[value])return value;
    return oneOf(['human','dwarf','elf','halfling','tiefling','gnome','orc','dragonborn'],[54,9,9,7,7,6,5,3]);
  }
  function identity(context){
    const sceneKey=context?.sceneKey || (el('sceneFilter').value!=='any'?el('sceneFilter').value:pick(Object.keys(D.scenes).filter(k=>k!=='any')));
    const configuredRole=el('roleFilter').value;
    const roleKey=context?.roleKey || (D.roles[configuredRole]?configuredRole:pick(D.scenes[sceneKey]?.roles||D.scenes.any.roles));
    const speciesKey=speciesSelection();
    const gender=el('genderFilter').value==='any'?pick(['m','f']):el('genderFilter').value;
    const s=D.species[speciesKey];
    const firstName=pick(s.names[gender]);
    const surname=pick(s.surnames);
    return {sceneKey,roleKey,speciesKey,gender,firstName,surname,name:`${firstName} ${surname}`,age:pick(D.ages),activity:pick(D.roles[roleKey].activity),sceneDetail:pick(D.scenes[sceneKey]?.detail||D.scenes.any.detail)};
  }
  function look(ident){
    return {feature:pick(D.species[ident.speciesKey].details),dress:pick(D.silhouettes),gesture:pick(D.gestures)};
  }
  function voice(){
    const level=el('weirdFilter').value;
    const chance=level==='low'?.12:level==='high'?.76:.36;
    const options=Math.random()<chance?D.speechStrange:D.speechNormal;
    return {pitch:pick(D.pitch),tempo:pick(D.tempo),quirk:clone(pick(options)),lineIndex:Math.floor(Math.random()*12)};
  }
  function social(ident){
    return {temperament:pick(D.temperaments),attitude:clone(pick(D.attitudes)),immediate:pick(D.immediate),want:pick(D.roles[ident.roleKey].wants),fear:pick(D.fears),principle:pick(D.principles)};
  }
  function intrigue(ident){
    const tone=el('toneFilter').value;
    const weird=el('weirdFilter').value;
    const list= tone==='strange' && Math.random()<.65?D.secretsStrange:(Math.random()<(weird==='low'?.24:weird==='high'?.62:.42)?D.secretsDanger:D.secretsMundane);
    const lead=tone==='strange'?D.leadsStrange:tone==='classic'?D.leadsClassic:D.leadsGrim;
    return {secret:pick(list),offer:pick(D.roles[ident.roleKey].offers),lead:pick(lead)};
  }
  function addToHistory(npc){
    if(!npc)return;
    state.history=[clone(npc),...state.history.filter(item=>item.id!==npc.id)].slice(0,16);
  }
  function generate(){
    if (state.current) addToHistory(state.current);
    const ident=state.locks.identity && state.current?clone(state.current.identity):identity();
    const part=(k,fn)=>state.locks[k]&&state.current?clone(state.current[k]):fn(ident);
    state.current={id:randomId(),createdAt:Date.now(),notes:'',identity:ident,look:part('look',look),voice:part('voice',voice),social:part('social',social),intrigue:part('intrigue',intrigue)};
    activeReaction='threat';
    persist();renderAll();
  }
  function rerollPart(part){
    const npc=state.current;
    if (!npc || !PARTS.includes(part))return;
    if (part==='identity') {
      const old=npc.identity;
      npc.identity=identity({sceneKey:old.sceneKey,roleKey:old.roleKey});
      // При смене народа обновляем зависящую от него внешность, если она не закреплена.
      if (old.speciesKey!==npc.identity.speciesKey && !state.locks.look) npc.look=look(npc.identity);
    } else if(part==='look')npc.look=look(npc.identity);
    else if(part==='voice')npc.voice=voice(npc.identity);
    else if(part==='social')npc.social=social(npc.identity);
    else if(part==='intrigue')npc.intrigue=intrigue(npc.identity);
    // Любые точечные изменения сохраняют идентификатор героя и не затрагивают остальные части.
    updateSavedIfPresent();persist();renderAll();
  }
  function updateSavedIfPresent(){
    const idx=state.saved.findIndex(n=>n.id===state.current?.id);
    if(idx!==-1)state.saved[idx]=clone(state.current);
  }
  function nameInitials(name){return name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();}
  function speechLine(npc){
    const raw=D.roles[npc.identity.roleKey].lines[npc.voice.lineIndex%D.roles[npc.identity.roleKey].lines.length];
    const q=npc.voice.quirk.id;
    if(q==='snake')return raw.replace(/с/gi,match=>match+'с').replace(/з/gi,match=>match+'з');
    if(q==='lisp')return raw.replace(/ш/gi,'с').replace(/ж/gi,'з');
    if(q==='r')return raw.replace(/р/gi,'л');
    if(q==='vowels') {let n=0;return raw.replace(/[аеёиоуыэюя]/gi,c=>n++<3?c+c:c);}
    if(q==='broken')return raw.replace(/[.!?]$/,'…');
    if(q==='third')return `${npc.identity.firstName} скажет так: ${raw}`;
    if(q==='filler')return `Значит… ${raw}`;
    if(q==='formal')return `Прошу прощения. ${raw}`;
    if(q==='questions')return `А вы-то что думаете? ${raw}`;
    if(q==='rhyme')return `${raw} Вот такие пироги.`;
    if(q==='echo')return `${raw} …Да, именно так.`;
    return raw;
  }
  function sectionHead(part,number,title){
    const locked=state.locks[part];
    const lockIcon=locked?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>';
    return `<div class="section-head"><div class="section-heading"><span class="section-no">${number}</span><h3>${title}</h3></div><div class="section-actions"><button type="button" class="small-icon-btn ${locked?'locked':''}" data-action="lock" data-part="${part}" aria-pressed="${locked}" aria-label="${locked?'Открепить':'Закрепить'} раздел ${title}" title="${locked?'Открепить раздел':'Не менять при новом NPC'}">${lockIcon}</button><button type="button" class="small-icon-btn" data-action="reroll" data-part="${part}" aria-label="Перебросить раздел ${title}" title="Перебросить только этот раздел">⟳</button></div></div>`;
  }
  function field(label,value,extra=''){
    return `<div class="${extra}"><div class="detail-label">${esc(label)}</div><div class="detail-value">${esc(value)}</div></div>`;
  }
  function renderCard(){
    const npc=state.current;
    if(!npc)return;
    const {identity:i,look:l,voice:v,social:s,intrigue:q}=npc;
    const role=D.roles[i.roleKey], species=D.species[i.speciesKey];
    const mood=s.attitude.title;
    const note=typeof npc.notes==='string'?npc.notes:'';
    el('characterCard').innerHTML=`
      <section class="npc-hero">
        <div class="npc-hero-main">
          <div class="avatar" aria-hidden="true">${esc(nameInitials(i.name))}</div>
          <div class="name-wrap">
            <div class="role-marker">${esc(role.label)} · ${esc(D.scenes[i.sceneKey]?.label||'Место неизвестно')}</div>
            <h2 class="npc-name">${esc(i.name)}</h2>
            <div class="npc-meta"><span>${esc(species.label)}</span><span>${esc(i.age)}</span><span>${i.gender==='m'?'Мужчина':'Женщина'}</span></div>
          </div>
        </div>
        <div class="npc-summary">
          <div class="summary-tile"><small>Манера</small><strong>${esc(s.temperament)}</strong></div>
          <div class="summary-tile"><small>Отношение</small><strong>${esc(mood)}</strong></div>
          <div class="summary-tile"><small>Прямо сейчас</small><strong>${esc(s.immediate)}</strong></div>
        </div>
      </section>
      <section class="npc-section">
        ${sectionHead('identity','01','Кто это')}
        <div class="feature-grid">
          ${field('Занятие',role.label)}
          ${field('Где находится',i.sceneDetail)}
          ${field('Чем занят в эту секунду',i.activity,'full')}
        </div>
      </section>
      <section class="npc-section">
        ${sectionHead('look','02','Первое впечатление')}
        <div class="feature-grid">
          ${field('Внешность',l.feature)}
          ${field('Приметная деталь',l.dress)}
          ${field('Язык тела',l.gesture,'full')}
        </div>
      </section>
      <section class="npc-section">
        ${sectionHead('voice','03','Как отыгрывать')}
        <div class="feature-grid">
          ${field('Голос',v.pitch)}
          ${field('Ритм речи',v.tempo)}
          ${field('Фишка речи',v.quirk.title)}
          ${field('Как изобразить',v.quirk.hint)}
        </div>
        <blockquote class="voice-quote">«${esc(speechLine(npc))}»<span class="quote-caption">Первая реплика — пример звучания</span></blockquote>
      </section>
      <section class="npc-section">
        ${sectionHead('social','04','Что у него в голове')}
        <div class="feature-grid">
          ${field('Отношение к героям',s.attitude.first,'full')}
          ${field('Чего хочет',s.want)}
          ${field('Чего боится',s.fear)}
          ${field('Личная граница',s.principle,'full')}
        </div>
      </section>
      <section class="npc-section">
        ${sectionHead('intrigue','05','Крючки для истории')}
        <div class="feature-grid">
          ${field('Что скрывает (только мастеру)',q.secret,'full')}
          ${field('Что может дать героям',q.offer)}
          ${field('Слух или зацепка',q.lead)}
        </div>
      </section>
      <section class="npc-section" id="reactionsSection">
        <div class="section-head"><div class="section-heading"><span class="section-no">06</span><h3>А если герои…</h3></div></div>
        <div class="reaction-menu" id="reactionMenu">${ACTIONS.map(a=>`<button type="button" class="reaction-chip ${activeReaction===a.id?'active':''}" data-reaction="${a.id}" aria-pressed="${activeReaction===a.id}">${esc(a.label)}</button>`).join('')}</div>
        <div class="reaction-result" id="reactionResult">${reactionHtml(npc,activeReaction)}</div>
        <p class="dm-note">Это не жёсткий сценарий, а подсказка. Учитывай обстоятельства и предыдущие действия игроков.</p>
      </section>
      <section class="npc-section">
        <div class="section-head"><div class="section-heading"><span class="section-no">07</span><h3>Заметки мастера</h3></div></div>
        <textarea class="notes-area" id="npcNotes" placeholder="Что герои ему сказали? Что он обещал? Где появится снова?" aria-label="Заметки мастера">${esc(note)}</textarea>
        <p class="notes-caption">Заметки попадают в Markdown, архив и резервную копию JSON.</p>
      </section>`;
    const saved=state.saved.some(x=>x.id===npc.id);
    const save=el('saveBtn');
    save.innerHTML=saved?'★ Сохранён':'☆ Сохранить';
    save.classList.toggle('is-saved',saved);
    save.setAttribute('aria-pressed',String(saved));
  }
  function reactionHtml(npc,action){
    const a=ACTIONS.find(x=>x.id===action)||ACTIONS[0];
    const text=REACTIONS[a.id]?.[npc.social.attitude.id]||'Реагирует осторожно и пытается понять намерения героев.';
    let extension='';
    if(action==='help')extension=`<br><br><b>Лучший аргумент:</b> предложить помощь с его целью — ${esc(npc.social.want)}.`;
    if(action==='threat')extension=`<br><br><b>Красная черта:</b> ${esc(npc.social.principle)}`;
    if(action==='bribe')extension=`<br><br><b>Что действительно нужно:</b> ${esc(npc.social.want)}.`;
    if(action==='lie')extension=`<br><br><b>О чём может умолчать:</b> ${esc(npc.intrigue.secret)}.`;
    return `<b>${esc(a.label)}.</b> ${esc(text)}${extension}`;
  }
  function updateReactionUI(){
    const result=el('reactionResult');
    if(result) result.innerHTML=reactionHtml(state.current,activeReaction);
    document.querySelectorAll('[data-reaction]').forEach(btn=>{
      const yes=btn.dataset.reaction===activeReaction;
      btn.classList.toggle('active',yes);
      btn.setAttribute('aria-pressed',String(yes));
    });
  }
  function renderLibrary(){
    el('libraryCount').textContent=state.saved.length;
    const list=activeTab==='saved'?state.saved:state.history;
    const q=el('librarySearch').value.trim().toLocaleLowerCase('ru');
    const result=list.filter(n=>`${n.identity.name} ${D.roles[n.identity.roleKey].label} ${D.species[n.identity.speciesKey].label} ${n.notes||''}`.toLocaleLowerCase('ru').includes(q));
    el('libraryList').innerHTML=result.length?result.map(n=>{
      const role=D.roles[n.identity.roleKey];
      return `<div class="library-item"><div class="library-char" aria-hidden="true">${esc(nameInitials(n.identity.name))}</div><button type="button" class="library-link" data-load="${esc(n.id)}"><strong>${esc(n.identity.name)}</strong><small>${esc(role.label)} · ${esc(D.species[n.identity.speciesKey].label)}</small></button>${activeTab==='saved'?`<button class="library-delete" data-delete="${esc(n.id)}" type="button" aria-label="Удалить ${esc(n.identity.name)} из архива" title="Удалить из сохранённых">×</button>`:''}</div>`;
    }).join(''):`<div class="empty-state"><div class="empty-symbol">✧</div><strong>${q?'Ничего не найдено':activeTab==='saved'?'Пока никого нет':'История пуста'}</strong><p>${q?'Попробуй другое имя или профессию.':activeTab==='saved'?'Нажми «Сохранить» на понравившемся NPC.':'Здесь появятся предыдущие персонажи после генерации новых.'}</p></div>`;
    el('tabSaved').classList.toggle('active',activeTab==='saved');
    el('tabHistory').classList.toggle('active',activeTab==='history');
    el('tabSaved').setAttribute('aria-selected',String(activeTab==='saved'));
    el('tabHistory').setAttribute('aria-selected',String(activeTab==='history'));
    el('libraryList').setAttribute('aria-labelledby',activeTab==='saved'?'tabSaved':'tabHistory');
  }
  function renderAll(){renderCard();renderLibrary();}
  function toggleSaved(){
    if(!state.current)return;
    const id=state.current.id;
    if(state.saved.some(n=>n.id===id)) {state.saved=state.saved.filter(n=>n.id!==id);notify('Убрано из сохранённых');}
    else {state.saved.unshift(clone(state.current));notify('NPC добавлен в архив');}
    persist();renderAll();
  }
  function loadNpc(id){
    const match=[...state.saved,...state.history].find(n=>n.id===id);
    if(!match)return;
    if(state.current?.id!==id)addToHistory(state.current);
    state.current=clone(match);
    activeReaction='threat';persist();renderAll();
    el('characterCard').scrollIntoView({behavior:'smooth',block:'start'});
    notify('Персонаж загружен');
  }
  function plainExport(n){
    const i=n.identity,v=n.voice,s=n.social,q=n.intrigue;
    return `${i.name} — ${D.roles[i.roleKey].label}\n${D.species[i.speciesKey].label}, ${i.age}. ${D.scenes[i.sceneKey]?.label||''}.\nМанера: ${s.temperament}. Отношение: ${s.attitude.title}.\nРечь: ${v.tempo}; ${v.quirk.title}.\nХочет: ${s.want}. Скрывает: ${q.secret}.`;
  }
  function markdown(n){
    const {identity:i,look:l,voice:v,social:s,intrigue:q}=n;
    const reactions=ACTIONS.map(a=>`- **${a.label}:** ${REACTIONS[a.id]?.[s.attitude.id]||''}`).join('\n');
    return `# ${i.name}\n\n> ${D.roles[i.roleKey].label} · ${D.species[i.speciesKey].label} · ${i.age} · ${i.gender==='m'?'мужчина':'женщина'}\n\n**Место:** ${D.scenes[i.sceneKey]?.label} — ${i.sceneDetail}.  \n**Сейчас:** ${i.activity}.\n\n## Быстрый отыгрыш\n- **Манера:** ${s.temperament}\n- **К героям:** ${s.attitude.title}. ${s.attitude.first}\n- **Сиюминутная забота:** ${s.immediate}\n\n## Внешность и повадки\n- ${l.feature}\n- ${l.dress}\n- ${l.gesture}\n\n## Голос и речь\n- **Голос:** ${v.pitch}\n- **Темп:** ${v.tempo}\n- **Речевая особенность:** ${v.quirk.title} — ${v.quirk.hint}\n- **Пример фразы:** «${speechLine(n)}»\n\n## Мотивы\n- **Хочет:** ${s.want}\n- **Боится:** ${s.fear}\n- **Личная граница:** ${s.principle}\n\n## Зацепки (только мастеру)\n- **Скрывает:** ${q.secret}\n- **Может дать:** ${q.offer}\n- **Слух:** ${q.lead}\n\n## Реакции на героев\n${reactions}\n\n## Заметки мастера\n${(n.notes||'').trim()||'_Пока пусто_'}\n`;
  }
  async function copyText(value){
    try {
      if(!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      notify('Скопировано в буфер обмена');
    } catch(e) {
      const node=document.createElement('textarea');
      node.value=value;node.style.position='fixed';node.style.opacity='0';document.body.appendChild(node);node.focus();node.select();
      const ok=document.execCommand('copy');node.remove();
      notify(ok?'Скопировано в буфер обмена':'Не получилось скопировать. Используй экспорт .md');
    }
  }
  function downloadFile(filename,data,type){
    const blob=new Blob([data],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  function safeFileName(value){return String(value).replace(/[<>:"/\\|?*\x00-\x1f]/g,'').trim().replace(/\s+/g,'_').slice(0,75)||'NPC';}
  function exportJson(){
    const payload={app:'Кузница NPC',version:1,exportedAt:new Date().toISOString(),saved:state.saved};
    downloadFile('npc-forge-backup.json',JSON.stringify(payload,null,2),'application/json;charset=utf-8');
    notify(`Экспортировано NPC: ${state.saved.length}`);
  }
  async function importJson(file){
    if(!file)return;
    if(file.size>5*1024*1024){notify('Файл слишком большой (максимум 5 МБ)');return;}
    try {
      const data=JSON.parse(await file.text());
      const entries=(Array.isArray(data)?data:data.saved);
      if(!Array.isArray(entries))throw new Error('No saved array');
      const valid=entries.filter(isValidNpc);
      if(!valid.length){notify('В этом файле нет подходящих персонажей');return;}
      const before=state.saved.length;
      const map=new Map([...state.saved,...valid].map(n=>[n.id,n]));
      state.saved=Array.from(map.values()).slice(0,500);
      persist();activeTab='saved';renderLibrary();
      notify(`Импортировано: ${valid.length}, новых: ${Math.max(0,state.saved.length-before)}`);
    } catch(err){console.warn('Импорт не удался:',err);notify('Не удалось прочитать JSON базы');}
    el('importFile').value='';
  }
  function bindEvents(){
    el('generateBtn').addEventListener('click',generate);
    el('generateAgainBtn').addEventListener('click',generate);
    el('saveBtn').addEventListener('click',toggleSaved);
    el('copyBtn').addEventListener('click',()=>copyText(markdown(state.current)));
    el('mdBtn').addEventListener('click',()=>{downloadFile(safeFileName(state.current.identity.name)+'.md',markdown(state.current),'text/markdown;charset=utf-8');notify('Markdown-файл готов');});
    el('exportAllBtn').addEventListener('click',exportJson);
    el('importBtn').addEventListener('click',()=>el('importFile').click());
    el('importFile').addEventListener('change',e=>importJson(e.target.files?.[0]));
    el('tabSaved').addEventListener('click',()=>{activeTab='saved';renderLibrary();});
    el('tabHistory').addEventListener('click',()=>{activeTab='history';renderLibrary();});
    el('librarySearch').addEventListener('input',renderLibrary);
    el('characterCard').addEventListener('click',e=>{
      const reaction=e.target.closest('[data-reaction]');
      if(reaction){activeReaction=reaction.dataset.reaction;updateReactionUI();return;}
      const button=e.target.closest('[data-action]');
      if(!button)return;
      const part=button.dataset.part;
      if(button.dataset.action==='lock'){
        state.locks[part]=!state.locks[part];persist();renderCard();notify(state.locks[part]?'Часть NPC закреплена':'Закрепление снято');
      } else if(button.dataset.action==='reroll')rerollPart(part);
    });
    el('characterCard').addEventListener('input',e=>{
      if(e.target.id!=='npcNotes')return;
      state.current.notes=e.target.value;
      updateSavedIfPresent();persist();
    });
    el('libraryList').addEventListener('click',e=>{
      const remove=e.target.closest('[data-delete]');
      if(remove){
        const item=state.saved.find(n=>n.id===remove.dataset.delete);
        if(item && window.confirm(`Удалить «${item.identity.name}» из сохранённых?`)){
          state.saved=state.saved.filter(n=>n.id!==item.id);persist();renderAll();notify('Удалено из архива');
        }
        return;
      }
      const load=e.target.closest('[data-load]');
      if(load)loadNpc(load.dataset.load);
    });
    document.addEventListener('keydown',e=>{
      const node=e.target;
      if(e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||node?.matches('input, select, textarea, [contenteditable]'))return;
      if(e.code==='KeyN' || e.key.toLowerCase()==='n'){e.preventDefault();generate();}
    });
  }
  function init(){
    safeRead();setupFilters();bindEvents();
    if(!state.current)generate();
    else renderAll();
  }
  init();
})();
