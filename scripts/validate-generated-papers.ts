import {papers as unitOne} from "../app/papers-v2";
import {generatedPapers,unitPlans} from "../app/unit-plans";

const errors:string[]=[];
const assert=(ok:boolean,message:string)=>{if(!ok)errors.push(message)};
const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g," ").trim();
const all=[...unitOne.map(p=>({...p,unit:1})),...generatedPapers];

assert(unitPlans.length===11,"Unit plan count must be 11");
assert(generatedPapers.length===44,"Generated paper count must be 44");
for(let unit=2;unit<=12;unit++) assert(generatedPapers.filter(p=>p.unit===unit).length===4,`Unit ${unit} must have four papers`);

for(const p of all){
 const label=`Unit ${p.unit} paper ${p.id}`;
 assert(p.judgment.questions.length===10,`${label}: judgment count`);
 assert(p.reading.questions.length===5,`${label}: reading count`);
 assert(p.matching.paragraphAnswers.length===5,`${label}: paragraph matching count`);
 assert(p.matching.sentenceAnswers.length===5,`${label}: sentence matching count`);
 assert(p.sentenceFill.answers.length===5&&p.sentenceFill.passageParts.length===6,`${label}: sentence fill structure`);
 assert(p.wordFill.answers.length===10&&p.wordFill.passageParts.length===11,`${label}: word fill structure`);
 assert(p.wordForm.answers.length===10&&p.wordForm.roots.length===10&&p.wordForm.passageParts.length===11,`${label}: word form structure`);
 const ids=[...p.judgment.questions,...p.reading.questions].map(q=>q.id);
 assert(JSON.stringify(ids)===JSON.stringify(Array.from({length:15},(_,i)=>i+1)),`${label}: question IDs 1-15`);
 for(const q of [...p.judgment.questions,...p.reading.questions]) assert(q.answer>=0&&q.answer<q.options.length,`${label}: invalid answer for Q${q.id}`);
 for(const [section,answers,options] of [["matching-1",p.matching.paragraphAnswers,p.matching.paragraphOptions],["matching-2",p.matching.sentenceAnswers,p.matching.sentenceOptions],["sentence-fill",p.sentenceFill.answers,p.sentenceFill.options],["word-fill",p.wordFill.answers,p.wordFill.options]] as const){
  answers.forEach((a,i)=>assert(a>=0&&a<options.length,`${label}: invalid ${section} answer ${i+1}`));
  assert(new Set(options.map(normalize)).size===options.length,`${label}: repeated options in ${section}`);
 }
 assert(10+10+10+10+15+15+30===100,`${label}: score total`);
}

const uniqueBuckets:{name:string;items:Array<{label:string;text:string}>}[]=[
 {name:"judgment passages",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.judgment.passage}))},
 {name:"reading passages",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.reading.passage}))},
 {name:"matching passages",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.matching.passage}))},
 {name:"sentence-fill passages",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.sentenceFill.passageParts.join(" ")}))},
 {name:"word-fill passages",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.wordFill.passageParts.join(" ")}))},
 {name:"word-form passages",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.wordForm.passageParts.join(" ")}))},
 {name:"essay prompts",items:all.map(p=>({label:`U${p.unit}P${p.id}`,text:p.essay.prompt}))},
 {name:"objective prompts",items:all.flatMap(p=>[...p.judgment.questions,...p.reading.questions].map(q=>({label:`U${p.unit}P${p.id}Q${q.id}`,text:q.prompt}))).concat(generatedPapers.flatMap(p=>[...(p.matching.paragraphPrompts??[]),...(p.matching.sentencePrompts??[])].map((text,i)=>({label:`U${p.unit}P${p.id}M${i+1}`,text}))))}
];

for(const bucket of uniqueBuckets){
 const seen=new Map<string,string>();
 for(const item of bucket.items){
  const key=normalize(item.text);
  if(seen.has(key)) errors.push(`${bucket.name}: exact duplicate ${seen.get(key)} and ${item.label}`);
  else seen.set(key,item.label);
 }
}

if(errors.length){
 console.error(errors.join("\n"));
 process.exit(1);
}
console.log(`Validated ${all.length} papers (${generatedPapers.length} new), ${all.length*51} questions, 100 points each.`);
console.log("No exact duplicates in passages, objective prompts, matching prompts, or essay tasks.");
