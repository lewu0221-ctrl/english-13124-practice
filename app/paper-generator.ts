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

function allocatedTextFacts(plan:UnitPlan,variant:number){
 const inventory=coverageFor(plan.unit);
 const facts=variant%2===0?inventory.textAFacts:inventory.textBFacts;
 return facts.filter((_,index)=>index%2===Math.floor(variant/2));
}

function sourceEvidenceExtension(plan:UnitPlan,s:Scenario,variant:number){
 const facts=allocatedTextFacts(plan,variant);
 const source=variant%2===0?`“${plan.textA}”`:`“${plan.textB}”`;
 const frames=[
  `A return to ${source} gives the case a firmer textbook base. ${facts[0]} That starting point helps explain why ${s.challenge}. The next detail changes the direction of the account: ${facts[1]} In the present case, this is reflected in the decision that ${s.action.charAt(0).toLowerCase()+s.action.slice(1)}. The evidence is strengthened by three further points from the same text. ${facts[2]} ${facts[3]} ${facts[4]} Read together, they show that the result in ${s.setting} should be judged through sequence, cause and consequence, not through a slogan.`,
  `The evidence can also be tested against ${source}. Its selected section first establishes that ${facts[0].charAt(0).toLowerCase()+facts[0].slice(1)}. It then records a contrast: ${facts[1]} This contrast matters in ${s.setting}, where ${s.challenge}. A later stage adds that ${facts[2].charAt(0).toLowerCase()+facts[2].slice(1)}, while another detail states that ${facts[3].charAt(0).toLowerCase()+facts[3].slice(1)}. Finally, ${facts[4].charAt(0).toLowerCase()+facts[4].slice(1)}. These details do not supply an automatic answer, but they give readers criteria for evaluating ${s.outcome.charAt(0).toLowerCase()+s.outcome.slice(1)}.`,
  `Three questions connect “${s.title}” with ${source}. What situation existed at the beginning? ${facts[0]} What development made the situation significant? ${facts[1]} What evidence supports the lesson? ${facts[2]} The remaining textbook details add necessary limits: ${facts[3]} ${facts[4]} This question-and-evidence pattern prevents readers from treating ${s.insight.charAt(0).toLowerCase()+s.insight.slice(1)} as an unsupported personal opinion.`,
  `Consider the textbook sequence behind this case. First, ${facts[0].charAt(0).toLowerCase()+facts[0].slice(1)}. Next, ${facts[1].charAt(0).toLowerCase()+facts[1].slice(1)}. The account then develops through the fact that ${facts[2].charAt(0).toLowerCase()+facts[2].slice(1)}. Before reaching a conclusion, it also makes clear that ${facts[3].charAt(0).toLowerCase()+facts[3].slice(1)}. The final point is that ${facts[4].charAt(0).toLowerCase()+facts[4].slice(1)}. This sequence from ${source} offers a specific basis for interpreting the action and outcome in “${s.title}.”`
 ];
 return frames[variant];
}

