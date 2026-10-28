import {L,DAY_POINTS,TYPES,wave} from './config.js';
const EPS=1e-8;
export class Game {
 constructor(onEvent=()=>{}){this.emit=onEvent;this.state='menu';this.night=1;this.t=0;this.paused=false;this.enemies=[];this.flies=[];this.flee=[];this.fuel=12;this.collected=0;this.bossHP=0;this.cooldownUntil=0;this.flashUntil=-1;this.transition=0;}
 day(n=1){this.night=n;this.state='day';this.t=0;this.collected=0;this.fuel=12;this.enemies=[];this.flies=[];this.flee=[];this.spawned=0;this.paused=false;this.bossHP=0;this.cooldownUntil=0;this.flashUntil=-1;this.flySpawn();this.emit('state');}
 flySpawn(){while(this.spawned<19&&this.spawned*.8<=this.t+EPS){const id=this.spawned++; const [x,y]=DAY_POINTS[id%6];this.flies.push({id,x,y,at:id*.8});}}
 startNight(){if(this.state!=='ready')return;this.state='night';this.t=0;this.fuel=Math.min(20,12+this.collected);this.enemies=[];this.flee=[];this.schedule=wave(this.night);this.spawned=0;this.tick=1;this.cooldownUntil=0;this.bossHP=this.night===5?10:0;this.bossLeftAt=null;this.emit('state');}
 pos(e,time=this.t){const [x,y]=e.p,d=Math.hypot(x-L.x,y-L.y),u=Math.min(1,Math.max(0,(time-e.at)/TYPES[e.type].travel));return {x:x+(L.x+(x-L.x)/d*48-x)*u,y:y+(L.y+(y-L.y)/d*48-y)*u};}
 flyPos(e){return {x:e.x+Math.sin((this.t-e.at)*3+e.id)*4,y:e.y+Math.cos((this.t-e.at)*2+e.id)*4};}
 available(e){const p=this.pos(e);return e.hp>0&&(e.type!=='S'||Math.hypot(p.x-L.x,p.y-L.y)<=150+EPS);}
 get bossPos(){return {x:195,y:100+this.t*3};}
 nextEvent(){if(this.state==='day')return Math.min(15,this.spawned<19?this.spawned*.8:Infinity,...this.flies.map(e=>e.at+2));if(this.state==='night')return Math.min(60,this.schedule[this.spawned]?.at??Infinity,this.tick<=9?this.tick*6:Infinity,...this.enemies.map(e=>e.at+TYPES[e.type].travel));return Infinity;}
 advance(target,hit=null){if(this.paused||!['day','night'].includes(this.state))return;target=Math.max(this.t,target);while(['day','night'].includes(this.state)){
 const next=this.nextEvent(); if(next>target+EPS){this.t=target;break;} this.t=next;
 if(this.state==='day'&&this.t>=15-EPS){this.flies=[];this.state='ready';this.emit('state');return;}
 if(this.state==='night'&&this.t>=60-EPS){this.finish(this.night!==5||this.bossHP===0);return;}
 if(this.state==='day'){this.flies=this.flies.filter(e=>e.at+2>this.t+EPS);this.flySpawn();}
 else {while(this.schedule[this.spawned]?.at<=this.t+EPS){const e=this.schedule[this.spawned++];this.enemies.push({...e,hp:TYPES[e.type].hp});}}
 if(hit&&Math.abs(target-this.t)<EPS){this.tap(hit.x,hit.y);hit=null;}
 if(this.state==='night'){const contacts=this.enemies.filter(e=>e.at+TYPES[e.type].travel<=this.t+EPS);this.enemies=this.enemies.filter(e=>!contacts.includes(e));for(const e of contacts){this.fuel=Math.max(0,this.fuel-3);this.emit('contact');}if(this.tick<=9&&this.tick*6<=this.t+EPS){this.tick++;this.fuel=Math.max(0,this.fuel-1);}if(!this.fuel){this.finish(false);return;}}
 if(this.t>=target-EPS)break;
 } if(hit&&['day','night'].includes(this.state))this.tap(hit.x,hit.y);this.flee=this.flee.filter(e=>this.t-e.left<.35);}
 tap(x,y){if(this.paused)return false;if(this.state==='day'){const e=this.flies.find(e=>{const p=this.flyPos(e);return Math.hypot(x-p.x,y-p.y)<=28;});if(!e)return false;this.flies=this.flies.filter(f=>f!==e);this.collected++;this.fuel=Math.min(20,12+this.collected);this.emit('collect');return true;}
 if(this.state!=='night'||this.t>=60||this.t+EPS<this.cooldownUntil)return false;
 const candidates=this.enemies.filter(e=>this.available(e)&&Math.hypot(x-this.pos(e).x,y-this.pos(e).y)<=TYPES[e.type].r).sort((a,b)=>(a.at+TYPES[a.type].travel)-(b.at+TYPES[b.type].travel)||a.id-b.id);
 const e=candidates[0];if(e){e.hp--;if(!e.hp){this.enemies=this.enemies.filter(v=>v!==e);this.flee.push({...e,...this.pos(e),left:this.t});}}else if(this.bossHP>0&&Math.hypot(x-this.bossPos.x,y-this.bossPos.y)<=48){this.bossHP--;if(!this.bossHP)this.bossLeftAt=this.t;}else return false;
 this.cooldownUntil=this.t+1.5;this.flashUntil=this.t+.4;this.facing=x<L.x?-1:1;this.emit('attack');return true;}
 finish(ok){this.state=ok?(this.night===5?'victory':'dawn'):'defeat';this.transition=0;this.reason=this.fuel===0?'Свет погас. Бяки унесли лампу.':'Большая тень закрыла свет.';this.emit(ok?'success':'failure');this.emit('state');}
 update(dt){if(this.paused)return;if(['day','night'].includes(this.state))this.advance(this.t+dt);else if(['dawn','defeat'].includes(this.state)){this.transition+=dt;if(this.state==='dawn'&&this.transition>=2)this.day(this.night+1);}}
 pause(){if(['day','night','dawn','defeat'].includes(this.state)&&!this.paused){this.paused=true;this.emit('pause');}}
 resume(){this.paused=false;this.emit('state');}
}
