/* ==========================================================
   ИЗОБРАЖЕНИЯ
   Все фото лежат в папке images/. Ключ — идентификатор Unsplash,
   значение — локальный путь. Если папка с картинками пуста
   (ещё не запускали download_images.py), сайт автоматически
   подгружает фото с Unsplash (REMOTE = true), поэтому он
   работает в любом случае.
   ========================================================== */
const IMG={
  'photo-1530267981375-f0de937f5f13':'images/tractor-1.jpg',
  'photo-1592982537447-7440770cbfc9':'images/tractor-2.jpg',
  'photo-1605338803155-8b0e6d8f2a73':'images/tractor-3.jpg',
  'photo-1574323347407-f5e1ad6d020b':'images/combine-1.jpg',
  'photo-1500382017468-9049fed747ef':'images/combine-2.jpg',
  'photo-1581092160562-40aa08e78837':'images/parts.jpg',
  'photo-1635784063388-1ff609e5d5f5':'images/oils.jpg',
  'photo-1464226184884-fa280b87c399':'images/crop-protection.jpg',
  'photo-1635784063388-1ff609e5d5f6':'images/01_tractor_field.png',
  'photo-1635784063388-1ff609e5d5f7':'images/02_combine_harvest.png',
  'photo-1635784063388-1ff609e5d5f8':'images/03_disc_harrow.png',
  'photo-1635784063388-1ff609e5d5f9':'images/04_telehandler_hay.png',
  'photo-1635784063388-1ff609e5d5f10':'images/05_self_propelled_sprayer.png',
  'photo-1497366216548-37526070297c':'images/office.jpg',   // фон блока «Офис UniShop» на странице контактов
  
};
let REMOTE=false;
const remoteUrl=(id,w=1200)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const U=id=>REMOTE?remoteUrl(id):IMG[id];   // U(id) — единая точка получения адреса картинки
// Если отдельная <img> не загрузилась локально — подменяем её на ссылку Unsplash
document.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&!t.dataset.fb){t.dataset.fb='1';const id=Object.keys(IMG).find(k=>t.src.endsWith(IMG[k]));if(id)t.src=remoteUrl(id)}},true);
/* ==========================================================
   UniShop — логика сайта (SPA, без сборки)
   Структура файла:
   1. Изображения           5. Каталог: фильтры, показать ещё
   2. Данные (категории,    6. Формы и карусель
      товары, партнёры)     7. Сравнение товаров
   3. Меню и переход между  8. Всплывающая форма заявки
      страницами
   4. Главная: плитки
   ========================================================== */

/* ----- Список страниц: [id секции, название в меню] ----- */
const pages=[['home','Главная'],['catalog','Каталог'],['service','Сервис и замена'],['about','О компании'],['delivery','Доставка и оплата'],['contacts','Контакты']];

/* ==========================================================
   ДАННЫЕ КАТАЛОГА
   CK — ключи категорий (первые 5 — категории каталога,
   «service» — плитка на главной, ведёт на страницу сервиса).
   I  — короткие имена картинок (значения — id из блока IMG).
   ========================================================== */
const CK=['tractors','combines','parts','oils','szr','service'];
const I={tr:'photo-1530267981375-f0de937f5f13',tr2:'photo-1592982537447-7440770cbfc9',tr3:'photo-1605338803155-8b0e6d8f2a73',cb:'photo-1574323347407-f5e1ad6d020b',cb2:'photo-1500382017468-9049fed747ef',pt:'photo-1581092160562-40aa08e78837',oil:'photo-1635784063388-1ff609e5d5f5',sz:'photo-1464226184884-fa280b87c399'};

/* CAT — описание категорий: название (t), метка на карточке (tag),
   описание плитки (d), картинка (i) и список фильтров (f).
   Фильтр: k — ключ атрибута товара, l — подпись, o — список значений.
   Если o не задан, значения собираются из товаров автоматически. */
