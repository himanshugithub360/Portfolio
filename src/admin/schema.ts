import type { Content, SectionId } from '../data/portfolio';
import { MOTIFS } from '../data/motifs';
import { FONT_CHOICES } from '../theme';
import type { Field } from './fields';

export type FormPage = {
  id: string;
  label: string;
  icon: string;
  group: 'Content' | 'Site' | 'Files';
  description: string;
  /** Dotted path in content.json that this page edits ('' = the whole file). */
  root: string;
  fields: Field[];
};
export type CustomPage = { id: string; label: string; icon: string; group: 'Content' | 'Site' | 'Files'; description: string; custom: 'media' | 'publish' };
export type Page = FormPage | CustomPage;

const crimson = { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' };

const sectionName = (c: Content) => (id: SectionId) => c.sections[id]?.card ?? id;

const paletteField: Field = { key: 'palette', label: 'Card colours', type: 'palette' };

export function buildPages(c: Content): Page[] {
  return [
    {
      id: 'profile',
      label: 'Personal info',
      icon: '👤',
      group: 'Content',
      description: 'Your name, intro and contact links. Used across the hero, resume sheet and footer.',
      root: 'profile',
      fields: [
        { key: 'fullName', label: 'Full name', type: 'text', half: true },
        { key: 'displayName', label: 'Display name', type: 'text', half: true, help: 'Shown in the About card and footer.' },
        { key: 'firstName', label: 'Big hero title', type: 'text', half: true, help: 'The huge word on the home screen, e.g. HIMANSHU.' },
        { key: 'role', label: 'Role', type: 'text', half: true, help: 'e.g. AI / ML Engineer' },
        { key: 'intro', label: 'Intro paragraph', type: 'textarea', rows: 4, help: 'Shown under the hero title and as the quote in About.' },
        { key: 'tagline', label: 'Tagline words', type: 'list', help: 'Shown in capitals under the title, joined with •.' },
        { key: 'email', label: 'Email', type: 'email', half: true },
        { key: 'location', label: 'Location', type: 'text', half: true },
        { key: 'links.linkedin', label: 'LinkedIn URL', type: 'url', half: true },
        { key: 'links.github', label: 'GitHub URL', type: 'url', half: true },
        { key: 'interests', label: 'Interests', type: 'list', help: 'Chips in the About section.' },
        { key: 'degreeShort', label: 'Short degree label', type: 'text', half: true, help: 'e.g. M.Tech CSE' },
        { key: 'primaryStack', label: 'Primary stack', type: 'text', half: true },
        { key: 'primaryLanguage.name', label: 'Primary language', type: 'text', half: true },
        { key: 'primaryLanguage.with', label: 'Other languages line', type: 'text', half: true },
        { key: 'seriesTag', label: 'Series tag', type: 'text', half: true, help: 'Red line under the hero title.' },
        { key: 'originalLabel', label: 'Opening studio card', type: 'text', half: true, help: 'First text of the opening animation.' },
        { key: 'portrait.alt', label: 'Photo description', type: 'text', help: 'For screen readers.' },
        { key: 'resumeFileName', label: 'Resume download file name', type: 'text', help: 'Name of the PDF when a visitor downloads it.' },
      ],
    },
    {
      id: 'hero',
      label: 'Home screen',
      icon: '🏠',
      group: 'Content',
      description: 'The small details around the big title on the first screen.',
      root: 'hero',
      fields: [
        { key: 'badge', label: 'Badge', type: 'text', half: true, help: 'Small boxed label before the info line.' },
        {
          key: 'meta',
          label: 'Info line',
          type: 'list',
          help: 'Short facts shown in a row, separated by dots. {projects} and {internships} are replaced with live counts, e.g. “{projects} Originals”.',
        },
        {
          key: 'chips',
          label: 'Floating chips',
          type: 'items',
          max: 3,
          help: 'Up to three glass chips that float around your photo (desktop only).',
          itemTitle: (v) => v.text,
          newItem: () => ({ text: 'New chip', sub: 'Subtitle' }),
          item: [
            { key: 'text', label: 'Text', type: 'text', half: true },
            { key: 'sub', label: 'Small caption', type: 'text', half: true },
          ],
        },
      ],
    },
    {
      id: 'about',
      label: 'About',
      icon: '💬',
      group: 'Content',
      description: 'The fact tiles next to your photo in the About section.',
      root: 'about',
      fields: [
        {
          key: 'facts',
          label: 'Fact tiles',
          type: 'items',
          itemTitle: (v) => `${v.k}: ${v.v}`,
          newItem: () => ({ k: 'Label', v: 'Value', s: 'Detail' }),
          item: [
            { key: 'k', label: 'Label', type: 'text', half: true },
            { key: 'v', label: 'Value', type: 'text', half: true },
            { key: 's', label: 'Detail line', type: 'text' },
          ],
        },
      ],
    },
    {
      id: 'education',
      label: 'Education',
      icon: '🎓',
      group: 'Content',
      description: 'Listed newest first. The first entry also feeds the resume summary (CGPA).',
      root: '',
      fields: [
        {
          key: 'education',
          label: 'Schools',
          type: 'items',
          itemTitle: (v) => v.school,
          newItem: () => ({ school: 'New school', place: '', degree: '', period: '', score: '' }),
          item: [
            { key: 'school', label: 'School', type: 'text', half: true },
            { key: 'place', label: 'Place', type: 'text', half: true },
            { key: 'degree', label: 'Degree', type: 'text' },
            { key: 'period', label: 'Period', type: 'text', half: true, help: 'e.g. August 2025 – May 2027' },
            { key: 'score', label: 'Score', type: 'text', half: true, help: 'e.g. CGPA 7.94' },
          ],
        },
      ],
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: '💼',
      group: 'Content',
      description: 'Internships and jobs, newest first.',
      root: '',
      fields: [
        {
          key: 'experience',
          label: 'Roles',
          type: 'items',
          itemTitle: (v) => `${v.role} — ${v.company}`,
          newItem: () => ({ company: 'Company', role: 'Role', place: '', period: '', points: [] }),
          item: [
            { key: 'role', label: 'Role', type: 'text', half: true },
            { key: 'company', label: 'Company', type: 'text', half: true },
            { key: 'place', label: 'Place', type: 'text', half: true },
            { key: 'period', label: 'Period', type: 'text', half: true },
            { key: 'points', label: 'What you did', type: 'list', multiline: true },
          ],
        },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: '🎬',
      group: 'Content',
      description: 'Your “Originals”. Each one gets a card, a detail popup and a line in the resume sheet.',
      root: '',
      fields: [
        {
          key: 'projects',
          label: 'Projects',
          type: 'items',
          itemTitle: (v) => v.title,
          newItem: () => ({
            id: `project-${Date.now().toString(36)}`,
            title: 'New Project',
            genre: 'AI • ML',
            logline: 'One-sentence description shown on the card.',
            stack: [],
            build: [],
            features: [],
            metrics: [],
            palette: crimson,
            motif: 'shield',
          }),
          item: [
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'id', label: 'ID', type: 'text', half: true, help: 'Lowercase, numbers and dashes. Must be unique.' },
            { key: 'genre', label: 'Genre line', type: 'text', half: true, help: 'e.g. AI • NLP • LLM' },
            { key: 'year', label: 'Year (optional)', type: 'text', half: true, help: 'Leave empty to hide the year badge.' },
            { key: 'logline', label: 'Short description', type: 'textarea', rows: 2, help: 'Shown on the project card.' },
            { key: 'stack', label: 'Tech stack', type: 'list' },
            { key: 'build', label: 'My contribution (popup bullets)', type: 'list', multiline: true },
            { key: 'features', label: 'Key features', type: 'list' },
            {
              key: 'metrics',
              label: 'Result tiles',
              type: 'items',
              help: 'Big numbers in the popup, e.g. 92% / accuracy.',
              itemTitle: (m) => `${m.value} ${m.label}`,
              newItem: () => ({ value: '100%', label: 'label' }),
              item: [
                { key: 'value', label: 'Value', type: 'text', half: true },
                { key: 'label', label: 'Label', type: 'text', half: true },
              ],
            },
            { key: 'github', label: 'GitHub link (optional)', type: 'url', half: true },
            { key: 'live', label: 'Live demo link (optional)', type: 'url', half: true },
            {
              key: 'motif',
              label: 'Background art',
              type: 'select',
              half: true,
              options: MOTIFS.map((m) => ({ value: m.id, label: m.label })),
            },
            paletteField,
          ],
        },
      ],
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: '🧠',
      group: 'Content',
      description: 'Skill categories, and the “where it shows up” notes visitors see when they hover a skill.',
      root: '',
      fields: [
        {
          key: 'skillCategories',
          label: 'Categories',
          type: 'items',
          itemTitle: (v) => `${v.title} (${v.skills?.length ?? 0})`,
          newItem: () => ({ id: `cat-${Date.now().toString(36)}`, title: 'New category', subtitle: '', skills: [] }),
          item: [
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'subtitle', label: 'Subtitle', type: 'text', half: true },
            {
              key: 'skills',
              label: 'Skills',
              type: 'items',
              itemTitle: (s) => s.name,
              newItem: () => ({ name: 'New skill', mono: 'Ns' }),
              item: [
                { key: 'name', label: 'Name', type: 'text', half: true },
                { key: 'mono', label: 'Two-letter icon', type: 'text', half: true },
                { key: 'note', label: 'Badge (optional)', type: 'text', half: true, help: 'e.g. Primary' },
              ],
            },
          ],
        },
        { key: 'skillEvidence', label: 'Where each skill shows up', type: 'evidence', help: 'Skill name must match exactly. Shown on hover.' },
      ],
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      group: 'Content',
      description: 'Award cards in “Top Moments”, plus certifications (the certifications row only appears when you add one).',
      root: '',
      fields: [
        {
          key: 'achievements',
          label: 'Achievements',
          type: 'items',
          itemTitle: (v) => v.title,
          newItem: () => ({ id: `ach-${Date.now().toString(36)}`, title: 'New achievement', org: '', detail: '', laurel: 'Award' }),
          item: [
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'org', label: 'Organisation', type: 'text', half: true },
            { key: 'laurel', label: 'Laurel label', type: 'text', half: true, help: 'Small gold text at the top of the card.' },
            { key: 'link', label: 'Certificate link (optional)', type: 'url', half: true },
            { key: 'detail', label: 'Detail', type: 'textarea', rows: 2 },
          ],
        },
        {
          key: 'certifications',
          label: 'Certifications',
          type: 'items',
          itemTitle: (v) => `${v.issuer} — ${v.name}`,
          newItem: () => ({ issuer: 'Issuer', name: 'Certificate name', link: '' }),
          item: [
            { key: 'issuer', label: 'Issuer', type: 'text', half: true },
            { key: 'name', label: 'Name', type: 'text', half: true },
            { key: 'link', label: 'Link', type: 'url' },
          ],
        },
      ],
    },
    {
      id: 'journey',
      label: 'Journey',
      icon: '🗺️',
      group: 'Content',
      description: 'Your story told as seasons and episodes.',
      root: '',
      fields: [
        {
          key: 'seasons',
          label: 'Seasons',
          type: 'items',
          itemTitle: (v, i) => `Season ${i + 1}: ${v.title}`,
          newItem: () => ({ number: 0, title: 'New season', period: '', synopsis: '', episodes: [] }),
          item: [
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'period', label: 'Period', type: 'text', half: true },
            { key: 'synopsis', label: 'Synopsis', type: 'textarea', rows: 2 },
            {
              key: 'episodes',
              label: 'Episodes',
              type: 'items',
              itemTitle: (e) => `${e.code} · ${e.title}`,
              newItem: () => ({ code: 'S0X E0X', title: 'New episode', description: '', tags: [], runtime: '', palette: crimson }),
              item: [
                { key: 'title', label: 'Title', type: 'text', half: true },
                { key: 'code', label: 'Code', type: 'text', half: true, help: 'e.g. S01 E02' },
                { key: 'runtime', label: 'Runtime line', type: 'text', half: true, help: 'Dates or a short label.' },
                {
                  key: 'motif',
                  label: 'Background art',
                  type: 'select',
                  half: true,
                  options: [{ value: '', label: 'None (plain)' }, ...MOTIFS.map((m) => ({ value: m.id, label: m.label }))],
                },
                { key: 'description', label: 'Description', type: 'textarea', rows: 2, help: 'Shown on the card.' },
                {
                  key: 'experience',
                  label: 'Linked experience',
                  type: 'select',
                  half: true,
                  help: 'Opening the episode shows this role’s full details from the Experience page.',
                  options: [{ value: '', label: 'None' }, ...c.experience.map((x) => ({ value: x.company, label: `${x.role} — ${x.company}` }))],
                },
                {
                  key: 'project',
                  label: 'Linked project',
                  type: 'select',
                  half: true,
                  help: 'Adds a button that opens this project.',
                  options: [{ value: '', label: 'None' }, ...c.projects.map((p) => ({ value: p.id, label: p.title }))],
                },
                { key: 'details', label: 'Extra details', type: 'list', multiline: true, help: 'More bullet points, shown when the episode is opened.' },
                { key: 'tags', label: 'Tags', type: 'list' },
                paletteField,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'picks',
      label: 'Top picks',
      icon: '🔟',
      group: 'Content',
      description: 'The numbered “Top 10” row.',
      root: '',
      fields: [
        {
          key: 'topPicks',
          label: 'Picks',
          type: 'items',
          itemTitle: (v, i) => `${i + 1}. ${v.title}`,
          newItem: () => ({ label: 'Label', title: 'Title', detail: '', palette: crimson }),
          item: [
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'label', label: 'Small label', type: 'text', half: true },
            { key: 'detail', label: 'Detail', type: 'text' },
            paletteField,
          ],
        },
      ],
    },
    {
      id: 'intro',
      label: 'Play Intro',
      icon: '▶️',
      group: 'Content',
      description: 'Slides of the full-screen highlight reel behind the “Play Intro” button.',
      root: '',
      fields: [
        {
          key: 'introSlides',
          label: 'Slides',
          type: 'items',
          itemTitle: (v, i) => `${i + 1}. ${v.kicker} — ${v.title}`,
          newItem: () => ({ kicker: 'Kicker', title: 'Title', lines: [] }),
          item: [
            { key: 'kicker', label: 'Kicker', type: 'text', half: true },
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'lines', label: 'Lines', type: 'list' },
            { key: 'chips', label: 'Chips (optional)', type: 'list' },
          ],
        },
      ],
    },
    {
      id: 'copy',
      label: 'Section text',
      icon: '✏️',
      group: 'Site',
      description: 'Headings and small text around the site, and the names used in the menu.',
      root: '',
      fields: [
        {
          key: 'sections',
          label: 'Menu and card names',
          type: 'group',
          help: '“Menu” is the top navigation; “Card” is the tile in the Continue Exploring row.',
          fields: (['about', 'journey', 'originals', 'picks', 'skills', 'moments', 'story'] as SectionId[]).flatMap((id): Field[] => [
            { key: `${id}.nav`, label: `${c.sections[id]?.card ?? id}: menu`, type: 'text', half: true },
            { key: `${id}.card`, label: `${c.sections[id]?.card ?? id}: card`, type: 'text', half: true },
          ]),
        },
        {
          key: 'copy',
          label: 'Headings',
          type: 'group',
          fields: [
            { key: 'continueTitle', label: 'Continue row title', type: 'text', half: true },
            { key: 'aboutKicker', label: 'About: kicker', type: 'text', half: true },
            { key: 'aboutTitle', label: 'About: title', type: 'text', half: true },
            { key: 'journeyTitle', label: 'Journey: title', type: 'text', half: true },
            { key: 'journeyHint', label: 'Journey: hint', type: 'text' },
            { key: 'originalsKicker', label: 'Projects: kicker', type: 'text', half: true, help: 'Shown after the project count.' },
            { key: 'originalsTitle', label: 'Projects: title', type: 'text', half: true },
            { key: 'originalsBlurb', label: 'Projects: intro', type: 'textarea', rows: 2 },
            { key: 'picksKicker', label: 'Top picks: kicker', type: 'text', half: true },
            { key: 'picksTitle', label: 'Top picks: title', type: 'text', half: true },
            { key: 'skillsKicker', label: 'Skills: kicker', type: 'text', half: true },
            { key: 'skillsTitle', label: 'Skills: title', type: 'text', half: true },
            { key: 'skillsHint', label: 'Skills: hint', type: 'text' },
            { key: 'momentsKicker', label: 'Achievements: kicker', type: 'text', half: true },
            { key: 'momentsTitle', label: 'Achievements: title', type: 'text', half: true },
            { key: 'storyKicker', label: 'Resume: kicker', type: 'text', half: true },
            { key: 'storyTitle', label: 'Resume: title', type: 'text', half: true },
            { key: 'storyTagline', label: 'Resume: tagline', type: 'text' },
            { key: 'finalKicker', label: 'Ending: kicker', type: 'text', half: true },
            { key: 'finalTitle', label: 'Ending: big title', type: 'text', half: true },
            { key: 'ctaLabel', label: 'Main button', type: 'text', half: true, help: 'The red email button at the end and in the menu.' },
            { key: 'footer', label: 'Footer note', type: 'text' },
          ],
        },
      ],
    },
    {
      id: 'design',
      label: 'Design',
      icon: '🎨',
      group: 'Site',
      description: 'Colours, fonts and effects. Pick a preset or fine-tune each colour.',
      root: '',
      fields: [
        {
          key: 'theme',
          label: 'Colours',
          type: 'group',
          fields: [
            { key: 'accent', label: 'Accent', type: 'color', half: true, help: 'Buttons, glows, highlights.' },
            { key: 'accentBright', label: 'Accent (bright)', type: 'color', half: true, help: 'Kickers, links, hover states.' },
            { key: 'background', label: 'Background', type: 'color', half: true },
            { key: 'surface', label: 'Cards', type: 'color', half: true },
            { key: 'surface2', label: 'Cards (raised)', type: 'color', half: true },
            { key: 'text', label: 'Text', type: 'color', half: true },
            { key: 'muted', label: 'Secondary text', type: 'color', half: true },
            { key: 'faint', label: 'Faint text', type: 'color', half: true },
          ],
        },
        {
          key: 'theme',
          label: 'Fonts',
          type: 'group',
          fields: [
            { key: 'fontDisplay', label: 'Display (big titles)', type: 'select', half: true, options: FONT_CHOICES.display.map((f) => ({ value: f, label: f })) },
            { key: 'fontSerif', label: 'Serif (quotes)', type: 'select', half: true, options: FONT_CHOICES.serif.map((f) => ({ value: f, label: f })) },
            { key: 'fontSans', label: 'Body text', type: 'select', half: true, options: FONT_CHOICES.sans.map((f) => ({ value: f, label: f })) },
          ],
        },
        {
          key: 'settings',
          label: 'Effects and flow',
          type: 'group',
          fields: [
            { key: 'showOpening', label: 'Opening animation', type: 'toggle', help: 'The cinematic title sequence on first visit.' },
            { key: 'showProfileSelector', label: '“Who’s watching?” screen', type: 'toggle', help: 'Lets visitors pick Recruiter, Developer, etc.' },
            { key: 'customCursor', label: 'Custom cursor', type: 'toggle', help: 'The dot cursor that labels links (desktop).' },
            { key: 'filmGrain', label: 'Film grain', type: 'toggle', help: 'Subtle moving noise over the whole page.' },
          ],
        },
      ],
    },
    {
      id: 'sections',
      label: 'Sections & viewers',
      icon: '🧩',
      group: 'Site',
      description: 'Hide sections, and set the order each “Who’s watching?” profile sees them in.',
      root: '',
      fields: [
        { key: 'settings.hiddenSections', label: 'Hidden sections', type: 'sectionSet', names: sectionName(c), help: 'Ticked sections are removed from the site and the menu.' },
        {
          key: 'viewerProfiles',
          label: 'Viewer profiles',
          type: 'items',
          fixed: true,
          help: 'The first profile is you (it shows your photo).',
          itemTitle: (v) => v.name,
          newItem: () => ({}),
          item: [
            { key: 'name', label: 'Name', type: 'text', half: true },
            { key: 'color', label: 'Tile colour', type: 'color', half: true },
            { key: 'blurb', label: 'Short description', type: 'text' },
            { key: 'order', label: 'Section order', type: 'sectionOrder', names: sectionName(c) },
          ],
        },
      ],
    },
    { id: 'media', label: 'Photo & resume', icon: '🖼️', group: 'Files', description: 'Replace your portrait photo or the resume PDF.', custom: 'media' },
    { id: 'publish', label: 'Publish', icon: '🚀', group: 'Files', description: 'Send your saved changes to GitHub, or roll back to an earlier save.', custom: 'publish' },
  ];
}

export const THEME_PRESETS: { name: string; theme: Partial<Content['theme']> }[] = [
  { name: 'Crimson', theme: { accent: '#e5132b', accentBright: '#ff3d5a', background: '#07070a', surface: '#0e0e13', surface2: '#16161d', text: '#f4f1ec', muted: '#a7a6ad', faint: '#6d6c75' } },
  { name: 'Ocean', theme: { accent: '#1479e6', accentBright: '#4cc9ff', background: '#05080f', surface: '#0b111c', surface2: '#131b29', text: '#eef3fa', muted: '#9fadc2', faint: '#66738a' } },
  { name: 'Emerald', theme: { accent: '#0fa968', accentBright: '#46e3a8', background: '#050a08', surface: '#0b1310', surface2: '#121d18', text: '#eef6f2', muted: '#9fb5aa', faint: '#66796f' } },
  { name: 'Amber', theme: { accent: '#e08a00', accentBright: '#ffb547', background: '#0a0806', surface: '#14100b', surface2: '#1d1811', text: '#f7f1e8', muted: '#b5a993', faint: '#7a705f' } },
  { name: 'Violet', theme: { accent: '#7c3aed', accentBright: '#b98bff', background: '#07060c', surface: '#0f0d18', surface2: '#171425', text: '#f2effa', muted: '#aaa3c2', faint: '#6f6889' } },
];
