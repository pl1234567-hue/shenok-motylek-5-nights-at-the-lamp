import {L,TYPES} from './config.js';
export const ASSETS=['moth_day','moth_night','moth_sleep','byaka_small','byaka_fast','byaka_fat','byaka_hide','byaka_boss','lamp_on','lamp_off','firefly','bg_day','bg_night','byaki_ball'];
export async function loadAssets(progress){const images={},failed=[];let done=0;await Promise.all(ASSETS.map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[name]=im;progress(++done,ASSETS.length);resolve();};im.onerror=()=>{failed.push(name);progress(++done,ASSETS.length);resolve();};im.src=new URL('../assets/'+name+'.webp',import.meta.url).href;})));if(failed.length)throw Error(failed.join(', '));return images;}
export class Renderer {
 constructor(canvas,images){this.canvas=canvas;this.c=canvas.getContext('2d');this.images=images;this.resize();}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);}
 sprite(name,x,y,w,h=w,alpha=1,angle=0){const im=this.images[name];if(!im)return;const c=this.c;c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.drawImage(im,-w/2,-h/2,w,h);c.restore();}
 glow(x,y,r,power=1){const c=this.c,g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(255,205,103,${.25*power})`);g.addColorStop(.45,`rgba(245,179,66,${.12*power})`);g.addColorStop(1,'rgba(245,179,66,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 draw(g){const c=this.c;c.setTransform(this.canvas.width/390,0,0,this.canvas.height/693,0,0);c.clearRect(0,0,390,693);const day=['day','ready','dawn','victory'].includes(g.state);c.drawImage(this.images[day?'bg_day':'bg_night'],0,0,390,693);c.fillStyle=day?'#17294118':'#07112444';c.fillRect(0,0,390,693);
 const menu=g.state==='menu';if(menu){this.glow(195,400,210,1.4);this.sprite('lamp_on',264,380,125,150);this.sprite('moth_day',177,450,270);return;}
 if(g.state==='victory'){this.glow(195,415,190);this.sprite('moth_sleep',195,420,280);return;}
 if(g.state==='defeat'){this.sprite('byaki_ball',195,340,370*(1+Math.sin(g.transition*2)*.012),208);return;}
 if(!day){this.glow(L.x,L.y,150,.55+g.fuel/25);c.strokeStyle='#f4cd7b30';c.lineWidth=1;c.beginPath();c.arc(L.x,L.y,150,0,Math.PI*2);c.stroke();}
 for(let i=0;i<16;i++){const t=g.t;c.fillStyle=day?'#fffbd066':'#ffe7a066';const x=(i*83.7+Math.sin(t*.4+i)*10)%390,y=130+(i*97.1)%520;c.globalAlpha=.2+.25*(1+Math.sin(t+i));c.beginPath();c.arc(x,y,1.2,0,7);c.fill();}c.globalAlpha=1;
 const flash=g.flashUntil>g.t;this.sprite(flash?'moth_night':'moth_day',219,457,flash?157:125,flash?157:125,1,flash?(g.facing||1)*.06:Math.sin(g.t*1.3)*.012);this.sprite('lamp_on',L.x,L.y,79,108);this.glow(L.x,L.y-10,55,.8);
 if(g.state==='day'){for(const e of g.flies){const p=g.flyPos(e);this.glow(p.x,p.y,32,1.7);this.sprite('firefly',p.x,p.y,49);}}
 if(g.state==='night'){
 if(g.bossHP>0){const p=g.bossPos;this.sprite('byaka_boss',p.x,p.y,96);for(let i=0;i<10;i++){c.fillStyle=i<g.bossHP?'#e8cf8b':'#182336';c.fillRect(p.x-48+i*10,p.y+48,7,6);}c.font='12px Calibri';c.textAlign='center';c.fillStyle='#f8ebd2';c.fillText('Большая Бяка',p.x,p.y-52);}
 if(g.bossLeftAt!==null && g.bossLeftAt!==undefined && g.t-g.bossLeftAt<.6){const u=(g.t-g.bossLeftAt)/.6;this.sprite('byaka_boss',195,100+g.bossLeftAt*3-90*u,96,96,1-u);}
 for(const e of g.enemies){const p=g.pos(e),a=Math.min(1,(g.t-e.at)/.3);const hidden=!g.available(e);let visibility=1;if(e.type==='S'){const d=Math.hypot(e.p[0]-L.x,e.p[1]-L.y),revealed=e.at+Math.max(0,(d-150)/(d-48))*TYPES.S.travel;visibility=.25+.75*Math.min(1,Math.max(0,(g.t-revealed)/.2));}this.sprite(TYPES[e.type].asset,p.x,p.y,e.type==='T'?66:60,e.type==='T'?66:60,a*visibility,Math.sin((g.t-e.at)*7)*.055);if(e.type==='T'){for(let i=0;i<2;i++){c.fillStyle=i<e.hp?'#f7d587':'#263044';c.fillRect(p.x-11+i*13,p.y+32,9,5);}if(e.hp===1){c.strokeStyle='#ffe7a8';c.lineWidth=2;c.beginPath();c.moveTo(p.x-22,p.y-17);c.lineTo(p.x-14,p.y-3);c.lineTo(p.x-21,p.y+8);c.stroke();}}if(hidden){c.strokeStyle='#c7c1ee55';c.beginPath();c.arc(p.x,p.y,26,0,7);c.stroke();}}
 for(const e of g.flee){const u=(g.t-e.left)/.35;this.sprite(TYPES[e.type].asset,e.x+(e.x-L.x)*u,e.y-60*u,60*(1-u*.3),60*(1-u*.3),1-u);}
 }
 if(g.state==='dawn'){c.fillStyle='#f5d99c40';c.fillRect(0,0,390,693);}
 }
}

