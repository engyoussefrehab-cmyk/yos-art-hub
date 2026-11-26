export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function hexToRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
export function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase()}
export function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;const d=mx-mn;if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=((g-b)/d+(g<b?6:0));else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60}return[h,s,l]}
export function hslToRgb(h,s,l){h=((h%360)+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r,g,b;
  if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];
  return[(r+m)*255,(g+m)*255,(b+m)*255]}
const toLin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
export const fromLin=v=>255*(v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055);
// OKLab (Ottosson 2020)
function rgbToOklab(R,G,B){const r=toLin(R),g=toLin(G),b=toLin(B);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return[.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s]}
export function oklabToLinRgb(L,a,b){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
  return[4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s]}
export const hexOklab=h=>rgbToOklab(...hexToRgb(h));
export function hexOklch(h){const[L,a,b]=hexOklab(h);return[L,Math.hypot(a,b),((Math.atan2(b,a)*180/Math.PI)+360)%360]}
export function oklchHex(L,C,H){ // gamut-map by reducing chroma
  const t=H*Math.PI/180;let c=C;
  for(let i=0;i<40;i++){const rgb=oklabToLinRgb(L,c*Math.cos(t),c*Math.sin(t));if(rgb.every(v=>v>=-.0005&&v<=1.0005))return rgbToHex(...rgb.map(v=>fromLin(clamp(v,0,1))));c*=.93}
  const rgb=oklabToLinRgb(L,0,0);return rgbToHex(...rgb.map(v=>fromLin(clamp(v,0,1))));
}
export const dE=(x,y)=>{const A=hexOklab(x),B=hexOklab(y);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2])};
// WCAG relative luminance & contrast
export function lum(hex){return hexToRgb(hex).map(toLin).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
export function contrast(a,b){const A=lum(a),B=lum(b);return(Math.max(A,B)+.05)/(Math.min(A,B)+.05)}
export const textOn=hex=>contrast(hex,'#FFFFFF')>=contrast(hex,'#000000')?'#FFFFFF':'#000000';
export function contrastLevels(ratio) {
  return { normalText: ratio >= 4.5, largeText: ratio >= 3, nonText: ratio >= 3 };
}
export const displayRatio = ratio => (Math.floor(ratio * 100) / 100).toFixed(2) + ':1';

// Test both lighter and darker sRGB results, retaining the closest passing shade.
export function accentShade(base, hue, chroma, targetLightness) {
  const start = oklchHex(targetLightness, chroma, hue);
  if (contrast(start, base) >= 3) return start;
  const candidates = [start];
  for (let step = 13; step <= 93; step++) {
    candidates.push(oklchHex(step / 100, chroma, hue));
  }
  const passing = candidates.filter(candidate => contrast(candidate, base) >= 3);
  if (passing.length) return passing.reduce((best, candidate) =>
    Math.abs(hexOklch(candidate)[0] - targetLightness) < Math.abs(hexOklch(best)[0] - targetLightness) ? candidate : best);
  return candidates.reduce((best, candidate) => contrast(candidate, base) > contrast(best, base) ? candidate : best);
}
// CVD simulation (Machado 2009, severity 1) in linear RGB
export const CVD={deut:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]],prot:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]]};
export function sim(hex,k){const v=hexToRgb(hex).map(toLin),M=CVD[k];return rgbToHex(...M.map(r=>fromLin(clamp(r[0]*v[0]+r[1]*v[1]+r[2]*v[2],0,1))))}

export function extractColors(pixels) {
  const histogram = new Map();
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] < 128) continue;
    const hex = rgbToHex(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    histogram.set(hex, (histogram.get(hex) ?? 0) + 1);
  }
  if (!histogram.size) return [];
  const samples = [...histogram].map(([hex, count]) => ({ lab: hexOklab(hex), count }))
    .sort((a, b) => b.count - a.count);
  const distance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  let centers = [samples[0].lab];
  while (centers.length < Math.min(5, samples.length)) {
    let farthest = samples[0].lab;
    let maxDistance = 0;
    for (const {lab} of samples) {
      const separation = Math.min(...centers.map(center => distance(lab, center)));
      if (separation > maxDistance) {
        farthest = lab;
        maxDistance = separation;
      }
    }
    if (maxDistance < 1e-10) break;
    centers.push(farthest);
  }
  const empty = () => ({ count: 0, sum: [0, 0, 0] });
  function assign() {
    const clusters = centers.map(empty);
    for (const sample of samples) {
      const index = centers.reduce((best, center, next) =>
        distance(sample.lab, center) < distance(sample.lab, centers[best]) ? next : best, 0);
      const cluster = clusters[index];
      cluster.count += sample.count;
      sample.lab.forEach((value, axis) => { cluster.sum[axis] += value * sample.count; });
    }
    return clusters;
  }
  for (let iteration = 0; iteration < 8; iteration++) {
    centers = assign().map(({count, sum}, index) => count ? sum.map(value => value / count) : centers[index]);
  }
  const colors = assign().map(({count}, index) => ({
    count,
    hex: rgbToHex(...oklabToLinRgb(...centers[index]).map(value => fromLin(clamp(value, 0, 1)))),
  })).filter(color => color.count).sort((a, b) => b.count - a.count);
  const distinct = [];
  for (const {hex} of colors) {
    if (distinct.every(other => dE(other, hex) > .06)) distinct.push(hex);
  }
  return distinct;
}