function textbookJudgment(plan:UnitPlan,source:string,facts:string[],variant:number){
 const title=source==="Text A"?plan.textA:plan.textB;
 const naturalFrames=[
  `${facts[0]} ${facts[1]} These circumstances establish the background and explain why the later development matters. The contrast is not abstract: it grows from the people, choices and conditions described in the account.\n\n${facts[2]} ${facts[3]} The situation therefore changes through an observable action or experience. Its result cannot be understood by looking at only one sentence; the earlier conditions and the response must be considered together.\n\n${facts[4]} This ending brings the selected events back to the larger concern of ${plan.title.toLowerCase()}. The example remains particular, but it shows how a decision, discovery or change in understanding can carry meaning beyond one moment.`,
  `${facts[0]} A second circumstance soon becomes important: ${facts[1].charAt(0).toLowerCase()+facts[1].slice(1)}. Together, these facts create the pressure, contrast or opportunity from which the rest of the account develops.\n\n${facts[2]} As events continue, ${facts[3].charAt(0).toLowerCase()+facts[3].slice(1)}. The development has a clear cause-and-effect relationship; neither the response nor its consequence appears without the conditions established at the beginning.\n\n${facts[4]} The final result adds depth to the theme of ${plan.title.toLowerCase()}. It suggests a lesson while preserving the actual circumstances that made the lesson possible.`,
  `${facts[0]} ${facts[1]} These opening details define the central issue and prevent it from being reduced to a general slogan. They also prepare the reader for a change in action, evidence or attitude.\n\nThe next stage is equally specific. ${facts[2]} In addition, ${facts[3].charAt(0).toLowerCase()+facts[3].slice(1)}. The two developments reinforce each other and show why the outcome deserves attention.\n\n${facts[4]} By the end, the account has moved from circumstance through evidence to meaning. Its connection with ${plan.title.toLowerCase()} rests on what happened, not merely on what someone claimed to believe.`,
  `${facts[0]} The picture becomes more complex when ${facts[1].charAt(0).toLowerCase()+facts[1].slice(1)}. Holding both details together is necessary for understanding the response that follows.\n\nA turning point then occurs. ${facts[2]} The text also makes clear that ${facts[3].charAt(0).toLowerCase()+facts[3].slice(1)}. This qualification keeps the result from becoming a simple or exaggerated conclusion.\n\nThe sequence closes with another important fact: ${facts[4]} Background, development and consequence together reveal how this part of “${title}” contributes to the unit theme of ${plan.title.toLowerCase()}.`
 ];
 const passage=naturalFrames[variant];
 const questions=[
  jq(1,facts[0],0,`第一段明确包含这一教材细节。`),
  jq(2,`The passage gives no support for the following detail: ${facts[1]}`,1,`第一段明确支持该细节，因此“没有支持”的说法错误。`),
  jq(3,facts[2],0,`第二段明确陈述了这一行动或变化。`),
  jq(4,`The account contradicts this detail: ${facts[3]}`,1,`文章实际陈述并支持该细节，并未与之矛盾。`),
  jq(5,facts[4],0,`第三段所依据的教材细节与题干一致。`),
  jq(6,`The selected account beginning with “${facts[0].split(" ").slice(0,5).join(" ")}” presents its details as unrelated facts.`,1,`文章说明各细节共同构成背景、行动、证据和结论。`),
  jq(7,`After the detail “${facts[4].split(" ").slice(0,6).join(" ")},” the discussion says one example settles every similar case.`,1,`末段明确否定把一个例子当作所有情况的最终答案。`),
  jq(8,`This Part ${variant<2?1:2} account of “${title}” uses observable details rather than only a slogan.`,0,`第二、三段说明主题建立在行动、观察和结果上。`),
  jq(9,`The original author completed “${title}” in exactly ${2000+variant}.`,2,`文章没有提供原文完成年份。`),
  jq(10,`The selected ${source} part containing “${facts[3].split(" ").slice(0,5).join(" ")}” is connected with ${plan.title}.`,0,`末段直接说明它与本单元主题的联系。`)
 ];
 return {title:`Textbook Reading: ${title} (${source}, Part ${variant<2?1:2})`,passage,questions};
}

