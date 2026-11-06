/**
 * Central portfolio data — generated from Himanshu's resume (AI_ML.pdf).
 * Every fact on the site comes from this file. Update it here and the whole site follows.
 * Nothing here should be added unless it appears on the resume.
 */

export type Palette = { from: string; via: string; to: string; accent: string };

export const profile = {
  fullName: 'Himanshu Kumar',
  displayName: 'Himanshu Kumar',
  firstName: 'HIMANSHU',
  seriesTag: 'THE SERIES',
  /** Fictional studio card shown at the very start of the opening sequence. */
  originalLabel: 'A KUMAR ORIGINAL',
  role: 'AI / ML Engineer',
  tagline: ['AI / ML Engineer', 'Generative AI', 'Python'],
  /** Short label for the current degree, used in the hero, About and intro. */
  degreeShort: 'M.Tech CSE',
  /** Shown on the hero's floating chip. */
  primaryStack: 'Python · LLMs · RAG',
  primaryLanguage: { name: 'Python', with: 'with C++, Java, JavaScript, C' },
  intro:
    'An M.Tech Computer Science student at NIT Silchar with expertise in Machine Learning, Deep Learning and Generative AI — building LLM-based and data-driven applications with RAG pipelines, NLP and model deployment. Seeking an AI/ML Engineer role.',
  location: 'Silchar, Assam',
  email: 'himanshuramgariya@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/himanshukumar111/',
    github: 'https://github.com/himanshugithub360',
  },
  resumePdf: '/assets/Himanshu_Kumar_Resume.pdf',
  resumeFileName: 'Himanshu_Kumar_Resume.pdf',
  portrait: {
    src: '/assets/portrait-720.webp',
    srcSet: '/assets/portrait-420.webp 420w, /assets/portrait-720.webp 720w, /assets/portrait-1100.webp 1100w',
    alt: 'Portrait of Himanshu Kumar',
  },
  interests: ['Generative AI', 'LLMs & RAG', 'Computer Vision'],
};

export const education = [
  {
    school: 'National Institute of Technology Silchar',
    place: 'Assam',
    degree: 'Master of Technology — Computer Science and Engineering',
    period: 'August 2025 – May 2027',
    score: 'CGPA 7.94',
  },
  {
    school: 'Tezpur University',
    place: 'Assam',
    degree: 'Bachelor of Technology — Computer Science and Engineering',
    period: 'October 2021 – May 2025',
    score: 'CGPA 8.01',
  },
];

export const experience = [
  {
    company: 'ABB',
    role: 'Embedded Systems (Linux) Intern',
    place: 'Bangalore',
    period: 'Aug 2026 – Present',
    points: [
      'Developed and debugged Linux-based applications for embedded systems using C/C++ and Python.',
      'Analysed system boot, kernel, systemd, service, and runtime logs to identify embedded Linux issues.',
      'Worked with Linux system components, process management, device interfaces, and system-level debugging.',
    ],
  },
  {
    company: 'C-DAC',
    role: 'Open5G Intern',
    place: 'Pune',
    period: 'Jun 2024 – Aug 2024',
    points: [
      'Gained hands-on experience with Open5GS, implementing 5G mobile core network functions.',
      'Conducted 5G network simulations using UERANSIM to analyse network protocol behaviour.',
      'Strengthened Linux/Unix skills for network deployment and system management.',
    ],
  },
];

export type Metric = { value: string; label: string };

export type Project = {
  id: string;
  title: string;
  /** The resume gives no project dates — leave empty and the year badge is hidden. */
  year?: string;
  genre: string;
  logline: string;
  stack: string[];
  build: string[];
  features: string[];
  metrics: Metric[];
  /** Omit when the repository isn't public — the GitHub button is hidden instead of linking to a 404. */
  github?: string;
  /** Live demo, when one exists. */
  live?: string;
  palette: Palette;
  motif: 'shield' | 'flow' | 'tenants';
};

