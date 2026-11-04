/**
 * Synthetic data for LevelUp.
 *
 * The company (Solenne Biosciences), its products (Cardexa, Ossira and the upcoming Lumeva launch),
 * every person and every number are made up. Swap this file for a real source (an LMS, a CRM or an
 * HR system) and the rest of the app keeps working, because every figure is calculated in src/lib.
 */

export const company = {
  name: 'Solenne Biosciences',
  unit: 'Field Force Portugal',
  asOf: '2026-11-04',
  week: 'Week 45',
};

export const LEVEL_NAMES = ['Not started', 'Aware', 'Practising', 'Proficient', 'Advanced', 'Expert'];
export const POINTS_PER_LEVEL = 100;
export const MAX_SKILL_LEVEL = 5;

export const categories = [
  { id: 'science', label: 'Product & Science', color: '#4f6ef7' },
  { id: 'engagement', label: 'Customer Engagement', color: '#8b5cf6' },
  { id: 'business', label: 'Business Acumen', color: '#0e9a9a' },
  { id: 'compliance', label: 'Compliance', color: '#e08a00' },
  { id: 'digital', label: 'Digital & AI', color: '#e0457b' },
];

/**
 * demand: how much the business needs this skill right now (1 = baseline, 2 = high, 3 = critical).
 * reason: why it is in demand, shown to reps so the "why" is never a mystery.
 */
export const skills = [
  {
    id: 'sci-cardio',
    short: 'Cardio science',
    name: 'Cardiovascular science',
    category: 'science',
    demand: 1,
    description: 'Disease areas, mechanisms and treatment guidelines behind the Cardexa portfolio.',
  },
  {
    id: 'sci-clinical',
    short: 'Clinical data',
    name: 'Clinical data interpretation',
    category: 'science',
    demand: 2,
    reason: 'Lumeva launch conversations are built on trial data.',
    description: 'Reading trial results, endpoints and safety data, and explaining them accurately.',
  },
  {
    id: 'sci-lumeva',
    short: 'Lumeva',
    name: 'Lumeva launch knowledge',
    category: 'science',
    demand: 3,
    reason: 'Lumeva launches in Q1 2027. Every rep needs to be launch-ready.',
    description: 'Indication, positioning, key messages and the patient profile for Lumeva.',
  },
  {
    id: 'eng-discovery',
    short: 'Discovery',
    name: 'Needs discovery',
    category: 'engagement',
    demand: 1,
    description: 'Open questions and active listening to understand what a healthcare professional needs.',
  },
  {
    id: 'eng-objection',
    short: 'Objections',
    name: 'Objection handling',
    category: 'engagement',
    demand: 2,
    reason: 'Launch feedback shows price and switching objections are rising.',
    description: 'Acknowledge, explore and answer objections with evidence.',
  },
  {
    id: 'eng-omni',
    short: 'Omnichannel',
    name: 'Omnichannel engagement',
    category: 'engagement',
    demand: 3,
    reason: '40% of customer interactions in 2027 are planned as remote or digital.',
    description: 'Remote detailing, approved emails and webinars that work alongside face-to-face visits.',
  },
  {
    id: 'bus-account',
    short: 'Account plan',
    name: 'Account planning',
    category: 'business',
    demand: 1,
    description: 'Prioritising accounts and building a plan with clear objectives for each one.',
  },
  {
    id: 'bus-access',
    short: 'Market access',
    name: 'Market access',
    category: 'business',
    demand: 2,
    reason: 'Hospital formulary decisions for Lumeva start in early 2027.',
    description: 'Reimbursement, hospital formularies and how access decisions are made.',
  },
  {
    id: 'bus-insights',
    short: 'CRM & data',
    name: 'CRM & data insights',
    category: 'business',
    demand: 2,
    reason: 'New territory dashboards go live in January.',
    description: 'Logging interactions well and using territory data to decide where to focus.',
  },
  {
    id: 'cmp-ethics',
    short: 'Compliance',
    name: 'Compliant promotion',
    category: 'compliance',
    demand: 1,
    mandatory: true,
    reason: 'Mandatory for every customer-facing role.',
    description: 'Promoting on-label only, adverse event reporting and the code of practice.',
  },
  {
    id: 'ai-assistant',
    short: 'AI prep',
    name: 'AI-assisted visit preparation',
    category: 'digital',
    demand: 3,
    reason: 'The field AI assistant rolls out to every team this quarter.',
    description: 'Using the approved AI assistant to prepare visits, summarise accounts and check facts.',
  },
];

