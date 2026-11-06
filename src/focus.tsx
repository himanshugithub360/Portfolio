import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  getViewer,
  isRole,
  prioritise,
  profile,
  projects,
  seasons,
  skillCategories,
  topPicks,
  type Project,
  type ProfileId,
  type SkillCategory,
  type TopPick,
  type ViewerProfile,
} from './data/portfolio';

/** What the current view (main, or a recruiter role) puts first. Sections read this instead of the raw lists. */
export type Focus = {
  id: ProfileId;
  viewer: ViewerProfile;
  isRole: boolean;
  intro: string;
  projects: Project[];
  skillCategories: SkillCategory[];
  topPicks: TopPick[];
  /** Index into `seasons` that the Journey opens on. */
  seasonIndex: number;
};

function buildFocus(id: ProfileId): Focus {
  const viewer = getViewer(id);
  const wanted = Number(viewer.season);
  const found = seasons.findIndex((s) => s.number === wanted);
  return {
    id: viewer.id,
    viewer,
    isRole: isRole(viewer.id),
    intro: viewer.intro?.trim() || profile.intro,
    projects: prioritise(projects, (p) => p.id, viewer.projects),
    skillCategories: prioritise(skillCategories, (s) => s.id, viewer.skills),
    topPicks: prioritise(topPicks, (t) => t.title, viewer.picks),
    seasonIndex: found >= 0 ? found : Math.max(0, seasons.length - 2),
  };
}

const FocusContext = createContext<Focus>(buildFocus('main'));

export function FocusProvider({ id, children }: { id: ProfileId; children: ReactNode }) {
  const focus = useMemo(() => buildFocus(id), [id]);
  return <FocusContext.Provider value={focus}>{children}</FocusContext.Provider>;
}

export const useFocus = () => useContext(FocusContext);