export const projects: Project[] = [
  {
    id: 'shadowtrace',
    title: 'ShadowTrace',
    genre: 'AI • NLP • LLM • RAG',
    logline: 'AI-powered WhatsApp chats intelligence — a conversation analytics platform built on NLP, LLMs and a FAISS RAG pipeline.',
    stack: ['Python', 'Streamlit', 'NLP', 'LLM', 'RAG', 'FAISS'],
    build: [
      'Built an AI-driven conversation analytics platform processing 1M+ messages using NLP and LLMs.',
      'Implemented 6+ NLP modules for sentiment, emotion, topic, keyword, toxicity, and language analysis.',
      'Developed a RAG pipeline with FAISS for semantic search, contextual retrieval, and LLM-based Q&A.',
      'Integrated 5+ LLM features for summarization, recommendations, highlights, and conversational insights.',
    ],
    features: [
      'Sentiment, emotion, topic, keyword, toxicity & language analysis',
      'FAISS semantic search & contextual retrieval',
      'LLM-based Q&A over your chats',
      'Summaries, recommendations & highlights',
    ],
    metrics: [
      { value: '1M+', label: 'messages processed' },
      { value: '6+', label: 'NLP modules' },
      { value: '5+', label: 'LLM features' },
    ],
    live: 'https://shadowtrace.streamlit.app/',
    palette: { from: '#2a0610', via: '#7a0f24', to: '#0b0710', accent: '#ff3d5a' },
    motif: 'shield',
  },
  {
    id: 'medirag',
    title: 'MediRAG',
    genre: 'GenAI • RAG • Healthcare',
    logline: 'An AI-powered medical assistant — a RAG-based medical QA system built with LangChain and Mistral AI.',
    stack: ['Python', 'Flask', 'LangChain', 'Mistral AI', 'HuggingFace', 'Pinecone'],
    build: [
      'Built a RAG-based medical QA system using LangChain and Mistral AI.',
      'Processed medical documents using PDF extraction, text chunking, and HuggingFace embeddings.',
      'Implemented Pinecone semantic search to retrieve relevant medical context for LLM-generated responses.',
      'Developed a Flask-based conversational web application with an interactive chat interface.',
    ],
    features: [
      'PDF extraction & text chunking',
      'HuggingFace embeddings',
      'Pinecone semantic search',
      'Interactive Flask chat interface',
    ],
    metrics: [
      { value: 'RAG', label: 'retrieval-augmented generation' },
      { value: 'Mistral', label: 'LLM via LangChain' },
      { value: 'Pinecone', label: 'vector search' },
    ],
    github: 'https://github.com/himanshugithub360/MediRAG',
    palette: { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' },
    motif: 'tenants',
  },
  {
    id: 'fitness-tracker',
    title: 'AI Fitness Tracker',
    genre: 'Full-Stack • Computer Vision',
    logline: 'A full-stack fitness tracking web app with authentication, dashboards and AI-based food recognition.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Strapi', 'Gemini API'],
    build: [
      'Built a full-stack fitness tracking application with authentication and dashboards.',
      'Implemented AI-based food recognition achieving ~75–85% accuracy on test inputs.',
      'Integrated RESTful APIs with Strapi CMS, reducing data fetch time by ~30%.',
      'Designed responsive UI and modular components for improved usability across devices.',
    ],
    features: [
      'Authentication & dashboards',
      'AI food recognition (Gemini API)',
      'Strapi CMS REST APIs',
      'Responsive, modular UI',
    ],
    metrics: [
      { value: '~75–85%', label: 'food recognition accuracy' },
      { value: '~30%', label: 'faster data fetch' },
    ],
    palette: { from: '#1a0d02', via: '#8a4a07', to: '#0a0806', accent: '#ffb547' },
    motif: 'flow',
  },
];

export type Achievement = {
  id: string;
  title: string;
  org: string;
  detail: string;
  laurel: string;
  link?: string;
};