/** Target level per skill, by role. A gap is target minus current level. */
export const roles = {
  rep: {
    label: 'Field Sales Rep',
    targets: {
      'sci-cardio': 3, 'sci-clinical': 3, 'sci-lumeva': 3, 'eng-discovery': 3, 'eng-objection': 3,
      'eng-omni': 3, 'bus-account': 2, 'bus-access': 2, 'bus-insights': 3, 'cmp-ethics': 4, 'ai-assistant': 3,
    },
  },
  kam: {
    label: 'Key Account Manager',
    targets: {
      'sci-cardio': 3, 'sci-clinical': 4, 'sci-lumeva': 4, 'eng-discovery': 4, 'eng-objection': 4,
      'eng-omni': 3, 'bus-account': 4, 'bus-access': 4, 'bus-insights': 3, 'cmp-ethics': 4, 'ai-assistant': 3,
    },
  },
};

/** Skills that decide whether a rep is ready for the Lumeva launch. */
export const LAUNCH_SKILLS = ['sci-lumeva', 'sci-clinical', 'eng-objection'];

export const teams = [
  { id: 'lis-n', name: 'Lisbon North', lead: 'Rui Costa' },
  { id: 'lis-s', name: 'Lisbon South', lead: 'Inês Ferreira' },
  { id: 'porto', name: 'Porto', lead: 'Tiago Moreira' },
];

// Skill points in the same order as `skills` above. Level = points / 100 (rounded down).
const SKILL_ORDER = skills.map((s) => s.id);
const points = (list) => Object.fromEntries(SKILL_ORDER.map((id, i) => [id, list[i]]));

export const reps = [
  { id: 'MR', name: 'Marta Ribeiro', team: 'lis-n', role: 'rep', xp: 2410, weeklyXp: 310, streak: 6, activeDaysAgo: 0, hue: ['#5b86f0', '#3a3fb8'],
    skills: points([340, 260, 60, 360, 230, 180, 250, 210, 270, 420, 140]) },
  { id: 'JA', name: 'João Almeida', team: 'lis-n', role: 'kam', xp: 4120, weeklyXp: 380, streak: 14, activeDaysAgo: 0, hue: ['#8b7bff', '#5a3fc0'],
    skills: points([410, 420, 310, 440, 390, 260, 430, 380, 300, 460, 220]) },
  { id: 'SC', name: 'Sofia Carvalho', team: 'lis-n', role: 'rep', xp: 1680, weeklyXp: 120, streak: 2, activeDaysAgo: 1, hue: ['#f08bb4', '#b8456f'],
    skills: points([300, 210, 90, 330, 170, 320, 220, 140, 350, 400, 310]) },
  { id: 'PM', name: 'Pedro Martins', team: 'lis-n', role: 'rep', xp: 860, weeklyXp: 0, streak: 0, activeDaysAgo: 12, hue: ['#9ca3af', '#4b5563'],
    skills: points([260, 180, 40, 250, 150, 110, 180, 120, 160, 330, 60]) },
  { id: 'AL', name: 'Ana Lopes', team: 'lis-s', role: 'rep', xp: 3050, weeklyXp: 420, streak: 21, activeDaysAgo: 0, hue: ['#4fc3c9', '#1f7a80'],
    skills: points([380, 330, 310, 370, 310, 340, 280, 230, 360, 450, 330]) },
  { id: 'RS', name: 'Ricardo Sousa', team: 'lis-s', role: 'kam', xp: 2890, weeklyXp: 150, streak: 3, activeDaysAgo: 2, hue: ['#e6b25c', '#a5701f'],
    skills: points([400, 350, 180, 410, 320, 200, 410, 420, 250, 430, 130]) },
  { id: 'CN', name: 'Carla Nunes', team: 'lis-s', role: 'rep', xp: 1990, weeklyXp: 260, streak: 9, activeDaysAgo: 0, hue: ['#4ade80', '#15803d'],
    skills: points([320, 240, 150, 340, 210, 290, 230, 200, 310, 380, 260]) },
  { id: 'BG', name: 'Bruno Gomes', team: 'lis-s', role: 'rep', xp: 1240, weeklyXp: 60, streak: 1, activeDaysAgo: 4, hue: ['#ff8f8f', '#b23b3b'],
    skills: points([280, 190, 70, 290, 160, 140, 200, 150, 190, 290, 90]) },
  { id: 'HP', name: 'Helena Pinto', team: 'porto', role: 'kam', xp: 3560, weeklyXp: 290, streak: 11, activeDaysAgo: 0, hue: ['#a9c1ff', '#3a62d8'],
    skills: points([430, 400, 330, 420, 410, 240, 450, 400, 280, 470, 180]) },
  { id: 'DF', name: 'Diana Fonseca', team: 'porto', role: 'rep', xp: 2230, weeklyXp: 340, streak: 8, activeDaysAgo: 0, hue: ['#c084fc', '#7e22ce'],
    skills: points([350, 280, 210, 320, 260, 230, 240, 190, 330, 410, 300]) },
  { id: 'MC', name: 'Miguel Cardoso', team: 'porto', role: 'rep', xp: 1420, weeklyXp: 90, streak: 0, activeDaysAgo: 6, hue: ['#fb923c', '#c2410c'],
    skills: points([300, 200, 100, 310, 140, 170, 210, 160, 220, 360, 110]) },
  { id: 'TV', name: 'Teresa Vieira', team: 'porto', role: 'rep', xp: 2760, weeklyXp: 230, streak: 5, activeDaysAgo: 1, hue: ['#22d3ee', '#0e7490'],
    skills: points([360, 300, 300, 350, 300, 310, 260, 220, 300, 440, 280]) },
];

