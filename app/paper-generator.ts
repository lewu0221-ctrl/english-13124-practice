import type {ChoiceQuestion,Paper} from "./papers-v2";
import {coverageFor} from "./unit-coverage";

export type Scenario={
  title:string; person:string; setting:string; challenge:string; action:string;
  outcome:string; insight:string; evidence:string; essay:string;
};

export type UnitPlan={
  unit:number; title:string; textA:string; textB:string;
  verbs:string[]; nouns:string[]; adjectives:string[];
  forms:Array<[string,string]>; phrases:string[]; scenarios:Scenario[];
};

const jq=(id:number,prompt:string,answer:number,explanation:string):ChoiceQuestion=>({id,prompt,options:["A. True","B. False","C. Not Given"],answer,explanation});
const cq=(id:number,prompt:string,options:string[],answer:number,explanation:string):ChoiceQuestion=>({id,prompt,options,answer,explanation});
const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);

function judgment(plan:UnitPlan,s:Scenario,v:number){
 const open=[
  `${s.person} faced a practical question in ${s.setting}: ${s.challenge}. Instead of treating the problem as proof of failure, ${s.person} paused to examine what could still be changed.`,
  `People in ${s.setting} had grown used to ${s.challenge}. ${s.person}, however, believed that an ordinary situation deserved a more thoughtful response.`,
  `At first, ${s.person} did not expect an important lesson from ${s.setting}. The turning point came when ${s.challenge}.`,
  `${s.challenge} was the issue that brought ${s.person} to ${s.setting}. Quick solutions were available, but none addressed the real cause.`
 ][v];
 const passage=`${open}\n\n${cap(s.action)}. The change was neither instant nor effortless. ${s.evidence}. This evidence mattered because it showed progress in observable terms rather than in promises.\n\n${cap(s.outcome)}. Other people began to notice that a small decision could influence a wider group. They did not all copy the same method, but they reconsidered their own habits and contributed ideas suited to their circumstances.\n\n${cap(s.insight)}. The experience gave practical meaning to the textbook expression “${plan.phrases[v%plan.phrases.length]}” and reflects Unit ${plan.unit}'s larger concern with ${plan.title.toLowerCase()}: useful change begins when people connect understanding with responsible action.`;
 const questions=[
  jq(1,`${s.person} encountered the problem in ${s.setting}.`,0,`首段明确交代了人物和发生地点。`),
  jq(2,`${s.person} regarded the difficulty as final proof of failure.`,1,`文章说明人物没有把困难视为失败的最终证明。`),
  jq(3,`In “${s.title},” the response produced an immediate and effortless change.`,1,`第二段明确指出改变并非立刻发生，也并不轻松。`),
  jq(4,`The account of ${s.person} uses observable evidence to describe progress.`,0,`第二段说明证据使进步能够被观察，而不是停留在承诺中。`),
  jq(5,`After ${s.person}'s action, everyone copied exactly the same method.`,1,`第三段说其他人没有全部照搬同一种方法。`),
  jq(6,`People influenced by “${s.title}” contributed ideas suited to their own situations.`,0,`第三段明确提到人们提出适合自身情况的想法。`),
  jq(7,`${s.person}'s project received financial support from a national organization.`,2,`文中没有提到全国性机构或资金支持。`),
  jq(8,`The experience in ${s.setting} links understanding with responsible action.`,0,`末段直接概括了理解与负责任行动之间的联系。`),
  jq(9,`The writer uses ${s.title.toLowerCase()} to argue that only experts can create change.`,1,`文章强调普通人的小决定也能产生影响。`),
  jq(10,`The lesson from “${s.title}” is connected with ${plan.title}.`,0,`末段明确把经历与本单元主题联系起来。`)
 ];
 return {title:s.title,passage,questions};
}

