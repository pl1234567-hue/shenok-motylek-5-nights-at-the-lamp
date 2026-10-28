export const L={x:195,y:390};
export const POINTS=[[40,140],[195,140],[350,140],[350,330],[350,590],[195,590],[40,590],[40,330]];
export const DAY_POINTS=[[90,200],[280,360],[100,470],[285,220],[190,330],[280,490]];
export const WAVES=[null,[4,4,12,['O']],[4,3.5,14,['O','O','B','O','O','B','O']],[4,3,16,['O','B','O','T']],[4,2.8,18,['O','B','T','O','S','O']],[4,3,16,['O','B','O','T','S','O','O','B']]];
export const TYPES={O:{hp:1,travel:7,r:26,asset:'byaka_small'},B:{hp:1,travel:4.375,r:26,asset:'byaka_fast'},T:{hp:2,travel:7,r:30,asset:'byaka_fat'},S:{hp:1,travel:7,r:26,asset:'byaka_hide'}};
export const INTRO=['','Обычные бяки боятся одной вспышки.','Быстрая бяка: меньше времени на реакцию.','Плотная бяка: нужны две вспышки.','Теневая бяка доступна только в круге света.','Большая Бяка: 10 попаданий до рассвета. Не забывай о маленьких.'];
export function wave(n){const [first,gap,count,types]=WAVES[n]; return Array.from({length:count},(_,k)=>({id:k+1,type:types[k%types.length],at:Math.round((first+k*gap)*1e6)/1e6,p:POINTS[(k+n-1)%8]}));}