export const DEFAULT_REP = 'MR';

/**
 * Quest types. Lessons and quizzes complete straight away. Role-plays and field challenges are
 * submitted to the team lead, who approves them in Team insights before XP is awarded.
 */
export const QUEST_TYPES = {
  lesson: { label: 'Micro-lesson', approval: false },
  quiz: { label: 'Quiz', approval: false },
  roleplay: { label: 'Role-play', approval: true },
  field: { label: 'Field challenge', approval: true },
  coaching: { label: 'Peer coaching', approval: false },
};

export const quests = [
  // Lumeva launch
  { id: 'Q-LUM-1', skill: 'sci-lumeva', type: 'lesson', title: 'Lumeva in 5 minutes', minutes: 5, xp: 40, points: 40,
    body: ['Lumeva is a once-monthly injection that lowers LDL cholesterol for adults at high cardiovascular risk who are not at goal on a statin.', 'Key message: an extra, sustained LDL reduction on top of current therapy, with one injection a month.', 'The patient to picture: someone who has had a heart attack, takes a statin every day and is still above their LDL target.'] },
  { id: 'Q-LUM-2', skill: 'sci-lumeva', type: 'quiz', title: 'Lumeva launch check', minutes: 4, xp: 60, points: 60,
    questions: [
      { q: 'Which patient best fits the Lumeva profile?', options: ['A healthy 30-year-old with normal cholesterol', 'A post-heart-attack patient on a statin who is still above LDL target', 'Anyone who prefers not to take a statin', 'Patients with low blood pressure'], answer: 1 },
      { q: 'How often is Lumeva given?', options: ['Daily tablet', 'Weekly tablet', 'Once-monthly injection', 'Yearly infusion'], answer: 2 },
      { q: 'What is the core Lumeva key message?', options: ['It replaces every other treatment', 'Extra, sustained LDL reduction on top of current therapy', 'It works best without a statin', 'It has no side effects at all'], answer: 1 },
    ] },
  { id: 'Q-LUM-3', skill: 'sci-lumeva', type: 'roleplay', title: 'Launch pitch role-play', minutes: 15, xp: 120, points: 90,
    body: ['Record a 3-minute Lumeva introduction for a cardiologist, using the approved key messages.', 'Your team lead reviews it and gives feedback before the XP is awarded.'] },
  // Clinical data
  { id: 'Q-CLN-1', skill: 'sci-clinical', type: 'lesson', title: 'Endpoints without the jargon', minutes: 6, xp: 40, points: 40,
    body: ['A primary endpoint is the main question a trial was designed to answer. Secondary endpoints are useful, but they support the story rather than prove it.', 'Relative risk reduction sounds bigger than absolute risk reduction. Always be ready to give both.', 'Only quote results from the approved materials, and say which trial and population they come from.'] },
  { id: 'Q-CLN-2', skill: 'sci-clinical', type: 'quiz', title: 'Read the trial', minutes: 4, xp: 60, points: 60,
    questions: [
      { q: 'Risk drops from 10% to 8%. What is the absolute risk reduction?', options: ['2 percentage points', '20%', '8%', '10%'], answer: 0 },
      { q: 'Same numbers: what is the relative risk reduction?', options: ['2%', '20%', '80%', '18%'], answer: 1 },
      { q: 'What does the primary endpoint tell you?', options: ['The most exciting result', 'The main question the trial was designed to answer', 'The side effects', 'How many sites took part'], answer: 1 },
    ] },
  // Objection handling
  { id: 'Q-OBJ-1', skill: 'eng-objection', type: 'lesson', title: 'The 4-step objection method', minutes: 5, xp: 40, points: 40,
    body: ['1. Acknowledge: show you heard the concern without arguing.', '2. Explore: ask a question to find the real reason behind it.', '3. Answer: respond with approved evidence that fits that reason.', '4. Confirm: check the answer worked before moving on.'] },
  { id: 'Q-OBJ-2', skill: 'eng-objection', type: 'quiz', title: 'Handle the "too expensive" objection', minutes: 3, xp: 60, points: 60,
    questions: [
      { q: 'A doctor says "It\'s too expensive." What is the best first step?', options: ['Offer a discount', 'Acknowledge the concern and ask what cost means for their patients', 'Move on to another product', 'Say every new medicine is expensive'], answer: 1 },
      { q: 'Why explore before answering?', options: ['To buy time', 'Objections often hide a different real concern', 'It is required by law', 'To make the visit longer'], answer: 1 },
      { q: 'After answering, you should…', options: ['End the visit straight away', 'Check whether the answer addressed the concern', 'Repeat the answer louder', 'Change the subject'], answer: 1 },
    ] },
  { id: 'Q-OBJ-3', skill: 'eng-objection', type: 'roleplay', title: 'Switching objection role-play', minutes: 15, xp: 120, points: 90,
    body: ['Role-play with a colleague: a cardiologist is happy with the current treatment and sees no reason to switch patients.', 'Submit a short reflection. Your team lead reviews it.'] },
  // Omnichannel
  { id: 'Q-OMN-1', skill: 'eng-omni', type: 'lesson', title: 'Remote visits that work', minutes: 5, xp: 40, points: 40,
    body: ['Keep remote visits short: 10 to 15 minutes with one clear objective.', 'Share one visual at a time and ask a question every few minutes to keep it a conversation.', 'Follow up with an approved email that recaps what you discussed.'] },
  { id: 'Q-OMN-2', skill: 'eng-omni', type: 'field', title: 'Run 3 remote visits this week', minutes: 45, xp: 150, points: 100,
    body: ['Book and run three remote visits with customers who prefer digital contact.', 'Log them in the CRM. Your team lead approves the challenge once they are logged.'] },
  { id: 'Q-OMN-3', skill: 'eng-omni', type: 'quiz', title: 'Pick the right channel', minutes: 3, xp: 60, points: 60,
    questions: [
      { q: 'A busy GP only has 10 minutes on Thursday afternoons. Best channel?', options: ['A long lunch meeting', 'A short, focused remote visit', 'No contact', 'Five follow-up emails'], answer: 1 },
      { q: 'After a remote visit you should…', options: ['Send an approved recap email', 'Write a personal email with your own claims', 'Do nothing', 'Send a text message with prices'], answer: 0 },
      { q: 'Omnichannel means…', options: ['Replacing visits with emails', 'Coordinating several channels around what each customer prefers', 'Using every channel as often as possible', 'Only using social media'], answer: 1 },
    ] },
  // CRM & insights
  { id: 'Q-CRM-1', skill: 'bus-insights', type: 'lesson', title: 'Read your territory dashboard', minutes: 6, xp: 40, points: 40,
    body: ['Start with the trend, not the total: is each account growing, flat or declining?', 'Look for accounts with high potential and low engagement. Those are your best opportunities.', 'Good data starts with you: log every interaction on the day it happens.'] },
  { id: 'Q-CRM-2', skill: 'bus-insights', type: 'field', title: 'Plan next week from the data', minutes: 30, xp: 120, points: 90,
    body: ['Use the territory dashboard to pick your five priority accounts for next week and explain why.', 'Share the plan with your team lead for approval.'] },
  // AI assistant
  { id: 'Q-AI-1', skill: 'ai-assistant', type: 'lesson', title: 'Prepare a visit with the AI assistant', minutes: 5, xp: 40, points: 40,
    body: ['Ask for an account summary: last interactions, open questions and what the customer cares about.', 'Give context in your prompt: who you are seeing, the goal of the visit and the format you want.', 'Check every fact against approved sources. The assistant helps you prepare. You stay responsible for what you say.'] },
  { id: 'Q-AI-2', skill: 'ai-assistant', type: 'quiz', title: 'Prompting for the field', minutes: 3, xp: 60, points: 60,
    questions: [
      { q: 'Which prompt will give the most useful visit prep?', options: ['"Tell me about cardiology"', '"Summarise my last 3 visits with Dr Silva, her open questions and one goal for Thursday"', '"Help"', '"Write something about Lumeva"'], answer: 1 },
      { q: 'The assistant gives a figure you have not seen before. You should…', options: ['Use it straight away', 'Check it against approved materials before using it', 'Share it with every customer', 'Ignore all AI answers forever'], answer: 1 },
      { q: 'What should you never paste into the assistant?', options: ['The name of an approved product', 'A patient\'s personal health details', 'Your visit goal', 'A public guideline title'], answer: 1 },
    ] },
  { id: 'Q-AI-3', skill: 'ai-assistant', type: 'coaching', title: 'Share your best prompt', minutes: 10, xp: 80, points: 60,
    body: ['Post the prompt that saved you the most time this week in the team channel and explain how you use it.', 'Peer coaching spreads what works faster than any course.'] },
  // Market access
  { id: 'Q-ACC-1', skill: 'bus-access', type: 'lesson', title: 'How a hospital formulary decides', minutes: 7, xp: 40, points: 40,
    body: ['A pharmacy and therapeutics committee reviews new medicines for the hospital formulary.', 'They look at clinical value, budget impact and how the medicine fits current treatment pathways.', 'Your role: know the decision calendar and connect the right experts, not negotiate prices.'] },
  { id: 'Q-ACC-2', skill: 'bus-access', type: 'quiz', title: 'Access basics', minutes: 3, xp: 60, points: 60,
    questions: [
      { q: 'Who usually decides if a medicine enters a hospital formulary?', options: ['One doctor', 'A pharmacy and therapeutics committee', 'The sales rep', 'The patient'], answer: 1 },
      { q: 'Which of these is part of the decision?', options: ['Budget impact', 'The rep\'s targets', 'Brand colours', 'Number of visits'], answer: 0 },
      { q: 'As a rep, your best contribution is to…', options: ['Negotiate prices yourself', 'Know the decision calendar and connect the right experts', 'Avoid the pharmacy team', 'Promise faster approval'], answer: 1 },
    ] },
  // Compliance
  { id: 'Q-CMP-1', skill: 'cmp-ethics', type: 'quiz', title: 'Compliance refresher', minutes: 4, xp: 60, points: 60,
    questions: [
      { q: 'A doctor asks about an unapproved (off-label) use. You should…', options: ['Share what you have heard from other doctors', 'Not promote it, and offer a Medical Information request', 'Answer if nobody else is listening', 'Send an article by email'], answer: 1 },
      { q: 'A customer mentions a side effect in a patient. When do you report it?', options: ['Only if it is serious', 'Within the required time, every time', 'At the end of the quarter', 'Never, the doctor will do it'], answer: 1 },
      { q: 'Which materials can you use with customers?', options: ['Only approved materials', 'Anything published online', 'Slides you made yourself', 'Competitor brochures'], answer: 0 },
    ] },
  { id: 'Q-CMP-2', skill: 'cmp-ethics', type: 'lesson', title: 'Adverse events in 3 rules', minutes: 4, xp: 40, points: 40,
    body: ['Any side effect you hear about, from anyone, gets reported.', 'Report it within the required timeframe, even if you are not sure it is related.', 'Do not investigate or judge it. That is the safety team\'s job.'] },
  // Discovery
  { id: 'Q-DSC-1', skill: 'eng-discovery', type: 'lesson', title: 'Questions that open conversations', minutes: 5, xp: 40, points: 40,
    body: ['Open questions start with what, how or tell me about.', 'Listen for the need behind the answer before you present anything.', 'Summarise what you heard. It shows you listened and lets the customer correct you.'] },
  { id: 'Q-DSC-2', skill: 'eng-discovery', type: 'coaching', title: 'Shadow a top performer', minutes: 60, xp: 90, points: 70,
    body: ['Join a colleague on two visits and note the questions they ask.', 'Agree one technique you will try on your next visit.'] },
  // Account planning
  { id: 'Q-ACP-1', skill: 'bus-account', type: 'lesson', title: 'One-page account plan', minutes: 6, xp: 40, points: 40,
    body: ['Who matters in the account, and what does each person need?', 'One objective for this quarter, written so you can tell whether you reached it.', 'Three actions with dates. Review the plan every month.'] },
  // Cardio science
  { id: 'Q-CAR-1', skill: 'sci-cardio', type: 'quiz', title: 'Cholesterol essentials', minutes: 3, xp: 60, points: 60,
    questions: [
      { q: 'Which cholesterol is often called "bad" cholesterol?', options: ['HDL', 'LDL', 'Triglycerides', 'Vitamin D'], answer: 1 },
      { q: 'High LDL mainly increases the risk of…', options: ['Cardiovascular events like heart attack', 'Broken bones', 'Hearing loss', 'Skin rashes'], answer: 0 },
      { q: 'The usual first-line treatment for high LDL is…', options: ['A statin', 'An antibiotic', 'Surgery', 'No treatment'], answer: 0 },
    ] },
];

