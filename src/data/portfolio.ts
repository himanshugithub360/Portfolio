/**
 * Typed access to the portfolio content.
 *
 * All content lives in ./content.json. Edit it either:
 *   1. by hand, in content.json, or
 *   2. in the admin dashboard at /admin (run `npm run dev`), which writes the same file.
 * Every component reads from the exports below, so the whole site follows either way.
 */
import content from './content.json';
import type { Motif } from './motifs';

export type { Motif } from './motifs';

export type Palette = { from: string; via: string; to: string; accent: string };

export type Profile = {
  fullName: string;
  displayName: string;
  firstName: string;
  seriesTag: string;
  /** Fictional studio card shown at the very start of the opening sequence. */
  originalLabel: string;
  role: string;
  tagline: string[];
  degreeShort: string;
  primaryStack: string;
  primaryLanguage: { name: string; with: string };
  intro: string;
  location: string;
  email: string;
  links: { linkedin: string; github: string };
  resumePdf: string;
  resumeFileName: string;
  portrait: { src: string; srcSet: string; alt: string };
  interests: string[];
};

export type Education = { school: string; place: string; degree: string; period: string; score: string };
export type Experience = { company: string; role: string; place: string; period: string; points: string[] };

export type Metric = { value: string; label: string };

export type Project = {
  id: string;
  title: string;
  /** Leave empty and the year badge is hidden. */
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
  motif: Motif;
};

export type Achievement = { id: string; title: string; org: string; detail: string; laurel: string; link?: string };
export type Certification = { issuer: string; name: string; link: string };

export type Skill = { name: string; mono: string; note?: string };
export type SkillCategory = { id: string; title: string; subtitle: string; skills: Skill[] };

export type Episode = {
  code: string;
  title: string;
  description: string;
  tags: string[];
  runtime: string;
  palette: Palette;
  /** Background art; plain gradient when omitted. */
  motif?: Motif;
  /** Company of a linked Experience entry — its role, dates and bullets show when the episode is opened. */
  experience?: string;
  /** ID of a linked project — adds a button that opens it. */
  project?: string;
  /** Extra bullet points shown when the episode is opened. */
  details?: string[];
};
export type Season = { number: number; title: string; period: string; synopsis: string; episodes: Episode[] };

export type TopPick = { label: string; title: string; detail: string; palette: Palette };

/** Slides for the "▶ Play Intro" cinematic sequence. */
export type IntroSlide = { kicker: string; title: string; lines: string[]; chips?: string[] };

/** 'main' is the owner's own profile (shown with the portrait); the others reorder the sections. */
export type ProfileId = 'main' | 'recruiter' | 'developer' | 'creative';
export type SectionId = 'about' | 'journey' | 'originals' | 'picks' | 'skills' | 'moments' | 'story';
export const SECTION_IDS: SectionId[] = ['about', 'journey', 'originals', 'picks', 'skills', 'moments', 'story'];

export type ViewerProfile = { id: ProfileId; name: string; blurb: string; color: string; order: SectionId[] };

export type Theme = {
  accent: string;
  accentBright: string;
  background: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  faint: string;
  fontDisplay: string;
  fontSerif: string;
  fontSans: string;
};

export type Settings = {
  showOpening: boolean;
  showProfileSelector: boolean;
  customCursor: boolean;
  filmGrain: boolean;
  hiddenSections: SectionId[];
  photoCrop: 'auto' | { left: number; top: number; width: number; height: number };
};

export type Copy = Record<
  | 'continueTitle'
  | 'aboutKicker'
  | 'aboutTitle'
  | 'journeyTitle'
  | 'journeyHint'
  | 'originalsKicker'
  | 'originalsTitle'
  | 'originalsBlurb'
  | 'picksKicker'
  | 'picksTitle'
  | 'skillsKicker'
  | 'skillsTitle'
  | 'skillsHint'
  | 'momentsKicker'
  | 'momentsTitle'
  | 'storyKicker'
  | 'storyTitle'
  | 'storyTagline'
  | 'finalKicker'
  | 'finalTitle'
  | 'ctaLabel'
  | 'footer',
  string
>;

export type Content = {
  profile: Profile;
  hero: { badge: string; meta: string[]; chips: { text: string; sub: string }[] };
  about: { facts: { k: string; v: string; s: string }[] };
  copy: Copy;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  achievements: Achievement[];
  certifications: Certification[];
  skillCategories: SkillCategory[];
  skillEvidence: Record<string, string[]>;
  seasons: Season[];
  topPicks: TopPick[];
  introSlides: IntroSlide[];
  viewerProfiles: ViewerProfile[];
  sections: Record<SectionId, { nav: string; card: string; palette: Palette }>;
  theme: Theme;
  settings: Settings;
};

const data = content as unknown as Content;

export const profile = data.profile;
export const hero = data.hero;
export const about = data.about;
export const copy = data.copy;
export const education = data.education;
export const experience = data.experience;
export const projects = data.projects;
export const achievements = data.achievements;
export const certifications = data.certifications;
export const skillCategories = data.skillCategories;
export const skillEvidence = data.skillEvidence;
export const seasons = data.seasons;
export const topPicks = data.topPicks;
export const introSlides = data.introSlides;
export const viewerProfiles = data.viewerProfiles;
export const theme = data.theme;
export const settings = data.settings;

const counts: Record<SectionId, string> = {
  about: 'The Pilot • Education & experience',
  journey: `${seasons.length} Seasons • ${seasons.reduce((n, s) => n + s.episodes.length, 0)} Episodes`,
  originals: `${projects.length} Originals`,
  picks: `Top ${topPicks.length} from the resume`,
  skills: `${skillCategories.length} Categories`,
  moments: `${achievements.length} Moments${certifications.length ? ` • ${certifications.length} Certifications` : ''}`,
  story: 'Resume • View & download',
};

export const sectionMeta = Object.fromEntries(
  SECTION_IDS.map((id) => [id, { ...data.sections[id], meta: counts[id] }]),
) as Record<SectionId, { nav: string; card: string; meta: string; palette: Palette }>;

/** Section order for a viewer profile, minus any sections hidden in the admin. */
export function visibleOrder(id: ProfileId): SectionId[] {
  const p = viewerProfiles.find((v) => v.id === id) ?? viewerProfiles[0];
  return p.order.filter((s) => !settings.hiddenSections.includes(s));
}
