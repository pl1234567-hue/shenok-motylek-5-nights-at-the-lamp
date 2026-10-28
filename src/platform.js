// Optional platform bridge: the browser uses the exact same rules and renderer.
export async function platform(onPause){
 if(new URLSearchParams(location.search).has('telegram')&&!window.Telegram){await new Promise(resolve=>{const s=document.createElement('script');s.src='https://telegram.org/js/telegram-web-app.js';s.onload=resolve;s.onerror=resolve;document.head.append(s);setTimeout(resolve,4000);});}
 const tg=window.Telegram?.WebApp;let back=null,backActive=null;
 const safe=fn=>{try{fn();}catch{}};
 const viewport=()=>safe(()=>{if(tg?.viewportStableHeight)document.documentElement.style.setProperty('--app-height',tg.viewportStableHeight+'px');const a=tg?.safeAreaInset||{},b=tg?.contentSafeAreaInset||{};document.documentElement.style.setProperty('--safe-top',Math.max(a.top||0,b.top||0)+'px');document.documentElement.style.setProperty('--safe-bottom',Math.max(a.bottom||0,b.bottom||0)+'px');});
 if(tg){safe(()=>tg.ready?.());safe(()=>tg.expand?.());safe(()=>tg.setHeaderColor?.('#111a2c'));safe(()=>tg.setBackgroundColor?.('#111a2c'));for(const e of ['viewportChanged','safeAreaChanged','contentSafeAreaChanged','themeChanged'])safe(()=>tg.onEvent?.(e,viewport));safe(()=>tg.onEvent?.('deactivated',onPause));viewport();}
 return {telegram:!!tg,setBack(active){if(backActive===active)return;backActive=active;safe(()=>{if(back)tg?.BackButton?.offClick?.(back);back=null;if(active&&tg?.BackButton){back=onPause;tg.BackButton.onClick?.(back);tg.BackButton.show?.();}else tg?.BackButton?.hide?.();});},haptic(){safe(()=>tg?.HapticFeedback?.impactOccurred?.('soft'));}};
}