const CAT={
 tractors:{t:'Тракторы и навесное оборудование',tag:'Тракторы',d:'Мини, средние и мощные тракторы',i:I.tr,f:[{k:'g',l:'Группа',o:['Мини и малые','Средние','Мощные']},{k:'p',l:'Мощность',o:['до 50 л.с.','55–140 л.с.','160–260+ л.с.']},{k:'b',l:'Бренд'}]},
 combines:{t:'Комбайны и посевная техника',tag:'Комбайны',d:'Комбайны и посевные комплексы',i:I.cb,f:[{k:'k',l:'Класс',o:['Малые хозяйства','Средние','Крупные','Очень крупные']},{k:'w',l:'Ширина жатки',o:['до 3 м','4–6 м','5–7 м','от 8 м']},{k:'b',l:'Бренд'}]},
 parts:{t:'Запчасти и расходники',tag:'Запчасти',d:'Фильтры, сцепление, гидравлика, ремни',i:I.pt,f:[{k:'t',l:'Тип детали',o:['Фильтры','Двигатель','Трансмиссия и сцепление','Гидравлика','Ходовая часть','Ремни','Режущие элементы']},{k:'m',l:'Для техники',o:['Тракторы','Комбайны','Универсальные']},{k:'b',l:'Совместимость'}]},
 oils:{t:'Масла и смазки',tag:'Масла',d:'Моторные, трансмиссионные, гидравлические',i:I.oil,f:[{k:'t',l:'Тип',o:['Моторные','Трансмиссионные','Гидравлические','Пластичные смазки','Охлаждающие жидкости']},{k:'v',l:'Фасовка',o:['10 л','20 л','205 л','18 кг']}]},
 szr:{t:'Средства защиты растений',tag:'СЗР',d:'Гербициды, фунгициды, инсектициды, протравители',i:I.sz,f:[{k:'g',l:'Группа',o:['Гербициды','Фунгициды','Инсектициды','Протравители','Регуляторы и десиканты','Адъюванты']},{k:'c',l:'Культура',o:['Пшеница','Кукуруза','Подсолнечник','Соя','Рапс','Свёкла','Картофель']},{k:'pr',l:'Проблема',o:['Сорняки','Болезни','Вредители','Полегание и уборка']},{k:'ph',l:'Фаза применения',o:['До посева','До всходов','По вегетации','Перед уборкой']},{k:'ds',l:'Действующее вещество'},{k:'b',l:'Производитель'}]}
};

// Короткая фабрика товара: категория, название, картинка, строки характеристик, атрибуты для фильтров
const P=(c,n,i,s,a)=>({c,n,i,s,a});
/* ----- ТОВАРЫ. Чтобы добавить позицию — скопируйте любую строку P(...) и поправьте.
   В объекте атрибутов (последний аргумент) ключи должны совпадать с k в фильтрах категории.
   Значение может быть строкой, массивом или 'all' (подходит под любой выбор фильтра). ----- */