function reading(plan:UnitPlan,s:Scenario,v:number){
 const angles=["a decision diary","a four-week observation","a community interview","a before-and-after comparison"];
 const passage=`A group studying ${plan.title.toLowerCase()} examined ${s.title.toLowerCase()} through ${angles[v]}. ${cap(s.challenge)}. They began with a simple question: why did this difficulty continue even when people knew it caused problems?\n\nThe group found that information alone rarely changed behaviour. People also needed a manageable first step and a reason that felt personally meaningful. For that reason, they tested this approach: ${s.action}. They recorded both successful attempts and moments when old habits returned.\n\nThe most useful finding was not that one method worked perfectly. It was that ${s.evidence.charAt(0).toLowerCase()+s.evidence.slice(1)}. When participants could see this connection, they were more willing to adjust the method instead of abandoning the goal. In this context, “${plan.phrases[(v+1)%plan.phrases.length]}” was not merely a phrase to memorize; it described a decision in the case.\n\nThe study concluded that ${s.insight.charAt(0).toLowerCase()+s.insight.slice(1)}. Its authors warned against turning one local example into a universal rule. Nevertheless, the case offered a practical way to think about the ideas in “${plan.textA}” and “${plan.textB}.”`;
 return {title:`A Closer Look at ${s.title}`,passage,questions:[
  cq(11,`What question guided the group's study of “${s.title}”?`,[`Why the difficulty continued despite people's awareness`,`How to obtain a national prize`,`Why the textbook had two texts`,`How to remove every old habit at once`],0,"第一段说明研究重点是人们明知有困难却仍延续原有做法的原因。"),
  cq(12,`In ${angles[v]} about ${s.title.toLowerCase()}, what was insufficient by itself?`,["A manageable first step","Personally meaningful reasons","Information","A record of attempts"],2,"第二段指出仅有信息通常不足以改变行为。"),
  cq(13,`Why did people involved in “${s.title}” record unsuccessful moments?`,["To hide the final result","To understand how habits changed","To compete for money","To avoid adjusting the method"],1,"记录成功和反复是为了理解改变过程，而非只展示结果。"),
  cq(14,`In “${s.title},” what did participants in ${s.setting} do after seeing the evidence?`,["They abandoned the goal","They copied a universal rule","They adjusted the method","They stopped collecting evidence"],2,"第三段说明看到联系后，人们更愿意调整方法。"),
  cq(15,`What warning accompanied the conclusion about “${s.title}”?`,["Local evidence has no value","Every method must be effortless","One example should not become a universal rule","Textbook ideas should never be applied"],2,"末段提醒不能把一个地方性案例直接变成普遍规则。")
 ]};
}

function matching(plan:UnitPlan,s:Scenario,v:number){
 const inventory=coverageFor(plan.unit);
 const facts=[...inventory.textAFacts,...inventory.textBFacts];
 const fact=(offset:number)=>facts[(v*3+offset)%facts.length];
 const passage=`① The work began by defining the real issue. In ${s.setting}, people could easily see that ${s.challenge}, yet naming the visible difficulty was not enough. They asked who was affected, when the difficulty appeared and which earlier choices had helped it continue. The discussion recalled a related point from the unit: ${fact(0)} This comparison turned a broad complaint into a question that could be investigated.

② The group next chose a workable first step instead of waiting for ideal conditions. ${cap(s.action)}. The action was limited enough for people to try, but specific enough to create a result that could be checked. A second textbook detail helped them judge the choice: ${fact(1)} By connecting that detail with the situation in ${s.setting}, participants understood what their first action was intended to change.

③ Observation continued after the first attempt. ${cap(s.evidence)}. The record included dates, reactions and setbacks as well as improvement, because one encouraging example could not prove that the difficulty had disappeared. Members compared the evidence with this unit idea: ${fact(2)} That comparison exposed weak assumptions and showed which part of the response deserved further support.

④ The evidence did not lead everyone to copy a single formula. Some participants changed the timing, while others adjusted the division of work or the way information was shared. These local changes protected the common purpose rather than weakening it. The group also considered that ${fact(3)} The detail reminded them that responsible adaptation depends on circumstances, not on convenience alone.

⑤ Finally, the group examined what the experience meant beyond one successful result. ${cap(s.outcome)}. More importantly, ${s.insight} The participants could now explain why the effort mattered, where its limits remained and how a later project might improve it. Their conclusion connected practical evidence with ${plan.title.toLowerCase()} and made “${plan.phrases[v%plan.phrases.length]}” a principle used in action rather than a phrase learned in isolation.`;
 const paragraphOptions=["A. Link practice to a larger purpose","B. Examine what is actually wrong","C. Modify the method for local needs","D. Begin with a manageable action","E. Judge progress with evidence","F. Wait for perfect conditions"];
 const sentenceOptions=[`A. understand ${s.challenge}`,`B. start without being overwhelmed`,`C. separate evidence from wishful thinking`,`D. preserve purpose while changing details`,`E. continue for a meaningful reason`,`F. avoid all responsibility`];
 const paragraphPrompts=Array.from({length:5},(_,i)=>`${s.title} — Paragraph ${i+1}`);
 const sentencePrompts=[`${s.person} first needed to ____.`,`A manageable action helped participants ____.`,`The record from ${s.setting} helped the group ____.`,`Local adjustments allowed people to ____.`,`Reflection on “${s.title}” helped participants ____.`];
 return {title:`Five Steps for ${s.title}`,passage,paragraphPrompts,paragraphOptions,paragraphAnswers:[1,3,4,2,0],sentencePrompts,sentenceOptions,sentenceAnswers:[0,1,2,3,4],explanations:["第①段强调界定真实问题。","第②段强调从可行的小步骤开始。","第③段强调用证据判断结果。","第④段强调因地制宜地调整。","第⑤段强调行动背后的意义。","界定问题帮助理解困难。","小步骤降低开始行动的压力。","记录正反结果可区分证据与愿望。","调整细节不等于放弃共同目的。","意义感支持长期坚持。"]};
}

