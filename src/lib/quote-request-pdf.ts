type SelectedServices = [string, string[]][];
const number = new Intl.NumberFormat("ar-EG");

function reportPages(sections: SelectedServices) {
  const pages: HTMLCanvasElement[] = [];
  const width = 1190;
  const height = 1684;
  const right = width - 90;
  const marginBottom = 1480;
  let ctx!: CanvasRenderingContext2D;
  let y = 399;
  function text(value: string, x: number, baseline: number, font: string, color = '#3b1a1e', align: CanvasTextAlign = 'right', direction: CanvasDirection = 'rtl') {
    ctx.direction = direction;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(value, x, baseline);
  }
  function startPage() {
    const page = document.createElement('canvas');
    page.width = width;
    page.height = height;
    const context = page.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    ctx = context;
    ctx.fillStyle = '#fcf8f2';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ff4848';
    ctx.fillRect(90, 155, width - 180, 4);
    text('YR STUDIO', 90, 115, 'bold 29px Arial', '#3b1a1e', 'left', 'ltr');
    text('طلب تسعير', right, 248, 'bold 65px "YR Display", Tahoma, sans-serif');
    text(number.format(sections.reduce((total,[,items]) => total + items.length, 0)) + ' من الخدمات مختارة', right, 312, '32px Tahoma, Arial', '#6d5353');
    pages.push(page);
    y = 399;
  }
  function finishPage() {
    ctx.fillStyle = '#d9cac2';
    ctx.fillRect(90, 1545, width - 180, 2);
    text('اختيارات العميل', right, 1600, '24px Tahoma, Arial', '#6d5353');
    text(number.format(pages.length), 90, 1600, '24px Tahoma, Arial', '#6d5353', 'left');
  }
  startPage();
  for (const [title,items] of sections) {
    if (y + 60 + items.length * 48 > marginBottom) {
      finishPage();
      startPage();
    }
    text(title, right, y, 'bold 41px "YR Display", Tahoma, sans-serif');
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

function encodeReport(pages: HTMLCanvasElement[]) {
  const encoder = new TextEncoder();
  const chunks: BlobPart[] = [];
  const offsets = [0];
  let length = 0;
  function write(part: string | Uint8Array<ArrayBuffer>) {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  }
  function object(id: number, body: (string | Uint8Array<ArrayBuffer>)[]) {
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

export async function downloadQuoteRequest(sections: SelectedServices) {
  await document.fonts.ready;
  const url = URL.createObjectURL(encodeReport(reportPages(sections)));
  const link = document.createElement("a");
  link.href = url;
  link.download = "YR-Studio-Quote-Request.pdf";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