const products=[
 P('tractors','Трактор YTO NLX1404',I.tr,['Средний класс','140 л.с.','Популярная модель'],{g:'Средние',p:'55–140 л.с.',b:'YTO'}),
 P('tractors','Трактор Weichai Lovol 2604',I.tr2,['Мощный','260 л.с.','Комфортная кабина'],{g:'Мощные',p:'160–260+ л.с.',b:'Lovol'}),
 P('tractors','Трактор Dongfeng DF-504',I.tr3,['Малый класс','50 л.с.','Полный привод'],{g:'Мини и малые',p:'до 50 л.с.',b:'Dongfeng'}),
 P('combines','Комбайн Lovol GK120 PRO',I.cb,['Производительность 1–2 га/ч'],{k:'Средние',b:'Lovol'}),
 P('combines','Комбайн Zoomlion TF220',I.cb2,['Флагман','530 л.с.','Жатка 9.2 м'],{k:'Очень крупные',w:'от 8 м',b:'Zoomlion'}),
 P('parts','Фильтр масляный двигателя',I.pt,['Для двигателей YTO','Оригинал и аналоги'],{t:'Фильтры',m:'Тракторы',b:'YTO'}),
 P('parts','Фильтр топливный тонкой очистки',I.pt,['Для тракторов Lovol','Оригинал и аналоги'],{t:'Фильтры',m:'Тракторы',b:'Lovol'}),
 P('parts','Фильтр воздушный (комплект)',I.pt,['Для комбайнов Zoomlion','Основной и контрольный элемент'],{t:'Фильтры',m:'Комбайны',b:'Zoomlion'}),
 P('parts','Фильтр гидравлический',I.pt,['Для тракторов Dongfeng','Оригинал и аналоги'],{t:'Фильтры',m:'Тракторы',b:'Dongfeng'}),
 P('parts','Диск сцепления',I.pt,['Для тракторов YTO','Подбор по модели'],{t:'Трансмиссия и сцепление',m:'Тракторы',b:'YTO'}),
 P('parts','Гидронасос шестерённый',I.pt,['Для тракторов Lovol','Подбор по модели'],{t:'Гидравлика',m:'Тракторы',b:'Lovol'}),
 P('parts','Форсунка топливная',I.pt,['Для двигателей YTO','Подбор по модели'],{t:'Двигатель',m:'Тракторы',b:'YTO'}),
 P('parts','Ремень приводной клиновой',I.pt,['Для комбайнов Lovol','Подбор по модели'],{t:'Ремни',m:'Комбайны',b:'Lovol'}),
 P('parts','Сегмент ножа жатки',I.pt,['Для комбайнов Zoomlion','Режущий аппарат'],{t:'Режущие элементы',m:'Комбайны',b:'Zoomlion'}),
 P('parts','Подшипник ступицы',I.pt,['Ходовая часть','Подбор по размеру'],{t:'Ходовая часть',m:'Универсальные',b:'Универсальные'}),
 P('oils','Моторное масло 15W-40 CK-4',I.oil,['Для дизельных двигателей','Канистра 20 л'],{t:'Моторные',v:'20 л'}),
 P('oils','Моторное масло 10W-40 CI-4',I.oil,['Для дизельных двигателей','Бочка 205 л'],{t:'Моторные',v:'205 л'}),
 P('oils','Трансмиссионно-гидравлическое UTTO 10W-30',I.oil,['КПП, мосты и гидросистема','Канистра 20 л'],{t:'Трансмиссионные',v:'20 л'}),
 P('oils','Трансмиссионное масло 80W-90 GL-5',I.oil,['Мосты и редукторы','Канистра 20 л'],{t:'Трансмиссионные',v:'20 л'}),
 P('oils','Гидравлическое масло HLP 46',I.oil,['Гидросистемы техники','Канистра 20 л'],{t:'Гидравлические',v:'20 л'}),
 P('oils','Гидравлическое масло HVLP 32',I.oil,['Для работы при низких температурах','Бочка 205 л'],{t:'Гидравлические',v:'205 л'}),
 P('oils','Смазка литиевая EP-2',I.oil,['Подшипники и шарниры','Ведро 18 кг'],{t:'Пластичные смазки',v:'18 кг'}),
 P('oils','Смазка с дисульфидом молибдена',I.oil,['Узлы с высокой нагрузкой','Ведро 18 кг'],{t:'Пластичные смазки',v:'18 кг'}),
 P('oils','Антифриз-концентрат',I.oil,['Система охлаждения','Канистра 10 л'],{t:'Охлаждающие жидкости',v:'10 л'}),
 P('szr','Амистар Экстра, СК',I.sz,['Азоксистробин 200 г/л + ципроконазол 80 г/л','Канистра 5 л','Норма расхода 0,5–1,0 л/га'],{g:'Фунгициды',c:['Пшеница','Подсолнечник','Соя'],pr:'Болезни',ph:'По вегетации',ds:['Азоксистробин','Ципроконазол'],b:'Syngenta'}),
 P('szr','Топик, КЭ',I.sz,['Клодинафоп-пропаргил 80 г/л','Послевсходовый, против злаковых сорняков'],{g:'Гербициды',c:['Пшеница'],pr:'Сорняки',ph:'По вегетации',ds:['Клодинафоп-пропаргил'],b:'Syngenta'}),
 P('szr','Карате Зеон, МКС',I.sz,['Лямбда-цигалотрин 50 г/л','Контактно-кишечное действие'],{g:'Инсектициды',c:['Пшеница','Подсолнечник','Рапс','Соя','Картофель'],pr:'Вредители',ph:'По вегетации',ds:['Лямбда-цигалотрин'],b:'Syngenta'}),
 P('szr','Селест Топ, КС',I.sz,['Тиаметоксам + дифеноконазол + флудиоксонил','Инсектофунгицидный протравитель'],{g:'Протравители',c:['Пшеница'],pr:'Болезни',ph:'До посева',ds:['Тиаметоксам','Дифеноконазол','Флудиоксонил'],b:'Syngenta'}),
 P('szr','Моддус, КЭ',I.sz,['Тринексапак-этил 250 г/л','Ретардант против полегания'],{g:'Регуляторы и десиканты',c:['Пшеница'],pr:'Полегание и уборка',ph:'По вегетации',ds:['Тринексапак-этил'],b:'Syngenta'}),
 P('szr','Реглон Супер, ВР',I.sz,['Дикват 150 г/л','Десикант для подсушивания на корню'],{g:'Регуляторы и десиканты',c:['Подсолнечник','Соя','Рапс','Картофель'],pr:'Полегание и уборка',ph:'Перед уборкой',ds:['Дикват'],b:'Syngenta'}),
 P('szr','Глифосат 500, ВР',I.sz,['Глифосат 500 г/л','Сплошное действие, очистка полей'],{g:'Гербициды',c:'all',pr:'Сорняки',ph:['До посева','Перед уборкой'],ds:['Глифосат'],b:'Wynca'}),
 P('szr','Тебуконазол 250, КЭ',I.sz,['Тебуконазол 250 г/л (аналог)','Защита листа и колоса'],{g:'Фунгициды',c:['Пшеница','Рапс'],pr:'Болезни',ph:'По вегетации',ds:['Тебуконазол'],b:'ADAMA'}),
 P('szr','Прилипатель-адъювант',I.sz,['Улучшает смачивание и удержание','Для баковых смесей'],{g:'Адъюванты',c:'all',pr:'all',ph:'По вегетации',ds:'all',b:'ADAMA'})
];