function sentenceFill(plan:UnitPlan,s:Scenario,v:number){
 const inventory=coverageFor(plan.unit);
 const facts=[...inventory.textAFacts,...inventory.textBFacts];
 const fact=(offset:number)=>facts[(v*3+offset)%facts.length];
 const options=[
  `A. The first explanation, however, did not account for what people actually experienced.`,
  `B. ${cap(s.action)}.`,
  `C. The group therefore kept a record that included both progress and setbacks.`,
  `D. This did not mean that every participant had to behave in exactly the same way.`,
  `E. ${cap(s.insight)}.`,
  `F. They decided that no further observation would ever be necessary.`
 ];
 const passageFrames=[[
  `When ${s.person} began to examine ${s.challenge}, several easy answers were offered in ${s.setting}. One person blamed a lack of information, while another claimed that nothing could change until everyone agreed. ${s.person} wrote these claims down and compared them with what people had actually said and done. `,
  ` A closer look showed that the situation involved habits, expectations and practical limits. The class also considered a related detail from the textbook: ${fact(0)} That detail did not supply a ready-made solution, but it revealed why the first explanation had overlooked an important part of the problem.\n\nThe next task was to turn discussion into action. `,
  ` Because the step was concrete, participants knew what to do, when to do it and what result to watch for. They agreed to avoid describing the attempt as a success merely because it sounded reasonable. Instead, they would examine whether the action changed the difficulty named at the beginning.\n\nEarly results were mixed. `,
  ` The record made later adjustments more accurate and prevented one good day from being mistaken for permanent success. In particular, ${s.evidence}. The class compared this result with another unit fact: ${fact(1)} The comparison helped them distinguish a temporary reaction from evidence of a developing pattern.\n\nA shared goal still left room for individual judgment. `,
  ` Different choices could support the same responsible purpose. People who faced different limits adjusted the timing and method, then explained why those changes still served the original aim. This flexibility mattered because ${fact(2)} No participant was allowed to use “different circumstances” as an excuse for abandoning the evidence.\n\nAt the end, the group returned to the central lesson of Unit ${plan.unit}. `,
  ` ${cap(s.outcome)}. The experience showed that ${s.insight} It also clarified the limits of the result: one local project could guide later decisions, but it could not remove the need to observe each new situation. In this way, reflection led to a defensible action and the action produced material for deeper reflection.`
 ],[
  `A review team entered ${s.setting} after hearing that ${s.challenge}. Its first report repeated a convenient explanation and assumed that more information alone would solve the difficulty. Interviews soon revealed experiences that did not fit that account. `,
  ` The team reopened the inquiry and placed this textbook detail beside the interviews: ${fact(0)} The comparison exposed a missing cause and gave the investigators a more precise question. They then designed one limited trial. `,
  ` The trial named the people involved, the exact action and the result to be observed. It did not promise a complete solution. Once the trial began, reactions varied and several old habits returned. `,
  ` This record prevented the strongest early result from hiding later difficulties. ${s.evidence}. The reviewers also considered that ${fact(1)} Both sources showed why evidence had to include exceptions as well as improvement. Agreement on purpose did not erase differences among participants. `,
  ` Some people changed the timing; others changed how work was shared. They explained every adjustment and checked that it still served the stated goal. The textbook added an important limit: ${fact(2)} At the final review, the team asked what lesson could reasonably travel beyond ${s.setting}. `,
  ` ${cap(s.outcome)}. The conclusion was that ${s.insight} The team reported both the useful result and the conditions under which it had appeared, leaving later readers evidence they could test rather than a formula they had to copy.`
 ],[
  `During a Unit ${plan.unit} seminar, students debated why ${s.challenge}. Several explanations sounded persuasive, but they described what people ought to feel rather than what they had experienced in ${s.setting}. ${s.person} placed the claims in two columns and checked each one against the record. `,
  ` The unsupported claims were removed. A remaining textbook clue stated: ${fact(0)} It suggested a relationship the first discussion had missed. The seminar therefore moved from opinion to a concrete response. `,
  ` Everyone could identify the beginning, duration and intended result of the response. The class agreed beforehand that one successful moment would not be enough. When the first reports arrived, progress appeared beside hesitation and failure. `,
  ` Dates and contrasting outcomes were preserved instead of averaged into a cheerful summary. The most revealing observation was that ${s.evidence}. Students related it to this further detail: ${fact(1)} The comparison changed how they interpreted the early result. A new disagreement arose over whether everyone must follow one method. `,
  ` The group separated a shared principle from identical behaviour. Adjustments were accepted when participants could defend them with circumstances and evidence. This approach was consistent with the fact that ${fact(2)} The final speaker then returned to the theme of ${plan.title.toLowerCase()}. `,
  ` ${cap(s.outcome)}. From the seminar, students concluded that ${s.insight} Their reasoning remained open to correction because every stage—from first claim to final lesson—could be checked against a stated detail.`
 ],[
  `A field report on “${s.title}” began with a warning: ${s.challenge}. The writer recorded the warning but refused to treat it as a full explanation. Accounts from ${s.setting} showed that the same words covered several different causes and expectations. `,
  ` The report reorganized those accounts and tested them against Unit ${plan.unit}, including this fact: ${fact(0)} Once the missing relationship became visible, ${s.person} proposed a response that could be observed in practice. `,
  ` The response specified a starting point and a limited period. Participants knew which change would count as evidence and which pleasant reaction would count only as an impression. The first week produced both gains and setbacks. `,
  ` For that reason, the field notes retained unsuccessful attempts. They showed that ${s.evidence}. Another source detail—${fact(1)}—helped the writer decide which pattern was developing and which was temporary. Variation in local conditions then required judgment. `,
  ` Participants altered details without hiding those changes from the report. Their choices remained accountable to the original purpose, especially because ${fact(2)} The closing section considered what the case could teach without pretending it was universal. `,
  ` ${cap(s.outcome)}. The writer argued that ${s.insight} The field report therefore ended with a qualified conclusion, a record of limitations and a clear reason for further observation.`
 ]];
 const passageParts=passageFrames[v];
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
  ` an important idea from Unit ${plan.unit}. The case began in ${s.setting}, where ${s.challenge}. Their first `,
  ` was to separate what people had observed from what they merely expected. Although the situation seemed `,
  `, the students learned that careful questions could `,
  ` a hidden pattern. They asked when the difficulty occurred, who noticed it first and which earlier response had failed.\n\nThey collected `,
  ` from interviews, written records and the result of the first attempt. The class used it to `,
  ` their original plan rather than defend an attractive idea. A more `,
  ` discussion followed because every claim had to match the record. ${cap(s.action)}. The main `,
  ` was not a perfect solution but a clearer understanding of why the action worked in some conditions and needed revision in others.\n\nThe students then tried to `,
  ` the lesson in another context. They compared the new setting with ${s.setting} before deciding which details could be transferred. Their final `,
  ` explained the evidence, the limits of the comparison and how ${s.insight}.`
 ];
 return {title:`Words in Context: ${s.title}`,passageParts,options,answers:[0,1,2,3,4,5,6,7,8,9],explanations:[
  `${verbs[0]}在to后用动词原形。`,`${nouns[0]}在形容词first后作名词。`,`${adjectives[0]}在seemed后作表语。`,`${verbs[1]}在could后用动词原形。`,`${nouns[1]}作collect的宾语。`,`${verbs[2]}在to后表示处理原计划。`,`${adjectives[1]}修饰discussion。`,`${nouns[2]}作句子主语。`,`${verbs[3]}在to后表示迁移运用。`,`${nouns[3]}指最终形成的成果。`
 ]};
}

