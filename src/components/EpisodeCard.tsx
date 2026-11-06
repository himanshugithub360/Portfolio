import { motion } from 'framer-motion';
import { experience, type Episode } from '../data/portfolio';
import { EASE, Tilt } from './fx';
import { MotifArt, PosterBackdrop } from './Poster';

/** Big background art for an episode: its motif if it has one, plus the oversized episode number. */
export function EpisodeArt({ episode }: { episode: Episode }) {
  const ep = episode.code.split(' ')[1] ?? '';
  return (
    <PosterBackdrop palette={episode.palette}>
      {episode.motif && <MotifArt motif={episode.motif} accent={episode.palette.accent} uid={`e-${episode.code}-${episode.title}`} />}
      <span className="absolute -bottom-6 right-2 font-display text-[7.5rem] leading-none text-white/[0.09]">{ep}</span>
    </PosterBackdrop>
  );
}

export default function EpisodeCard({ episode, index, onOpen }: { episode: Episode; index: number; onOpen: () => void }) {
  const [season, ep = ''] = episode.code.split(' ');
  const job = episode.experience ? experience.find((x) => x.company === episode.experience) : undefined;
  const more = (job?.points.length ?? 0) + (episode.details?.length ?? 0);

  return (
    <motion.article
      className="w-[80vw] shrink-0 snap-start sm:w-[52vw] md:w-[38vw] lg:w-[30vw] xl:w-[26vw]"
      initial={{ opacity: 0, y: 30, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
    >
      <Tilt max={7} className="group h-full rounded-xl">
        <button
          type="button"
          onClick={onOpen}
          data-cursor="view"
          aria-label={`Open episode: ${episode.title}`}
          className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-ink-2 text-left ring-1 ring-white/10 transition duration-500 group-hover:ring-crimson-2/60"
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-cine)] group-hover:scale-110">
              <EpisodeArt episode={episode} />
            </div>
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] text-bone backdrop-blur">{season}</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-bone/80">EPISODE {ep.replace('E', '')}</span>
            </div>
            <h4 className="absolute bottom-4 left-4 right-4 font-display text-3xl leading-none tracking-wide text-bone [transform:translateZ(30px)] sm:text-4xl">{episode.title}</h4>
          </div>
          <div className="flex w-full flex-1 flex-col p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-smoke">
              <span className="font-semibold text-mist">{episode.runtime}</span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-bone transition group-hover:border-bone group-hover:bg-bone group-hover:text-ink">
                ▶ {more ? `Details · ${more}` : 'Details'}
              </span>
            </div>
            {job && (
              <p className="mb-1 text-xs font-semibold text-crimson-2">
                {job.role} · {job.company}
              </p>
            )}
            <p className="line-clamp-3 text-sm leading-relaxed text-bone/80">{episode.description}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {episode.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-mist">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </button>
      </Tilt>
    </motion.article>
  );
}