// Плитки категорий на главной: [название, id картинки]
const cats=[['Тракторы и навесное','photo-1530267981375-f0de937f5f13'],['Комбайны и посевная','photo-1574323347407-f5e1ad6d020b'],['Запчасти','photo-1581092160562-40aa08e78837'],['Масла','photo-1635784063388-1ff609e5d5f5'],['Средства защиты растений (СЗР)','photo-1464226184884-fa280b87c399'],['Сервис и ремонт','photo-1592982537447-7440770cbfc9']];
// Партнёры для страницы «О компании»
const partners=[['YTO Group','Старейший завод тракторостроения Китая.'],['Weichai Lovol','Лидер продаж на рынке 14 лет подряд.'],['Zoomlion','Флагманские комбайны и тяжёлая техника.'],['Dongfeng','Компактные тракторы с полным приводом.'],['Changfa','Надёжные двигатели и малая техника.'],['Shifeng','Навесное и почвообрабатывающее оборудование.'],['ADAMA','Производитель средств защиты растений.'],['Syngenta','Мировой лидер в агрохимии.'],['Wynca','Химические решения для защиты урожая.']];

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ==========================================================
   НАВИГАЦИЯ И ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ
   Меню строится из массива pages. go(id) плавно гасит текущую
   страницу, swap(id) переключает секции и обновляет шапку,
   баннер, hash в адресной строке и мобильное меню.
   ========================================================== */