const alternateFormFamilies:Array<Array<[string,string]>>=[
 [["value","valuable"],["meaning","meaningful"],["benefit","beneficial"],["use","useful"],["insight","insightful"]],
 [["caution","cautiously"],["care","carefully"],["thought","thoughtfully"],["patience","patiently"],["reason","reasonably"]],
 [["analyze","analysis"],["observe","observation"],["investigate","investigation"],["evaluate","evaluation"],["reflect","reflection"]],
 [["manage","manageable"],["logic","logical"],["method","methodical"],["adapt","adaptable"],["construct","constructive"]],
 [["account","accountability"],["commit","commitment"],["participate","participation"],["contribute","contribution"],["cooperate","cooperation"]],
 [["perform","performance"],["capable","capability"],["accurate","accuracy"],["efficient","efficiency"],["competent","competence"]],
 [["expect","unexpected"],["avoid","unavoidable"],["predict","unpredictable"],["intend","unintended"],["fortune","unfortunate"]],
 [["persist","persistence"],["determine","determination"],["resilient","resilience"],["motivate","motivation"],["confident","confidence"]],
 [["ethics","ethical"],["strategy","strategic"],["support","supportive"],["cooperate","cooperative"],["responsibility","responsible"]],
 [["appreciate","appreciation"],["aware","awareness"],["understand","understanding"],["perceive","perception"],["know","knowledge"]]
];

