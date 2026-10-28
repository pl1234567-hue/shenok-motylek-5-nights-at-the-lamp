export class Sound {
 constructor(){this.muted=false;this.started=false;this.generation=0;this.effects={};for(const n of ['collect','attack','contact','result']){const a=new Audio(new URL('../sfx/'+n+'.mp3',import.meta.url));a.volume=.32;this.effects[n]=a;}this.music=new Audio(new URL('../sfx/garden.mp3',import.meta.url));this.music.loop=true;this.music.volume=0;this.fade=0;}
 async start(){this.started=true;const token=++this.generation;if(this.muted)return;try{await this.music.play();if(token===this.generation&&!this.muted)this.ramp(.17);else this.music.pause();}catch{}}
 ramp(target){clearInterval(this.fade);this.fade=setInterval(()=>{const d=target-this.music.volume;this.music.volume=Math.max(0,Math.min(.7,this.music.volume+Math.sign(d)*.025));if(Math.abs(d)<.026){this.music.volume=target;clearInterval(this.fade);if(!target)this.music.pause();}},30);}
 quiet(){this.generation++;this.ramp(0);for(const a of Object.values(this.effects))a.pause();}
 setMuted(v){this.muted=v;if(v)this.quiet();else if(this.started)this.start();}
 effect(name){if(this.muted||!this.started)return;const a=this.effects[name];if(a){try{a.currentTime=0;a.play().catch(()=>{});}catch{}}}
}
