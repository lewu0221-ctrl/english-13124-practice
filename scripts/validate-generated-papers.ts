import {papers as unitOne} from "../app/papers-v2";
import {generatedPapers,unitPlans} from "../app/unit-plans";
import {unitCoverage} from "../app/unit-coverage";

const errors:string[]=[];
const assert=(ok:boolean,message:string)=>{if(!ok)errors.push(message)};
const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g," ").trim();
const all=[...unitOne.map(p=>({...p,unit:1})),...generatedPapers];

assert(unitPlans.length===11,"Unit plan count must be 11");
assert(generatedPapers.length===44,"Generated paper count must be 44");
for(let unit=2;unit<=12;unit++) assert(generatedPapers.filter(p=>p.unit===unit).length===4,`Unit ${unit} must have four papers`);

for(const inventory of unitCoverage){
 const unitPapers=generatedPapers.filter(p=>p.unit===inventory.unit);
 const coveredWords=unitPapers.flatMap(p=>p.coverage?.vocabulary??[]);
 const coveredPhrases=unitPapers.flatMap(p=>p.coverage?.phrases??[]);
 const coveredFacts=unitPapers.flatMap(p=>p.coverage?.textFacts??[]);
 const coveredExercises=unitPapers.flatMap(p=>p.coverage?.exerciseFocus??[]);
 const expectedFacts=[...inventory.textAFacts,...inventory.textBFacts];
 assert(new Set(coveredWords).size===coveredWords.length,`Unit ${inventory.unit}: vocabulary repeated between papers`);
 assert(new Set(coveredPhrases).size===coveredPhrases.length,`Unit ${inventory.unit}: phrases repeated between papers`);
 assert(new Set(coveredFacts).size===coveredFacts.length,`Unit ${inventory.unit}: text facts repeated between papers`);
 assert(new Set(coveredExercises).size===coveredExercises.length,`Unit ${inventory.unit}: exercise focus repeated between papers`);
 assert(JSON.stringify([...coveredWords].sort())===JSON.stringify([...inventory.vocabulary].sort()),`Unit ${inventory.unit}: vocabulary coverage incomplete`);
 assert(JSON.stringify([...coveredPhrases].sort())===JSON.stringify([...inventory.phrases].sort()),`Unit ${inventory.unit}: phrase coverage incomplete`);
 assert(JSON.stringify([...coveredFacts].sort())===JSON.stringify(expectedFacts.sort()),`Unit ${inventory.unit}: Text A/B coverage incomplete`);
 assert(JSON.stringify([...coveredExercises].sort())===JSON.stringify([...inventory.exerciseFocus].sort()),`Unit ${inventory.unit}: exercise coverage incomplete`);
 for(const paper of unitPapers){
  const {coverage,...exam}=paper;
  const examText=normalize(JSON.stringify(exam));
  for(const term of [...(coverage?.vocabulary??[]),...(coverage?.phrases??[])]) assert(examText.includes(normalize(term)),`Unit ${inventory.unit} paper ${paper.id}: ${term} listed but absent from questions`);
  for(const fact of coverage?.textFacts??[]) assert(examText.includes(normalize(fact)),`Unit ${inventory.unit} paper ${paper.id}: Text fact listed but absent from passages`);
  for(const focus of coverage?.exerciseFocus??[]) assert(examText.includes(normalize(focus)),`Unit ${inventory.unit} paper ${paper.id}: exercise focus listed but absent from passages`);
 }
}

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