function formsForPaper(plan:UnitPlan,variant:number):Array<[string,string]>{
 if(variant===0)return plan.forms;
 const reserved=new Set(plan.forms.map(([root])=>root));
 const used=new Set<string>();
 return alternateFormFamilies.map(family=>{
  const available=family.filter(([root])=>!reserved.has(root)&&!used.has(root));
  const selected=available[(variant-1)%available.length];
  used.add(selected[0]);
  return selected;
 });
}

function wordForm(plan:UnitPlan,s:Scenario,variant:number){
 const forms=formsForPaper(plan,variant);
 const [f0,f1,f2,f3,f4,f5,f6,f7,f8,f9]=forms;
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
 return {title:`A Lesson from ${s.title}`,passageParts:parts,roots:forms.map(x=>x[0]),answers,explanations:answers.map((a,i)=>`根据句子位置和语法功能，应把 ${forms[i][0]} 变为 ${a}。`)};
}

function essay(plan:UnitPlan,s:Scenario,variant:number){
 const writing=coverageFor(plan.unit).practicalWriting;
 if(variant===0){
  const details=writing.requirements.join("；");
  const samples:Record<number,string>={
   3:"Dear Green Travel Club,\n\nI am pleased to invite you to our Green Transportation Day in the Student Hall on Saturday, May 18, from 9:00 a.m. The programme includes a cycling-safety talk, a bus-route workshop and a low-carbon travel exhibition. Please let us know before May 12 whether you can attend. We sincerely hope you will join us and share your experience.\n\nYours sincerely,\nLi Hua",
   4:"Dear Wang Fang,\n\nThank you very much for helping me prepare the friendship exhibition last Friday. You spent the whole afternoon arranging photographs and checking the captions, and you stayed until every display was ready. Your careful work made the activity clear and welcoming. More importantly, your encouragement kept me calm when time was short. I truly value both your practical help and your friendship.\n\nYours,\nLi Hua",
   5:"Dear Manager,\n\nI am writing to complain about the damaged headphones delivered on May 6. The package was unopened, but the left earphone produced no sound and the charging case was scratched. I attached photographs and my order number. The problem has prevented me from using the product for study. Please replace it within seven days or provide a full refund. I look forward to your prompt reply.\n\nYours sincerely,\nLi Hua",
   6:"Dear Scholarship Committee,\n\nI am writing to request continued financial assistance for the coming academic year. With last year's support, I completed every course and earned an average of 89. I also volunteered weekly at the campus reading centre. My family cannot meet the full tuition cost, but I am determined to complete my education responsibly. I would be grateful if you would consider renewing the scholarship.\n\nYours sincerely,\nLi Hua",
   7:"Dear Ms Chen,\n\nI am very sorry that I missed our project meeting yesterday afternoon. I wrote down the wrong time and did not check the class message carefully. This was entirely my responsibility, and I understand that the group had to continue without my report. I have finished my part and sent it to everyone. I will confirm future arrangements immediately. Please accept my sincere apology.\n\nYours,\nLi Hua",
   8:"Dear Mr Zhao,\n\nI am concerned about the amount of disposable waste in our reading room. I suggest placing clearly marked recycling boxes beside the entrance and asking volunteers to explain their use during the first week. This is inexpensive, practical and easy to evaluate. We could review the result after one month before expanding the plan. I hope you will consider this suggestion.\n\nYours sincerely,\nLi Hua",
   9:"Dear Liu Ming,\n\nCongratulations on winning first prize in the city volunteer-service competition! I learned the good news from our school website this morning. Your project succeeded because you noticed work that others often took for granted and served the community faithfully for a whole year. Everyone in our class is proud of you. Congratulations again, and I wish you continued success.\n\nYours,\nLi Hua",
   10:"Dear Hiring Manager,\n\nI am writing to apply for the part-time media assistant position advertised on your website. As editor of our college newsletter, I have experience checking sources, writing concise reports and preparing digital content. I also use English confidently and can work responsibly under deadlines. These skills match the duties in your advertisement. I would welcome an opportunity to discuss my application.\n\nYours sincerely,\nLi Hua",
   11:"LI HUA\nEmail: lihua@example.com | Tel: 138-0000-0000\n\nEDUCATION\n2023–Present  Beijing City College, English programme\n\nEXPERIENCE\n2025–Present  Volunteer, Campus Communication Centre\n• interview students and edit weekly news\n• organize listening workshops\n\nSKILLS\nEnglish communication; office software; teamwork\n\nINTERESTS\nReading, public speaking and community service",
   12:"My goal is to study how technology can serve people without weakening privacy or human connection. While organizing a digital-safety workshop, I interviewed students about online tracking and turned their concerns into a practical guide. The project strengthened my research, writing and teamwork skills. I now hope to study information management systematically and examine responsible uses of data. Through further study, I want to design technology that remains useful, transparent and worthy of public trust."
  };
  return {prompt:`请按照 Unit ${plan.unit} Practical Writing 的“${writing.genre}”格式完成约80—120词的写作。必须包括：${details}。`,sample:samples[plan.unit],analysis:`本题直接对应教材 Practical Writing 的 ${writing.genre}。教材样例语境为 ${writing.sampleContext}；范文保留该体裁结构，但更换了人物和事件，覆盖指定的全部写作要素。`};
 }
 const sample=`${s.title} shows why ${plan.title.toLowerCase()} matters in daily life. ${cap(s.challenge)}. A useful response was to ${s.action.charAt(0).toLowerCase()+s.action.slice(1)}. As a result, ${s.outcome.charAt(0).toLowerCase()+s.outcome.slice(1)}. I believe the most important lesson is that ${s.insight.charAt(0).toLowerCase()+s.insight.slice(1)}. In a similar situation, I would begin with a small practical step, record what happens, and adjust my plan instead of giving up when the first attempt is imperfect.`;
 return {prompt:`某英文学习网站正在征集题为“${s.essay}”的短文。请写一篇约80词的英文短文，内容包括：说明问题背景；提出两项具体行动；说明你从Unit ${plan.unit}得到的启示。`,sample,analysis:`范文围绕“${s.essay}”交代背景、行动、结果和个人启示，内容与Unit ${plan.unit}的《${plan.textA}》及《${plan.textB}》主题相关。评分时综合考虑要点覆盖、结构连贯、词汇语法准确性和约80词的篇幅。`};
}

