export const emptyState = () => ({title:'淙淙健康抽獎', people:[], prizes:[], winners:[], revision:0});
export function parseNames(text) {
  const rows=text.replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);
  if(rows.length>1000) throw Error('每場最多 1,000 人，請分場匯入。');
  if(rows.some(s=>s.length>60)) throw Error('每行最多 60 字，請只貼上姓名，或「編號 姓名」。');
  return {names:[...new Set(rows)],duplicates:rows.length-new Set(rows).size};
}
export function available(s) { const won=new Set(s.winners.map(w=>w.personId)); return s.people.filter(p=>!won.has(p.id)); }
export function remaining(s,id) { const p=s.prizes.find(p=>p.id===id);return p?p.quantity-s.winners.filter(w=>w.prizeId===id).length:0; }
export function randomIndex(n, rng=crypto) {
  if(!Number.isInteger(n)||n<1) throw Error('抽獎池為空。');
  const limit=Math.floor(4294967296/n)*n,a=new Uint32Array(1);
  do { rng.getRandomValues(a); } while(a[0]>=limit);
  return a[0]%n;
}
export function draw(s,prizeId,count,batchId) {
  // Idempotency: a retried request must never draw twice.
  if(s.winners.some(w=>w.batchId===batchId)) return s;
  if(!Number.isInteger(count)||count<1||count>50) throw Error('每次可抽出 1–50 位。');
  const p=s.prizes.find(p=>p.id===prizeId),pool=available(s);
  if(!p) throw Error('請先選擇獎項。');
  if(count>remaining(s,prizeId)) throw Error('獎項剩餘名額不足。');
  if(count>pool.length) throw Error('抽獎池人數不足。');
  const winners=[...s.winners],time=new Date().toISOString();
  for(let i=0;i<count;i++){const [person]=pool.splice(randomIndex(pool.length),1);winners.push({id:crypto.randomUUID(),batchId,personId:person.id,name:person.name,prizeId,prize:p.name,time});}
  return {...s,winners,revision:s.revision+1};
}
export function csv(s) {
  const cell=v=>'"'+String(/^[=+@\-\t\r]/.test(String(v))?"'"+v:v).replaceAll('"','""')+'"';
  return '\uFEFF'+[['獎項','得獎者','抽獎時間'],...s.winners.map(w=>[w.prize,w.name,w.time])].map(r=>r.map(cell).join(',')).join('\r\n');
}