function reading(plan:UnitPlan,s:Scenario,v:number){
 const angles=["a decision diary","a four-week observation","a community interview","a before-and-after comparison"];
 const passage=`A group studying ${plan.title.toLowerCase()} examined ${s.title.toLowerCase()} through ${angles[v]}. They began with a simple question: why did ${s.challenge} continue even when people knew it caused difficulties?\n\nThe group found that information alone rarely changed behaviour. People also needed a manageable first step and a reason that felt personally meaningful. For that reason, they tested this approach: ${s.action}. They recorded both successful attempts and moments when old habits returned.\n\nThe most useful finding was not that one method worked perfectly. It was that ${s.evidence}. When participants could see this connection, they were more willing to adjust the method instead of abandoning the goal. In this context, “${plan.phrases[(v+1)%plan.phrases.length]}” was not merely a phrase to memorize; it described a decision in the case.\n\nThe study concluded that ${s.insight}. Its authors warned against turning one local example into a universal rule. Nevertheless, the case offered a practical way to think about the ideas in “${plan.textA}” and “${plan.textB}.”`;
 return {title:`A Closer Look at ${s.title}`,passage,questions:[
  cq(11,`What question guided the group's study of “${s.title}”?`,[`Why the difficulty continued despite people's awareness`,`How to obtain a national prize`,`Why the textbook had two texts`,`How to remove every old habit at once`],0,"第一段说明研究重点是人们明知有困难却仍延续原有做法的原因。"),
  cq(12,`In the ${angles[v]} of ${s.title.toLowerCase()}, what was insufficient by itself?`,["A manageable first step","Personally meaningful reasons","Information","A record of attempts"],2,"第二段指出仅有信息通常不足以改变行为。"),
  cq(13,`Why did people involved in “${s.title}” record unsuccessful moments?`,["To hide the final result","To understand how habits changed","To compete for money","To avoid adjusting the method"],1,"记录成功和反复是为了理解改变过程，而非只展示结果。"),
  cq(14,`What did participants in ${s.setting} do after seeing the evidence?`,["They abandoned the goal","They copied a universal rule","They adjusted the method","They stopped collecting evidence"],2,"第三段说明看到联系后，人们更愿意调整方法。"),
  cq(15,`What warning accompanied the conclusion about “${s.title}”?`,["Local evidence has no value","Every method must be effortless","One example should not become a universal rule","Textbook ideas should never be applied"],2,"末段提醒不能把一个地方性案例直接变成普遍规则。")
 ]};
}

function matching(plan:UnitPlan,s:Scenario){
 const passage=`① Define the real issue. In ${s.setting}, the visible difficulty was ${s.challenge}, but a useful response required people to examine its cause.\n② Choose a workable first step. ${cap(s.action)}. A limited action made participation possible and produced evidence for later decisions.\n③ Observe results honestly. ${cap(s.evidence)}. Records included setbacks as well as improvements, so the group did not confuse hope with proof.\n④ Adapt rather than copy. Participants kept the shared purpose but changed details to fit their own needs. This protected the project from becoming a rigid formula.\n⑤ Connect action with meaning. ${cap(s.insight)}. Reflection helped people understand why the effort deserved to continue.`;
 const paragraphOptions=["A. Link practice to a larger purpose","B. Examine what is actually wrong","C. Modify the method for local needs","D. Begin with a manageable action","E. Judge progress with evidence","F. Wait for perfect conditions"];
 const sentenceOptions=[`A. understand ${s.challenge}`,`B. start without being overwhelmed`,`C. separate evidence from wishful thinking`,`D. preserve purpose while changing details`,`E. continue for a meaningful reason`,`F. avoid all responsibility`];
 const paragraphPrompts=Array.from({length:5},(_,i)=>`${s.title} — Paragraph ${i+1}`);
 const sentencePrompts=[`${s.person} first needed to ____.`,`A manageable action helped participants ____.`,`The record from ${s.setting} helped the group ____.`,`Local adjustments allowed people to ____.`,`Reflection on “${s.title}” helped participants ____.`];
 return {title:`Five Steps for ${s.title}`,passage,paragraphPrompts,paragraphOptions,paragraphAnswers:[1,3,4,2,0],sentencePrompts,sentenceOptions,sentenceAnswers:[0,1,2,3,4],explanations:["第①段强调界定真实问题。","第②段强调从可行的小步骤开始。","第③段强调用证据判断结果。","第④段强调因地制宜地调整。","第⑤段强调行动背后的意义。","界定问题帮助理解困难。","小步骤降低开始行动的压力。","记录正反结果可区分证据与愿望。","调整细节不等于放弃共同目的。","意义感支持长期坚持。"]};
}