// навигация
const link=(id,l,cls)=>`<button data-go="${id}" class="nav-link ${cls}">${l}</button>`;
$('#nav-desktop').innerHTML=pages.map(([i,l])=>link(i,l,'py-2 border-b-2 border-transparent font-semibold hover:text-grain')).join('');
$('#nav-mobile').innerHTML=pages.map(([i,l])=>link(i,l,'text-left py-3 border-b border-white/10 font-semibold')).join('');
// swap: мгновенное переключение активной страницы
function swap(id){
  if(!pages.some(p=>p[0]===id))id='home';
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  $$('.nav-link').forEach(b=>b.classList.toggle('on',b.dataset.go===id));
  bar();
  
  
  $('#hero').classList.toggle('hidden',id!=='home');
  $('#banner').classList.toggle('hidden',id==='home');
  $('#banner-t').textContent=pages.find(p=>p[0]===id)[1];
  if(id==='home')count();
  $('#nav-mobile').classList.add('hidden');$('#nav-mobile').classList.remove('flex');
  $('#burger').setAttribute('aria-expanded','false');
  history.replaceState(null,'','#'+id);window.scrollTo({top:0,behavior:'smooth'});
}
// go: плавный переход (затухание 230 мс → swap → появление)
function go(id,first){
  const cur=$('.page.active');
  window.scrollTo({top:0,behavior:'smooth'});
  if(first||!cur||cur.id===id){swap(id);return}
  cur.classList.add('out');
  setTimeout(()=>{cur.classList.remove('out');swap(id)},230);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){e.preventDefault();if(b.dataset.c)selCat(b.dataset.c);go(b.dataset.go)}});
$('#burger').onclick=function(){const m=$('#nav-mobile'),o=m.classList.toggle('hidden');m.classList.toggle('flex',!o);this.setAttribute('aria-expanded',String(!o))};

// категории и партнёры
function paintCats(){$('#cats').innerHTML=cats.map(([n,i],x)=>`<button ${x<5?`data-go="catalog" data-c="${CK[x]}"`:'data-go="service"'} class="group text-left"><span class="block overflow-hidden"><img src="${U(i)}" alt="${n}" loading="lazy" class="h-52 w-full object-cover group-hover:scale-105 transition duration-500"></span><b class="block mt-3 text-lg font-semibold">${n}</b><span class="block text-grain text-sm font-semibold mt-1">Подробнее</span></button>`).join('');}
paintCats();
$('#partners').innerHTML=partners.map(([n,d])=>`<article class="p-5 border rounded hover:border-grain hover:shadow-md transition"><h3 class="font-head text-xl text-pine">${n}</h3><p class="text-gray-600 mt-1">${d}</p></article>`).join('');

/* ==========================================================
   КАТАЛОГ
   st    — состояние: выбранная категория, фильтры, сколько товаров показано.
   cmp   — набор названий товаров для сравнения (не более 3).
   Логика фильтра: внутри одного фильтра значения объединяются по «или»,
   разные фильтры — по «и». Показывается по 6 товаров;
   «Показать ещё» +6, «Показать все», «Скрыть все» — назад к 6.
   ========================================================== */