export function buildUnitPapers(plan:UnitPlan):Paper[]{
 return plan.scenarios.map((s,v)=>{
  const m=matching(plan,s,v);
  const inventory=coverageFor(plan.unit),source=v%2===0?"Text A":"Text B";
  const sourceFacts=v%2===0?inventory.textAFacts:inventory.textBFacts;
  const textFacts=sourceFacts.filter((_,i)=>i%2===Math.floor(v/2));
  const vocabulary=inventory.vocabulary.filter((_,i)=>i%4===v);
  const phrases=inventory.phrases.filter((_,i)=>i%4===v);
  const exerciseFocus=[inventory.exerciseFocus[v]];
  const j=textbookJudgment(plan,source,textFacts,v);
  const r=reading(plan,s,v);
  const sf=sentenceFill(plan,s,v);
  const wf=wordFill(plan,s,v);
  const extension=sourceEvidenceExtension(plan,s,v);
  j.passage=`教材练习重点：${exerciseFocus[0]}。\n\n${j.passage}`;
  r.passage=`教材练习重点：${exerciseFocus[0]}。\n\n${r.passage}\n\nThe case can be compared with ${source} in Unit ${plan.unit}: ${textFacts.join(" ")} The textbook details and the new case are not identical, but both provide concrete evidence for thinking about ${plan.title.toLowerCase()}.`;
  m.passage+=` ${extension}`;
  sf.passageParts[sf.passageParts.length-1]+=`\n\nTextbook follow-up: ${extension}`;
  wf.passageParts[wf.passageParts.length-1]+=`\n\nSource-based follow-up: ${extension}`;
  m.paragraphPrompts=m.paragraphPrompts.map((x,i)=>`${x} · Unit ${plan.unit}.${v+1}.${i+1}`);
  m.sentencePrompts=m.sentencePrompts.map((x,i)=>`${x} · ${s.title} ${i+1}`);
  const paper:Paper={
   id:v+1,unit:plan.unit,unitTitle:plan.title,title:`Unit ${plan.unit} 模拟卷${["一","二","三","四"][v]}`,
   level:["基础巩固","语境运用","综合提升","全真模拟"][v],
   coverage:{source,vocabulary,phrases,textFacts,exerciseFocus},
   judgment:j,reading:r,matching:m,sentenceFill:sf,wordFill:wf,wordForm:wordForm(plan,s,v),essay:essay(plan,s,v)
  };
  return paper;
 });
}