function sentenceFill(plan:UnitPlan,s:Scenario,v:number){
 const options=[
  `A. The first explanation, however, did not account for what people actually experienced.`,
  `B. ${cap(s.action)}.`,
  `C. The group therefore kept a record that included both progress and setbacks.`,
  `D. This did not mean that every participant had to behave in exactly the same way.`,
  `E. ${cap(s.insight)}.`,
  `F. They decided that no further observation would ever be necessary.`
 ];
 const passageParts=[
  `When ${s.person} began to examine ${s.challenge}, several easy answers were offered. `,
  ` A closer look showed that the situation involved habits, expectations and practical limits.\n\nThe next task was to turn discussion into action. `,
  ` Because the step was concrete, people could describe what happened rather than argue only from opinion.\n\nEarly results were mixed. `,
  ` The record made later adjustments more accurate and prevented one good day from being mistaken for permanent success.\n\nA shared goal still left room for individual judgment. `,
  ` Different choices could support the same responsible purpose.\n\nAt the end, the group returned to the central lesson of Unit ${plan.unit}. `,
  ` This conclusion gave the project value beyond its immediate setting.`
 ];
 const orders=[[0,1,2,3,4],[1,0,3,2,4],[0,2,1,3,4],[1,2,0,3,4]][v];
 // Reorder the six displayed choices while retaining a distinct answer pattern for each paper.
 const displayed=orders.map(i=>options[i]).concat(options[5]);
 const answers=[0,1,2,3,4].map(original=>orders.indexOf(original));
 return {title:`From Reflection to Action: ${s.title}`,passageParts,options:displayed,answers,explanations:["该句转折说明最初解释并不充分。","该句给出把讨论转化为行动的具体步骤。","该句承接结果不一并说明记录方法。","该句说明共同目标不要求完全相同的做法。","该句总结本单元主题与案例所得启示。"]};
}

function wordFill(plan:UnitPlan,s:Scenario,v:number){
 const verbs=[...plan.verbs.slice(v),...plan.verbs.slice(0,v)];
 const nouns=[...plan.nouns.slice(v),...plan.nouns.slice(0,v)];
 const adjectives=[...plan.adjectives.slice(v),...plan.adjectives.slice(0,v)];
 const used=[verbs[0],nouns[0],adjectives[0],verbs[1],nouns[1],verbs[2],adjectives[1],nouns[2],verbs[3],nouns[3]];
 const options=[...used,nouns[4],adjectives[2]];
 const passageParts=[
  `The class used ${s.title.toLowerCase()} to `,
  ` an important idea from Unit ${plan.unit}. Their first `,
  ` was to look beyond the most obvious explanation. Although the situation seemed `,
  `, the students learned that careful questions could `,
  ` a hidden pattern.\n\nThey collected `,
  ` from ${s.setting} and used it to `,
  ` their original plan. A more `,
  ` discussion followed because every claim had to match the record. The main `,
  ` was not a perfect solution but a clearer understanding.\n\nThe students then tried to `,
  ` the lesson in another context. Their final `,
  ` explained how ${s.insight}.`
 ];
 return {title:`Words in Context: ${s.title}`,passageParts,options,answers:[0,1,2,3,4,5,6,7,8,9],explanations:[
  `${verbs[0]}在to后用动词原形。`,`${nouns[0]}在形容词first后作名词。`,`${adjectives[0]}在seemed后作表语。`,`${verbs[1]}在could后用动词原形。`,`${nouns[1]}作collect的宾语。`,`${verbs[2]}在to后表示处理原计划。`,`${adjectives[1]}修饰discussion。`,`${nouns[2]}作句子主语。`,`${verbs[3]}在to后表示迁移运用。`,`${nouns[3]}指最终形成的成果。`
 ]};
}

function wordForm(plan:UnitPlan,s:Scenario){
 const [f0,f1,f2,f3,f4,f5,f6,f7,f8,f9]=plan.forms;
 const parts=[
  `The case of ${s.title.toLowerCase()} offered a `,
  ` (${f0[0]}) lesson. At first, participants reacted `,
  ` (${f1[0]}) because ${s.challenge}. Careful `,
  ` (${f2[0]}) helped them replace assumptions with evidence.\n\nThe group chose a `,
  ` (${f3[0]}) first step and accepted `,
  ` (${f4[0]}) for recording the result. Their `,
  ` (${f5[0]}) improved when progress became visible. Even after an `,
  ` (${f6[0]}) setback, they continued with greater `,
  ` (${f7[0]}).\n\nThe experience encouraged more `,
  ` (${f8[0]}) choices and a deeper `,
  ` (${f9[0]}) of ${plan.title.toLowerCase()}.`
 ];
 const answers=[f0[1],f1[1],f2[1],f3[1],f4[1],f5[1],f6[1],f7[1],f8[1],f9[1]];
 return {title:`A Lesson from ${s.title}`,passageParts:parts,roots:plan.forms.map(x=>x[0]),answers,explanations:answers.map((a,i)=>`根据句子位置和语法功能，应把 ${plan.forms[i][0]} 变为 ${a}。`)};
}

