import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { experience, projects, type Episode, type Project, type Season } from '../data/portfolio';
import { useScrollLock } from '../hooks/smoothScroll';
import { EpisodeArt } from './EpisodeCard';
import { EASE, Magnetic } from './fx';

const block = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
};

/**
 * Full view of one Journey episode: its description, the linked internship's full details
 * (from Experience), any extra notes, and a jump to the linked project.
 */
export default function EpisodeModal({
  season,
  index,
  onClose,
  onSwitch,
  onOpenProject,
}: {
  season: Season;
  index: number;
  onClose: () => void;
  onSwitch: (index: number) => void;
  onOpenProject?: (p: Project) => void;
}) {
  useScrollLock(true);
  const episode: Episode = season.episodes[index];
  const job = episode.experience ? experience.find((x) => x.company === episode.experience) : undefined;
  const project = episode.project ? projects.find((p) => p.id === episode.project) : undefined;
  const [code, ep = ''] = episode.code.split(' ');
  const closeBtn = useRef<HTMLButtonElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const prev = index > 0 ? index - 1 : null;
  const next = index < season.episodes.length - 1 ? index + 1 : null;

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    return () => prevFocus?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && next !== null) onSwitch(next);
      if (e.key === 'ArrowLeft' && prev !== null) onSwitch(prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onSwitch, next, prev]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [index]);

  const accent = episode.palette.accent;

  return (
    <motion.div className="fixed inset-0 z-[140]" role="dialog" aria-modal="true" aria-labelledby="episode-title">
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div ref={scroller} data-lenis-prevent className="absolute inset-0 overflow-y-auto overscroll-contain" onClick={onClose}>
        <motion.div
          className="relative mx-auto min-h-full max-w-3xl bg-ink-2 shadow-2xl sm:my-10 sm:min-h-0 sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, transition: { duration: 0.25 } }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* billboard */}
          <div className="relative aspect-[16/7] min-h-[220px] overflow-hidden sm:rounded-t-2xl">
            <EpisodeArt key={episode.code + episode.title} episode={episode} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/20 to-transparent" />
            <button
              ref={closeBtn}
              type="button"
              onClick={onClose}
              data-cursor="close"
              aria-label="Close episode"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg text-bone backdrop-blur transition hover:bg-black"
            >
              ✕
            </button>
            <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-8">
              <p className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.28em] text-bone/80">
                <span className="rounded bg-black/50 px-2 py-0.5 backdrop-blur">{code}</span>
                EPISODE {ep.replace('E', '')} · {season.title.toUpperCase()}
              </p>
              <h2 id="episode-title" className="font-display text-[clamp(2.4rem,7vw,4.2rem)] leading-[0.88] tracking-wide text-bone">
                {episode.title}
              </h2>
            </div>
          </div>

          <motion.div key={index} className="px-5 pb-10 pt-2 sm:px-8" initial="hidden" animate="show" transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}>
            <motion.p variants={block} className="text-sm font-semibold" style={{ color: accent }}>
              {episode.runtime}
            </motion.p>
            <motion.p variants={block} className="mt-3 text-lg leading-relaxed text-bone sm:text-xl">
              {episode.description}
            </motion.p>

            {job && (
              <motion.section variants={block} className="mt-8 rounded-xl bg-ink p-5 ring-1 ring-white/10 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-crimson-2">The role</p>
                <h3 className="mt-2 text-xl font-semibold text-bone">{job.role}</h3>
                <p className="mt-1 text-sm text-mist">
                  {job.company} · {job.place} · {job.period}
                </p>
                {job.points.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {job.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-[15px] leading-relaxed text-bone/85">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>
            )}

            {!!episode.details?.length && (
              <motion.section variants={block} className="mt-8">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-crimson-2">{job ? 'Highlights' : 'Episode notes'}</h3>
                <ul className="space-y-3">
                  {episode.details.map((d) => (
                    <li key={d} className="flex gap-3 text-[15px] leading-relaxed text-bone/85">
                      <span className="text-crimson-2">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {episode.tags.length > 0 && (
              <motion.div variants={block} className="mt-8 flex flex-wrap gap-2">
                {episode.tags.map((t) => (
                  <span key={t} className="glass rounded-full px-3 py-1.5 text-sm font-medium text-bone">
                    {t}
                  </span>
                ))}
              </motion.div>
            )}

            {project && (
              <motion.div variants={block} className="mt-8 flex flex-wrap gap-3">
                {onOpenProject && (
                  <Magnetic>
                    <button
                      type="button"
                      data-cursor="play"
                      onClick={() => {
                        onClose();
                        onOpenProject(project);
                      }}
                      className="flex min-h-12 items-center gap-2 rounded-md bg-bone px-6 text-[15px] font-bold text-ink transition hover:bg-white"
                    >
                      ▶ Watch the Original: {project.title}
                    </button>
                  </Magnetic>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noreferrer" data-cursor="link" className="glass flex min-h-12 items-center rounded-md px-5 text-sm font-semibold text-bone transition hover:bg-white/15">
                    Live Demo ↗
                  </a>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noreferrer" data-cursor="link" className="glass flex min-h-12 items-center rounded-md px-5 text-sm font-semibold text-bone transition hover:bg-white/15">
                    GitHub ↗
                  </a>
                )}
              </motion.div>
            )}

            {/* episode navigation */}
            {(prev !== null || next !== null) && (
              <motion.nav variants={block} aria-label="Episodes" className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
                <div>
                  {prev !== null && (
                    <button type="button" onClick={() => onSwitch(prev)} className="group w-full rounded-lg p-3 text-left transition hover:bg-white/5">
                      <span className="block text-[10px] font-bold tracking-[0.24em] text-smoke">← PREVIOUS</span>
                      <span className="mt-1 block truncate font-display text-2xl tracking-wide text-bone">{season.episodes[prev].title}</span>
                    </button>
                  )}
                </div>
                <div>
                  {next !== null && (
                    <button type="button" onClick={() => onSwitch(next)} className="group w-full rounded-lg p-3 text-right transition hover:bg-white/5">
                      <span className="block text-[10px] font-bold tracking-[0.24em] text-smoke">NEXT EPISODE →</span>
                      <span className="mt-1 block truncate font-display text-2xl tracking-wide text-bone">{season.episodes[next].title}</span>
                    </button>
                  )}
                </div>
              </motion.nav>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
