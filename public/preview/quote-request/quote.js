const groups = [
  ['الشعار', ['تصميم شعار جديد','تطوير شعار موجود','إعادة رسم الشعار','إعداد نسخ الشعار']],
  ['الهوية البصرية', ['هوية بصرية متكاملة','هوية لشعار موجود','تحديد الألوان والخطوط','عناصر الهوية','دليل استخدام الهوية','مراجعة الهوية']],
  ['الملفات والعروض', ['ملف تعريفي','تحديث ملف تعريفي','صفحة تعريفية','بورتفوليو','عرض تقديمي','عرض للمستثمرين','قالب PowerPoint','قالب عرض سعر','تقرير أو كتيّب']],
  ['المطبوعات والدعاية', ['بوستر','بروشور','فلاير','كارت شخصي','ورق مراسلات','ظرف','منيو','كتالوج','لافتة','رول أب','جرافيك معارض','شهادات ودعوات','تصميم للزي أو السيارات']],
  ['التغليف', ['ملصق منتج','تصميم عبوة','تطبيق تصميم على مقاسات أو نكهات','كروت وملصقات شحن','موك أب للمنتج','تجهيز العبوة للطباعة']],
  ['السوشيال والإعلانات', ['بوست','ستوري','تكييف تصميم لمقاس إضافي','كاروسيل','إعلان رقمي','أغلفة حسابات','أغلفة ريلز ويوتيوب','قوالب سوشيال','حملة إطلاق','بنرات متجر وصور منتجات']],
  ['تصميمات متخصصة', ['إنفوجرافيك','أيقونات ورسوم توضيحية','كتابة عربية مخصصة','تحريك شعار','موشن قصير','معالجة صور','تصميم واجهة','تجهيز ملف للطباعة','إخراج نسخة بلغة تانية']],
];
const identityCore = ['تصميم شعار جديد','إعداد نسخ الشعار','تحديد الألوان والخطوط','عناصر الهوية','دليل استخدام الهوية'];
const eligible = ['كارت شخصي','ورق مراسلات','ظرف','بوست','ستوري','منيو'];
const packages = [
  {name:'تأسيس هوية بصرية', detail:'الشعار ونظام الهوية + ٥ تطبيقات قياسية تختارها.', items:[...identityCore,...eligible.slice(0,5)]},
  {name:'تقديم الشركة', detail:'ملف تعريفي وصفحة تعريفية وعرض تقديمي.', items:['ملف تعريفي','صفحة تعريفية','عرض تقديمي']},
  {name:'حملة دعائية', detail:'بوستر وبروشور وبوست بنفس الفكرة.', items:['بوستر','بروشور','بوست']},
];
const byId = id => document.getElementById(id);
const selected = new Set();
const search = byId('search');
let openCategory = null;
const number = new Intl.NumberFormat('ar-EG');
const normalize = value => value.trim().toLowerCase().replace(/[اأإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[\u064B-\u065F]/g,'').replace(/بروشور/g,'برشور');

const selectionGroups = () => groups.map(([title,items]) => [title,items.filter(item=>selected.has(item))]).filter(([,items])=>items.length);

byId('packages').innerHTML = packages.map((pack,i) => `<button class="package" type="button" data-package="${i}" aria-pressed="false"><strong>${pack.name}</strong><small>${pack.detail}</small><span>اختار بنود الباقة +</span></button>`).join('');
const categoryExamples = [
  'شعار جديد، تطوير شعار، ملفات فيكتور',
  'ألوان وخطوط، عناصر الهوية، دليل الاستخدام',
  'ملف تعريفي، بورتفوليو، PowerPoint',
  'بوستر، بروشور، منيو',
  'ملصق منتج، علبة، موك أب',
  'بوست، ستوري، كاروسيل',
  'إنفوجرافيك، موشن، معالجة صور',
];
byId('catalog').innerHTML = groups.map(([name,items],index) => `
  <section class="group" data-category="${name}"><h3 class="group-head">
    <button class="category-trigger" type="button" aria-expanded="false" aria-controls="services-${index}">
      <span><strong>${name}</strong><small>${categoryExamples[index]}</small></span>
      <span class="chevron" aria-hidden="true">⌄</span>
    </button></h3>
  <div class="items" id="services-${index}" hidden>${items.map(item => `
    <div class="entry"><label class="choice">
      <input type="checkbox" value="${item}"><span><strong>${item}</strong></span>
    </label></div>`).join('')}</div></section>`).join('');
const boxes = [...byId('catalog').querySelectorAll('input[type=checkbox]')];
const sections = [...byId('catalog').querySelectorAll('.group')];
const packageButtons = [...byId('packages').querySelectorAll('button')];
const chosen = byId('selected');
const status = byId('download-status');

function renderSelection() {
  for (const box of boxes) {
    box.checked = selected.has(box.value);
  }
  for (const [i,button] of packageButtons.entries()) {
    const active = packages[i].items.every(item=>selected.has(item));
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('span').textContent = active ? 'البنود مختارة ✓' : 'اختار بنود الباقة +';
  }
  chosen.replaceChildren(...selectionGroups().flatMap(([,items]) => items.map(item => {
    const li = document.createElement('li');
    li.textContent = item;
    return li;
  })));
  const count = selected.size;
  byId('count').textContent = count ? number.format(count) + ' من الخدمات مختارة' : 'علّم على الخدمات اللي محتاجها.';
  for (const id of ['selected','clear','mobile-jump','send-brief']) byId(id).hidden = !count;
  byId('mobile-count').textContent = number.format(count) + ' خدمات مختارة';
  byId('download').disabled = !count;
  status.hidden = true;
}

byId('catalog').addEventListener('change', event => {
  const control = event.target;
  if (control.checked) selected.add(control.value);
  else selected.delete(control.value);
  renderSelection();
});
byId('packages').addEventListener('click', event => {
  const button = event.target.closest('[data-package]');
  if (!button) return;
  for (const item of packages[Number(button.dataset.package)].items) selected.add(item);
  renderSelection();
});
byId('clear').addEventListener('click', () => {
  selected.clear();
  renderSelection();
});
function filterCatalog() {
  const query = normalize(search.value);
  for (const section of sections) {
    const title = section.dataset.category;
    const categoryMatch = normalize(title).includes(query);
    const entries = [...section.querySelectorAll('.entry')];
    for (const entry of entries) entry.hidden = !categoryMatch && !normalize(entry.querySelector('input').value).includes(query);
    section.hidden = entries.every(entry=>entry.hidden);
    const expanded = openCategory === title || Boolean(query && !section.hidden);
    section.querySelector('.category-trigger').setAttribute('aria-expanded',String(expanded));
    section.querySelector('.items').hidden = !expanded;
  }
  byId('empty-search').hidden = sections.some(section=>!section.hidden);
}
byId('catalog').addEventListener('click', event => {
  const trigger = event.target.closest('.category-trigger');
  if (!trigger) return;
  const title = trigger.closest('.group').dataset.category;
  openCategory = trigger.getAttribute('aria-expanded') === 'true' ? null : title;
  search.value = '';
  filterCatalog();
  trigger.scrollIntoView({block:'nearest'});
});
search.addEventListener('input', filterCatalog);

function reportPages(sections) {
  const pages = [];
  const width = 1190;
  const height = 1684;
  const right = width - 90;
  const marginBottom = 1480;
  let page, ctx, y;
  function text(value, x, baseline, font, color = '#3b1a1e', align = 'right', direction = 'rtl') {
    ctx.direction = direction;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(value, x, baseline);
  }
  function startPage() {
    page = document.createElement('canvas');
    Object.assign(page, {width, height});
    ctx = page.getContext('2d');
    ctx.fillStyle = '#fcf8f2';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ff4848';
    ctx.fillRect(90, 155, width - 180, 4);
    text('YR STUDIO', 90, 115, 'bold 29px Arial', '#3b1a1e', 'left', 'ltr');
    text('طلب تسعير', right, 248, 'bold 65px Thmanyah, Tahoma, sans-serif');
    text(number.format(sections.reduce((total,[,items]) => total + items.length, 0)) + ' من الخدمات مختارة', right, 312, '32px Tahoma, Arial', '#6d5353');
    pages.push(page);
    y = 399;
  }
  function finishPage() {
    ctx.fillStyle = '#d9cac2';
    ctx.fillRect(90, 1545, width - 180, 2);
    text('اختيارات العميل · معاينة تجريبية', right, 1600, '24px Tahoma, Arial', '#6d5353');
    text(number.format(pages.length), 90, 1600, '24px Tahoma, Arial', '#6d5353', 'left');
  }
  startPage();
  for (const [title,items] of sections) {
    if (y + 60 + items.length * 48 > marginBottom) {
      finishPage();
      startPage();
    }
    text(title, right, y, 'bold 41px Thmanyah, Tahoma, sans-serif');
    y += 52;
    for (const item of items) {
      ctx.fillStyle = '#be303b';
      ctx.fillRect(right - 8, y - 13, 8, 8);
      text(item, right - 27, y, '30px Tahoma, Arial');
      y += 48;
    }
    y += 34;
  }
  finishPage();
  return pages;
}

function encodeReport(pages) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let length = 0;
  function write(part) {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  }
  function object(id, body) {
    offsets[id] = length;
    write(id + ' 0 obj\n');
    for (const part of body) write(part);
    write('\nendobj\n');
  }
  write('%PDF-1.4\n');
  const pageIds = pages.map((_,i) => 3 + i * 3);
  object(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
  object(2, ['<< /Type /Pages /Count ' + pages.length + ' /Kids [' + pageIds.map(id => id + ' 0 R').join(' ') + '] >>']);
  for (const [i,page] of pages.entries()) {
    const id = pageIds[i];
    const image = Uint8Array.from(atob(page.toDataURL('image/jpeg', .9).split(',')[1]), char => char.charCodeAt(0));
    const paint = 'q\n595 0 0 842 0 0 cm\n/Report Do\nQ\n';
    object(id, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Report ' + (id + 1) + ' 0 R >> >> /Contents ' + (id + 2) + ' 0 R >>']);
    object(id + 1, ['<< /Type /XObject /Subtype /Image /Width ' + page.width + ' /Height ' + page.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + image.length + ' >>\nstream\n', image, '\nendstream']);
    object(id + 2, ['<< /Length ' + paint.length + ' >>\nstream\n' + paint + 'endstream']);
  }
  const start = length;
  write('xref\n0 ' + offsets.length + '\n0000000000 65535 f \n');
  for (const offset of offsets.slice(1)) write(String(offset).padStart(10, '0') + ' 00000 n \n');
  write('trailer\n<< /Size ' + offsets.length + ' /Root 1 0 R >>\nstartxref\n' + start + '\n%%EOF\n');
  return new Blob(chunks, {type:'application/pdf'});
}

const download = byId('download');
download.addEventListener('click', async () => {
  const sections = selectionGroups();
  try {
    await document.fonts.ready;
    const url = URL.createObjectURL(encodeReport(reportPages(sections)));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'YR-Studio-Quote-Request.pdf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    status.textContent = 'التقرير جاهز في التنزيلات.';
  } catch {
    status.textContent = 'التقرير ما اتنزّلش. جرّب تاني.';
  }
  status.hidden = false;
});