function essay(plan:UnitPlan,s:Scenario){
 const sample=`${s.title} shows why ${plan.title.toLowerCase()} matters in daily life. ${cap(s.challenge)}. A useful response was to ${s.action.charAt(0).toLowerCase()+s.action.slice(1)}. As a result, ${s.outcome.charAt(0).toLowerCase()+s.outcome.slice(1)}. I believe the most important lesson is that ${s.insight.charAt(0).toLowerCase()+s.insight.slice(1)}. In a similar situation, I would begin with a small practical step, record what happens, and adjust my plan instead of giving up when the first attempt is imperfect.`;
 return {prompt:`某英文学习网站正在征集题为“${s.essay}”的短文。请写一篇约80词的英文短文，内容包括：说明问题背景；提出两项具体行动；说明你从Unit ${plan.unit}得到的启示。`,sample,analysis:`范文围绕“${s.essay}”交代背景、行动、结果和个人启示，内容与Unit ${plan.unit}的《${plan.textA}》及《${plan.textB}》主题相关。评分时综合考虑要点覆盖、结构连贯、词汇语法准确性和约80词的篇幅。`};
}

export function buildUnitPapers(plan:UnitPlan):Paper[]{
 return plan.scenarios.map((s,v)=>{
  const j=judgment(plan,s,v),r=reading(plan,s,v),m=matching(plan,s);
  const inventory=coverageFor(plan.unit),source=v%2===0?"Text A":"Text B";
  const sourceFacts=v%2===0?inventory.textAFacts:inventory.textBFacts;
  const textFacts=sourceFacts.filter((_,i)=>i%2===Math.floor(v/2));
  const vocabulary=inventory.vocabulary.filter((_,i)=>i%4===v);
  const phrases=inventory.phrases.filter((_,i)=>i%4===v);
  const exerciseFocus=[inventory.exerciseFocus[v]];
  const sourceNote=`教材${source}内容回顾：${textFacts.join(" ")} 教材练习重点：${exerciseFocus[0]}。`;
  j.passage=`${sourceNote}\n\n${j.passage}`;
  r.passage=`${sourceNote}\n\n${r.passage}`;
  j.questions[0]=jq(1,`${textFacts[0]} (${source})`,0,`教材${source}明确包含这一内容。`);
  j.questions[1]=jq(2,`${textFacts[1]} (${source})`,0,`教材${source}的相关段落支持这一判断。`);
  j.questions=j.questions.map(q=>({...q,prompt:`${q.prompt} — ${s.title}`}));
  r.questions=r.questions.map(q=>({...q,prompt:`${q.prompt} — ${s.title}`}));
  m.paragraphPrompts=m.paragraphPrompts.map((x,i)=>`${x} · Unit ${plan.unit}.${v+1}.${i+1}`);
  m.sentencePrompts=m.sentencePrompts.map((x,i)=>`${x} · ${s.title} ${i+1}`);
  const paper:Paper={
   id:v+1,unit:plan.unit,unitTitle:plan.title,title:`Unit ${plan.unit} 模拟卷${["一","二","三","四"][v]}`,
   level:["基础巩固","语境运用","综合提升","全真模拟"][v],
   coverage:{source,vocabulary,phrases,textFacts,exerciseFocus},
   judgment:j,reading:r,matching:m,sentenceFill:sentenceFill(plan,s,v),wordFill:wordFill(plan,s,v),wordForm:wordForm(plan,s),essay:essay(plan,s)
  };
  const lexical=[...vocabulary,...phrases];
  paper.judgment.questions.forEach((q,i)=>{q.explanation=`${q.explanation} 教材词汇提示：${lexical[i%lexical.length]}。`});
  paper.reading.questions.forEach((q,i)=>{q.explanation=`${q.explanation} 教材词汇提示：${lexical[(i+10)%lexical.length]}。`});
  paper.matching.explanations=paper.matching.explanations.map((x,i)=>`${x} 教材词汇提示：${lexical[(i+15)%lexical.length]}。`);
  paper.sentenceFill.explanations=paper.sentenceFill.explanations.map((x,i)=>`${x} 教材词汇提示：${lexical[(i+25)%lexical.length]}。`);
  paper.wordFill.explanations=paper.wordFill.explanations.map((x,i)=>`${x} 教材词汇提示：${lexical[(i+30)%lexical.length]}。`);
  paper.wordForm.explanations=paper.wordForm.explanations.map((x,i)=>`${x} 教材词汇提示：${lexical[(i+40)%lexical.length]}。`);
  return paper;
 });
}