// каталог
const cmp=new Set();let st={cat:null,f:{},n:6};
const uniq=k=>[...new Set(products.filter(p=>p.c===st.cat).flatMap(p=>[].concat(p.a[k])).filter(v=>v&&v!=='all'))];
const match=p=>CAT[p.c].f.every(f=>{const sel=st.f[f.k];if(!sel||!sel.size)return true;const v=p.a[f.k];return v==='all'||[].concat(v).some(x=>sel.has(x))});
const card=p=>`<article class="border rounded overflow-hidden flex flex-col bg-white"><img src="${U(p.i)}" alt="${p.n}" loading="lazy" class="h-44 w-full object-cover"><div class="p-4 flex flex-col flex-1"><span class="self-start text-xs font-bold bg-grain/20 text-pine px-2 py-1 rounded">${CAT[p.c].tag}</span><h3 class="font-bold text-lg mt-2">${p.n}</h3><ul class="text-sm text-gray-600 mt-2 space-y-1 flex-1">${p.s.map(x=>`<li>• ${x}</li>`).join('')}</ul><p class="font-head text-xl text-pine mt-3">По запросу</p><div class="flex gap-2 mt-3"><button data-open="modal" class="flex-1 bg-pine text-white text-sm font-bold py-2 rounded">Оставить заявку</button><button data-cmp="${p.n}" aria-pressed="${cmp.has(p.n)}" class="border border-pine text-pine text-sm px-3 py-2 rounded ${cmp.has(p.n)?'bg-grain':''}">Сравнить</button></div></div></article>`;
function paintTiles(){$('#cat-tiles').innerHTML=CK.slice(0,5).map(k=>`<button data-c="${k}" class="group text-left"><span class="block overflow-hidden"><img src="${U(CAT[k].i)}" alt="${CAT[k].t}" loading="lazy" class="h-52 w-full object-cover group-hover:scale-105 transition duration-500"></span><b class="block mt-3 text-lg font-semibold">${CAT[k].t}</b><span class="block text-sm text-gray-500">${CAT[k].d}</span><span class="block text-grain text-sm font-semibold mt-1">Выбрать · ${products.filter(p=>p.c===k).length} поз.</span></button>`).join('');}
paintTiles();
// buildF: рисует панель фильтров выбранной категории
function buildF(){
  $('#filters').innerHTML=CAT[st.cat].f.map(f=>`<fieldset><legend class="font-bold mb-2">${f.l}</legend><div class="flex flex-wrap gap-2">${(f.o||uniq(f.k)).map(v=>`<button data-k="${f.k}" data-v="${v}" aria-pressed="false" class="chip border rounded-full px-3 py-1 text-sm">${v}</button>`).join('')}</div></fieldset>`).join('')+'<button id="reset" class="text-sm underline text-pine">Сбросить фильтры</button>';
}
// render: отбирает товары по фильтрам, рисует сетку и кнопки «Показать ещё / все / Скрыть все»
function render(){
  const list=products.filter(p=>p.c===st.cat&&match(p));
  $('#count').textContent=`Найдено: ${list.length}`;
  $('#grid').innerHTML=list.length?list.slice(0,st.n).map(card).join(''):'<p class="col-span-full text-gray-600">Ничего не найдено. Сбросьте фильтры.</p>';
  const b='px-6 py-3 rounded font-semibold text-sm';
  $('#more').innerHTML=list.length>st.n?`<button data-act="more" class="${b} bg-pine text-white hover:bg-grain hover:text-graphite">Показать ещё</button><button data-act="all" class="${b} border border-pine text-pine hover:bg-pine hover:text-white">Показать все (${list.length})</button>`:list.length>6?`<button data-act="less" class="${b} border border-pine text-pine hover:bg-pine hover:text-white">Скрыть все</button>`:'';
  bar();
}
// selCat: открыть категорию (вызывается и с плиток на главной); showPick: вернуться к выбору категории
function selCat(k){if(!CAT[k])return;st={cat:k,f:{},n:6};$('#cat-title').textContent=CAT[k].t;buildF();$('#cat-pick').classList.add('hidden');$('#cat-view').classList.remove('hidden');render()}
function showPick(){$('#cat-view').classList.add('hidden');$('#cat-pick').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
document.addEventListener('click',e=>{
  const c=e.target.closest('.chip');
  if(c){const k=c.dataset.k,v=c.dataset.v,s=st.f[k]||(st.f[k]=new Set());s.has(v)?s.delete(v):s.add(v);c.classList.toggle('on',s.has(v));c.setAttribute('aria-pressed',s.has(v));st.n=6;render()}
  const m=e.target.closest('[data-cmp]');
  if(m){const n=m.dataset.cmp;if(cmp.has(n))cmp.delete(n);else if(cmp.size>=3)toast('Можно сравнить не более 3 товаров');else cmp.add(n);render()}
  const t=e.target.closest('#cat-tiles [data-c]');if(t)selCat(t.dataset.c);
  const a=e.target.closest('[data-act]');
  if(a){const x=a.dataset.act;st.n=x==='more'?st.n+6:x==='all'?1e9:6;render();if(x==='less')$('#grid').scrollIntoView({behavior:'smooth',block:'center'})}
  if(e.target.closest('#reset')){st.f={};st.n=6;$$('.chip').forEach(q=>{q.classList.remove('on');q.setAttribute('aria-pressed','false')});render()}
  if(e.target.closest('#back'))showPick();
});

/* ==========================================================
   ФОРМЫ
   Сейчас форма только проверяет обязательные поля и показывает
   сообщение. Чтобы отправлять заявки, замените тело обработчика
   на fetch(...) к вашему серверу, Formspree, Telegram-боту и т. п.
   ========================================================== */
// формы
$$('form.lead').forEach(f=>f.addEventListener('submit',e=>{
  e.preventDefault();const m=$('.msg',f);
  const bad=$$('[required]',f).find(i=>!i.value.trim());
  if(bad){m.textContent='Заполните обязательные поля.';bad.focus();return}
  m.textContent='Заявка принята. Мы свяжемся с вами в ближайшее время.';f.reset();
}));

/* ----- Бегущая строка с партнёрами и счётчики цифр на главной ----- */
const mqh=partners.map(p=>`<span>${p[0]}</span><span class="text-white/40">✦</span>`).join('');
$('#mq').innerHTML=mqh+mqh;
function count(){$$('[data-n]').forEach(el=>{const t=+el.dataset.n;let s=null;const step=ts=>{s=s||ts;const k=Math.min((ts-s)/1400,1);el.textContent=Math.round(t*k);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
/* ==========================================================
   КАРУСЕЛЬ В ШАПКЕ ГЛАВНОЙ: автосмена каждые 6 с, стрелки, точки.
   При включённом «уменьшить движение» автосмена отключается.
   ========================================================== */
const slideIds=['photo-1635784063388-1ff609e5d5f10','photo-1635784063388-1ff609e5d5f6','photo-1635784063388-1ff609e5d5f7','photo-1635784063388-1ff609e5d5f8','photo-1635784063388-1ff609e5d5f9'];
function paintSlides(){$('#slides').innerHTML=slideIds.map(id=>`<div class="slide" style="background-image:url('${U(id)}')"></div>`).join('')}
// Баннер: фон задаётся через CSS-переменную --bg, а относительные пути в переменных
// браузер считает от файла css/style.css (получилось бы css/images/...).
// Поэтому превращаем путь в полный адрес относительно страницы.
function paintBanner(){const u=new URL(U('photo-1635784063388-1ff609e5d5f6'),document.baseURI).href;$('#banner').style.setProperty('--bg',`url('${u}')`)}
// Фон блока «Офис UniShop» (страница «Контакты»)
function paintOffice(){$('#office').style.backgroundImage=`url('${U('photo-1497366216548-37526070297c')}')`}
paintSlides();paintBanner();paintOffice();
$('#dots').innerHTML=slideIds.map((_,i)=>`<button class="dot" data-i="${i}" aria-label="Фото ${i+1}"></button>`).join('');
let cur=0,timer;
function show(i){const sl=$$('.slide'),d=$$('.dot');cur=(i+sl.length)%sl.length;sl.forEach((e,k)=>e.classList.toggle('on',k===cur));d.forEach((e,k)=>e.classList.toggle('on',k===cur))}
function auto(){clearInterval(timer);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)timer=setInterval(()=>show(cur+1),6000)}
$('#next').onclick=()=>{show(cur+1);auto()};
$('#prev').onclick=()=>{show(cur-1);auto()};
$('#dots').onclick=e=>{const b=e.target.closest('[data-i]');if(b){show(+b.dataset.i);auto()}};
show(0);auto();
// Шапка: прозрачная вверху страницы, тёмная при прокрутке
const hdr=$('#hdr'),sc=()=>hdr.classList.toggle('sc',scrollY>50);addEventListener('scroll',sc,{passive:true});sc();
/* ==========================================================
   СРАВНЕНИЕ ТОВАРОВ: нижняя панель, лимит 3 товара, таблица в окне
   ========================================================== */
const byName=n=>products.find(p=>p.n===n);
function bar(){
  const on=$('#catalog').classList.contains('active')&&cmp.size>0;
  $('#cmpbar').classList.toggle('hidden',!on);
  document.body.style.paddingBottom=on?'64px':'';
  $('#cmp-n').textContent=cmp.size;
  $('#cmp-items').innerHTML=[...cmp].map(n=>`<span class="bg-white/10 rounded px-3 py-1 text-sm flex items-center gap-2">${n}<button data-rm="${n}" aria-label="Убрать ${n}" class="text-lg leading-none hover:text-grain">×</button></span>`).join('');
  $('#cmp-go').disabled=cmp.size<2;
}
let tt;function toast(t){const el=$('#toast');el.textContent=t;el.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>el.style.opacity=0,2200)}
function cmpTable(){
  const ps=[...cmp].map(byName),labels=[];
  ps.forEach(p=>CAT[p.c].f.forEach(f=>{if(!labels.some(l=>l.l===f.l))labels.push(f)}));
  const val=(p,f)=>{const g=CAT[p.c].f.find(x=>x.l===f.l);if(!g)return '—';const v=p.a[g.k];return v==null?'—':v==='all'?'Любые':[].concat(v).join(', ')};
  const th='class="text-left align-top p-3 bg-gray-100 font-semibold w-40 border-b"',td='class="align-top p-3 border-b"';
  const row=(l,f)=>`<tr><th ${th}>${l}</th>${ps.map(p=>`<td ${td}>${f(p)}</td>`).join('')}</tr>`;
  $('#cmpm-body').innerHTML='<table class="w-full text-sm min-w-[560px]"><tbody>'
   +row('',p=>`<img src="${U(p.i)}" alt="" class="h-28 w-full object-cover mb-2"><b>${p.n}</b><br><button data-rm="${p.n}" class="text-xs underline text-gray-500">Убрать</button>`)
   +row('Категория',p=>CAT[p.c].tag)
   +labels.map(f=>row(f.l,p=>val(p,f))).join('')
   +row('Характеристики',p=>`<ul class="space-y-1">${p.s.map(x=>`<li>• ${x}</li>`).join('')}</ul>`)
   +row('Цена',()=>'<b class="text-pine">По запросу</b>')
   +row('',()=>'<button data-open="modal" class="bg-pine text-white font-bold px-4 py-2 rounded text-sm">Оставить заявку</button>')
   +'</tbody></table>';
}
function openCmp(){cmpTable();$('#cmpm').classList.remove('hidden');$('#cmpm').classList.add('flex');document.body.style.overflow='hidden'}
function closeCmp(){$('#cmpm').classList.add('hidden');$('#cmpm').classList.remove('flex');document.body.style.overflow=''}
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-rm]');
  if(r){cmp.delete(r.dataset.rm);if(st.cat)render();bar();if(!$('#cmpm').classList.contains('hidden')){cmp.size<2?closeCmp():cmpTable()}}
  if(e.target.closest('#cmp-go')&&cmp.size>=2)openCmp();
  if(e.target.closest('#cmp-clear')){cmp.clear();if(st.cat)render();bar()}
  if(e.target.id==='cmpm-bg'||e.target.closest('#cmpm-x'))closeCmp();
});
addEventListener('keydown',e=>{if(e.key==='Escape')closeCmp()});
// Проверяем, есть ли локальные картинки. Нет — переключаемся на Unsplash и перерисовываем.
function paintAll(){paintCats();paintTiles();paintSlides();show(cur);paintBanner();paintOffice();if(st.cat)render()}
const probe=new Image();
probe.onerror=()=>{REMOTE=true;console.warn('Папка images/ пуста: запустите download_images.py, чтобы фото работали локально.');paintAll()};
probe.src=IMG['photo-1530267981375-f0de937f5f13'];

/* ==========================================================
   ВСПЛЫВАЮЩАЯ ФОРМА ЗАЯВКИ — открывается любым элементом с data-open="modal"
   Закрытие: крестик, клик по фону, Esc.
   ========================================================== */
const modal=$('#modal');
function openM(){modal.classList.remove('hidden');modal.classList.add('flex','open');document.body.style.overflow='hidden';$('input',modal).focus()}
function closeM(){modal.classList.add('hidden');modal.classList.remove('flex','open');document.body.style.overflow='';$('.msg',modal).textContent=''}
document.addEventListener('click',e=>{if(e.target.closest('[data-open]'))openM();else if(e.target.id==='m-bg'||e.target.closest('#m-x'))closeM()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
$('#m-box').addEventListener('submit',()=>setTimeout(()=>{if($('.msg',modal).textContent.startsWith('Заявка'))closeM()},1800));
go(location.hash.slice(1)||'home',true);