export const achievements: Achievement[] = [
  {
    id: 'abb',
    title: 'Embedded Linux Intern',
    org: 'ABB Bangalore',
    detail: 'Embedded Systems (Linux) internship — C/C++ and Python applications, kernel and systemd log analysis.',
    laurel: 'Industry',
  },
  {
    id: 'competitive-coding',
    title: '200+ Problems Solved',
    org: 'LeetCode • GFG • Coding Ninjas',
    detail: 'Competitive programming across LeetCode, GeeksforGeeks and Coding Ninjas.',
    laurel: 'Competitive Coding',
  },
  {
    id: 'nss',
    title: 'Department Representative',
    org: 'National Service Scheme (NSS)',
    detail: 'Represented the department in the National Service Scheme.',
    laurel: 'Leadership',
  },
  {
    id: 'prefect',
    title: 'Assistant Prefect',
    org: "Patkai Men's Hostel",
    detail: "Served as Assistant Prefect of Patkai Men's Hostel.",
    laurel: 'Leadership',
  },
];

export type Certification = { issuer: string; name: string; link: string };

/** None on the resume yet — the certifications rail is hidden while this is empty. */
export const certifications: Certification[] = [];

export type Skill = { name: string; mono: string; note?: string };
export type SkillCategory = { id: string; title: string; subtitle: string; skills: Skill[] };

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages',
    subtitle: 'Python is the primary language',
    skills: [
      { name: 'Python', mono: 'Py', note: 'Primary' },
      { name: 'C++', mono: 'C+' },
      { name: 'Java', mono: 'Jv' },
      { name: 'JavaScript', mono: 'Js' },
      { name: 'C', mono: 'C' },
    ],
  },
  {
    id: 'aiml',
    title: 'AI / ML',
    subtitle: 'Models & intelligence',
    skills: [
      { name: 'Machine Learning', mono: 'Ml' },
      { name: 'Deep Learning', mono: 'Dl' },
      { name: 'NLP', mono: 'Nl' },
      { name: 'LLMs', mono: 'Lm' },
      { name: 'RAG', mono: 'Rg' },
      { name: 'Computer Vision', mono: 'Cv' },
    ],
  },
  {
    id: 'genai',
    title: 'GenAI Tools',
    subtitle: 'Model APIs',
    skills: [
      { name: 'OpenAI API', mono: 'Oa' },
      { name: 'Gemini API', mono: 'Gm' },
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks & Libraries',
    subtitle: 'The ML toolbox',
    skills: [
      { name: 'Scikit-learn', mono: 'Sk' },
      { name: 'TensorFlow', mono: 'Tf' },
      { name: 'Keras', mono: 'Ke' },
      { name: 'PyTorch', mono: 'Pt' },
      { name: 'LangChain', mono: 'Lc' },
    ],
  },
  {
    id: 'web',
    title: 'Web & Backend',
    subtitle: 'Shipping it to users',
    skills: [
      { name: 'React.js', mono: 'Re' },
      { name: 'Django', mono: 'Dj' },
      { name: 'Flask', mono: 'Fl' },
      { name: 'Node.js', mono: 'No' },
      { name: 'REST APIs', mono: 'Ap' },
      { name: 'Tailwind CSS', mono: 'Tw' },
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    subtitle: 'Relational & vector',
    skills: [
      { name: 'MySQL', mono: 'My' },
      { name: 'PostgreSQL', mono: 'Pg' },
      { name: 'Firebase', mono: 'Fb' },
      { name: 'FAISS', mono: 'Fs' },
      { name: 'Pinecone', mono: 'Pc' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Technologies',
    subtitle: 'Everyday workflow',
    skills: [
      { name: 'Git', mono: 'Gt' },
      { name: 'Docker', mono: 'Dk' },
      { name: 'Linux / Unix', mono: 'Lx' },
      { name: 'Postman', mono: 'Pm' },
      { name: 'VS Code', mono: 'Vs' },
    ],
  },
  {
    id: 'fundamentals',
    title: 'Core Concepts',
    subtitle: 'The foundations',
    skills: [
      { name: 'DSA', mono: 'Ds' },
      { name: 'OOPs', mono: 'Oo' },
      { name: 'DBMS', mono: 'Db' },
      { name: 'Operating Systems', mono: 'Os' },
    ],
  },
];

/**
 * Factual cross-references shown when a skill card is hovered/tapped:
 * where the skill appears in the projects, experience or achievements on the resume.
 */
export const skillEvidence: Record<string, string[]> = {
  Python: ['ShadowTrace', 'MediRAG', 'ABB internship'],
  'C++': ['ABB internship'],
  C: ['ABB internship'],
  NLP: ['ShadowTrace'],
  LLMs: ['ShadowTrace', 'MediRAG'],
  RAG: ['ShadowTrace', 'MediRAG'],
  'Computer Vision': ['AI Fitness Tracker (food recognition)'],
  'Gemini API': ['AI Fitness Tracker'],
  LangChain: ['MediRAG'],
  'React.js': ['AI Fitness Tracker'],
  Flask: ['MediRAG'],
  'REST APIs': ['AI Fitness Tracker'],
  'Tailwind CSS': ['AI Fitness Tracker'],
  FAISS: ['ShadowTrace'],
  Pinecone: ['MediRAG'],
  'Linux / Unix': ['ABB internship', 'C-DAC Open5G internship'],
  DSA: ['200+ problems solved'],
  'Operating Systems': ['ABB internship'],
};

export type Episode = {
  code: string;
  title: string;
  description: string;
  tags: string[];
  runtime: string;
  palette: Palette;
};

export type Season = {
  number: number;
  title: string;
  period: string;
  synopsis: string;
  episodes: Episode[];
};

const crimson: Palette = { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' };
const amber: Palette = { from: '#1c1003', via: '#6b3c06', to: '#0a0806', accent: '#ffb547' };
const ocean: Palette = { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' };
const violet: Palette = { from: '#120822', via: '#3d1a6e', to: '#07060c', accent: '#b98bff' };
const jade: Palette = { from: '#03150f', via: '#0d5a40', to: '#050a08', accent: '#46e3a8' };

export const seasons: Season[] = [
  {
    number: 1,
    title: 'The Beginning',
    period: '2021 – 2025',
    synopsis: 'B.Tech in Computer Science and Engineering at Tezpur University, Assam.',
    episodes: [
      {
        code: 'S01 E01',
        title: 'The Foundation',
        description: 'Bachelor of Technology in Computer Science and Engineering at Tezpur University — CGPA 8.01.',
        tags: ['B.Tech', 'CSE', 'CGPA 8.01'],
        runtime: 'Oct 2021 – May 2025',
        palette: amber,
      },
      {
        code: 'S01 E02',
        title: 'The Leader',
        description: "Department Representative for the National Service Scheme and Assistant Prefect of Patkai Men's Hostel.",
        tags: ['NSS', 'Leadership'],
        runtime: 'Campus life',
        palette: crimson,
      },
      {
        code: 'S01 E03',
        title: 'The Problem Solver',
        description: 'Data Structures & Algorithms practice — 200+ problems solved on LeetCode, GFG and Coding Ninjas.',
        tags: ['DSA', 'LeetCode', 'GFG', 'Coding Ninjas'],
        runtime: '200+ problems',
        palette: jade,
      },
    ],
  },
  {
    number: 2,
    title: 'Into the Network',
    period: '2024',
    synopsis: 'A summer as an Open5G Intern at C-DAC Pune, working on the 5G mobile core.',
    episodes: [
      {
        code: 'S02 E01',
        title: 'The Core',
        description: 'Hands-on experience with Open5GS, implementing 5G mobile core network functions.',
        tags: ['Open5GS', '5G'],
        runtime: 'Jun – Aug 2024',
        palette: ocean,
      },
      {
        code: 'S02 E02',
        title: 'The Simulation',
        description: 'Ran 5G network simulations with UERANSIM to analyse network protocol behaviour, sharpening Linux/Unix skills.',
        tags: ['UERANSIM', 'Linux / Unix'],
        runtime: 'C-DAC Pune',
        palette: violet,
      },
    ],
  },
  {
    number: 3,
    title: 'Building with AI',
    period: 'The Originals',
    synopsis: 'Three Originals — a chat-intelligence platform, a medical RAG assistant and an AI fitness tracker.',
    episodes: [
      {
        code: 'S03 E01',
        title: 'The Analyst',
        description: 'ShadowTrace — 1M+ messages through 6+ NLP modules and a FAISS-powered RAG pipeline.',
        tags: ['NLP', 'LLM', 'FAISS'],
        runtime: 'ShadowTrace',
        palette: crimson,
      },
      {
        code: 'S03 E02',
        title: 'The Assistant',
        description: 'MediRAG — a medical QA system with LangChain, Mistral AI and Pinecone semantic search.',
        tags: ['LangChain', 'Mistral AI', 'Pinecone'],
        runtime: 'MediRAG',
        palette: ocean,
      },
      {
        code: 'S03 E03',
        title: 'The Builder',
        description: 'AI Fitness Tracker — React + Strapi with Gemini-powered food recognition at ~75–85% accuracy.',
        tags: ['React', 'TypeScript', 'Gemini API'],
        runtime: 'Fitness Tracker',
        palette: amber,
      },
    ],
  },
  {
    number: 4,
    title: 'Master Class',
    period: '2025 – Present',
    synopsis: 'M.Tech in Computer Science and Engineering at NIT Silchar, plus an embedded Linux internship at ABB.',
    episodes: [
      {
        code: 'S04 E01',
        title: 'The Postgrad',
        description: 'Master of Technology in Computer Science and Engineering at NIT Silchar — CGPA 7.94.',
        tags: ['M.Tech', 'CSE', 'CGPA 7.94'],
        runtime: 'Aug 2025 – May 2027',
        palette: violet,
      },
      {
        code: 'S04 E02',
        title: 'The Engineer',
        description: 'Embedded Systems (Linux) Intern at ABB Bangalore — C/C++ and Python apps, boot, kernel and systemd log analysis.',
        tags: ['Embedded Linux', 'C/C++', 'Python'],
        runtime: 'Aug 2026 – Present',
        palette: jade,
      },
    ],
  },
  {
    number: 5,
    title: "What's Next",
    period: 'Now streaming',
    synopsis: 'The next arc of the story: an AI/ML Engineer role.',
    episodes: [
      {
        code: 'S05 E01',
        title: 'The Next Chapter',
        description: 'Seeking an AI/ML Engineer role — building with Machine Learning, Deep Learning and Generative AI.',
        tags: ['GenAI', 'LLMs', 'RAG'],
        runtime: 'In production',
        palette: crimson,
      },
    ],
  },
];

export type TopPick = { label: string; title: string; detail: string; palette: Palette };

export const topPicks: TopPick[] = [
  { label: 'Primary language', title: 'Python', detail: 'Across every AI Original', palette: amber },
  { label: 'The AI Original', title: 'ShadowTrace', detail: '1M+ messages • 6+ NLP modules', palette: crimson },
  { label: 'The GenAI build', title: 'MediRAG', detail: 'LangChain • Mistral AI • Pinecone', palette: ocean },
  { label: 'Current role', title: 'ABB', detail: 'Embedded Systems (Linux) Intern', palette: violet },
  { label: 'Postgrad', title: 'NIT Silchar', detail: 'M.Tech CSE • CGPA 7.94', palette: jade },
  { label: 'First internship', title: 'C-DAC Pune', detail: 'Open5GS • UERANSIM', palette: amber },
  { label: 'Problems solved', title: '200+', detail: 'LeetCode • GFG • Coding Ninjas', palette: crimson },
  { label: 'Full-stack + AI', title: 'Fitness Tracker', detail: '~75–85% food recognition accuracy', palette: ocean },
  { label: 'Undergrad', title: 'Tezpur University', detail: 'B.Tech CSE • CGPA 8.01', palette: jade },
  { label: 'Leadership', title: 'NSS', detail: 'Department Representative', palette: violet },
];

/** Slides for the "▶ Play Intro" cinematic sequence. */
export type IntroSlide = { kicker: string; title: string; lines: string[]; chips?: string[] };

export const introSlides: IntroSlide[] = [
  {
    kicker: 'Education',
    title: 'M.Tech · CSE',
    lines: ['National Institute of Technology Silchar, Assam', 'August 2025 – May 2027', 'B.Tech CSE · Tezpur University · CGPA 8.01'],
    chips: ['CGPA 7.94'],
  },
  {
    kicker: 'Skills',
    title: 'Python first.',
    lines: ['ML · Deep Learning · NLP · LLMs · RAG · Computer Vision', 'PyTorch, TensorFlow, LangChain · FAISS, Pinecone'],
    chips: ['Python', 'PyTorch', 'LangChain', 'RAG', 'React', 'Docker'],
  },
  {
    kicker: 'Experience',
    title: 'Two Internships',
    lines: ['Embedded Systems (Linux) Intern · ABB Bangalore · Aug 2026 – Present', 'Open5G Intern · C-DAC Pune · Jun – Aug 2024'],
  },
  {
    kicker: 'Projects',
    title: 'Three Originals',
    lines: ['ShadowTrace — 1M+ messages, 6+ NLP modules', 'MediRAG — LangChain, Mistral AI, Pinecone', 'AI Fitness Tracker — ~75–85% food recognition'],
  },
  {
    kicker: 'Achievements',
    title: 'Top Moments',
    lines: ['200+ problems solved — LeetCode, GFG, Coding Ninjas', 'Department Representative — NSS', "Assistant Prefect — Patkai Men's Hostel"],
  },
  {
    kicker: 'Current mission',
    title: 'Now seeking',
    lines: ['An AI/ML Engineer role · Generative AI · LLMs & RAG'],
  },
];

export type ProfileId = 'himanshu' | 'recruiter' | 'developer' | 'creative';
export type SectionId = 'about' | 'journey' | 'originals' | 'picks' | 'skills' | 'moments' | 'story';

export const viewerProfiles: {
  id: ProfileId;
  name: string;
  blurb: string;
  color: string;
  order: SectionId[];
}[] = [
  {
    id: 'himanshu',
    name: 'Himanshu',
    blurb: 'The full series, in order',
    color: '#e5132b',
    order: ['about', 'journey', 'originals', 'picks', 'skills', 'moments', 'story'],
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    blurb: 'Resume, achievements & skills first',
    color: '#4cc9ff',
    order: ['story', 'moments', 'skills', 'originals', 'about', 'journey', 'picks'],
  },
  {
    id: 'developer',
    name: 'Developer',
    blurb: 'Projects, stack & GitHub first',
    color: '#46e3a8',
    order: ['originals', 'skills', 'journey', 'moments', 'about', 'picks', 'story'],
  },
  {
    id: 'creative',
    name: 'Creative',
    blurb: 'The story arc & highlights first',
    color: '#ffb547',
    order: ['journey', 'picks', 'originals', 'moments', 'about', 'skills', 'story'],
  },
];

export const sectionMeta: Record<SectionId, { nav: string; card: string; meta: string; palette: Palette }> = {
  about: { nav: 'About', card: 'About Me', meta: 'The Pilot • Education & experience', palette: violet },
  journey: { nav: 'Journey', card: 'My Journey', meta: `${seasons.length} Seasons • ${seasons.reduce((n, s) => n + s.episodes.length, 0)} Episodes`, palette: amber },
  originals: { nav: 'Originals', card: 'My Projects', meta: `${projects.length} Originals • AI / ML`, palette: crimson },
  picks: { nav: 'Top Picks', card: 'Top Picks', meta: 'Top 10 from the resume', palette: jade },
  skills: { nav: 'Skills', card: 'My Skills', meta: `${skillCategories.length} Categories`, palette: ocean },
  moments: {
    nav: 'Moments',
    card: 'My Achievements',
    meta: `${achievements.length} Moments${certifications.length ? ` • ${certifications.length} Certifications` : ''}`,
    palette: crimson,
  },
  story: { nav: 'Resume', card: 'The Full Story', meta: 'Resume • View & download', palette: violet },
};