/**
 * Team challenge: a shared goal so the game is about the team as well as individuals.
 * `baseDone` is progress before this session; quests completed in the app add to it.
 */
export const teamChallenge = {
  title: 'Lumeva launch sprint',
  description: 'Complete 80 Lumeva launch quests across the field force before 30 November.',
  skill: 'sci-lumeva',
  goal: 80,
  baseDone: 47,
  ends: '2026-11-30',
};

/** Adoption history for the last 8 weeks (weeks 38–45). */
export const adoptionHistory = [
  { week: 'W38', activeRate: 0.42, quests: 31 },
  { week: 'W39', activeRate: 0.5, quests: 38 },
  { week: 'W40', activeRate: 0.58, quests: 46 },
  { week: 'W41', activeRate: 0.67, quests: 44 },
  { week: 'W42', activeRate: 0.75, quests: 57 },
  { week: 'W43', activeRate: 0.75, quests: 61 },
  { week: 'W44', activeRate: 0.83, quests: 68 },
  { week: 'W45', activeRate: 0.92, quests: 64 },
];

/** Quests waiting for a team lead when the demo starts. */
export const initialPending = [
  { repId: 'CN', questId: 'Q-OMN-2', submitted: '2026-11-03' },
  { repId: 'DF', questId: 'Q-LUM-3', submitted: '2026-11-04' },
];

export const skillById = Object.fromEntries(skills.map((s) => [s.id, s]));
export const questById = Object.fromEntries(quests.map((q) => [q.id, q]));
export const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
