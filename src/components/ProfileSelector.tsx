import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile, viewers, type ProfileId } from '../data/portfolio';
import { EASE } from './fx';

type Size = 'sm' | 'lg';
const boxClass = (size: Size) => (size === 'lg' ? 'h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-xl' : 'h-8 w-8 rounded-md');

/** A tile with the owner's portrait. */
function PortraitAvatar({ size }: { size: Size }) {
  return (
    <span
      className={`relative block overflow-hidden ${boxClass(size)}`}
      style={{ background: 'radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--color-crimson) 50%, var(--color-ink)), color-mix(in srgb, var(--color-crimson) 12%, var(--color-ink)))' }}
    >
      <img src="/assets/portrait-420.webp" alt="" className="absolute inset-x-0 bottom-0 mx-auto h-[115%] w-auto max-w-none -translate-x-[3%] object-cover object-top" />
    </span>
  );
}

/** A coloured tile with a short text mark (R, AI, </>, …). */
export function GlyphAvatar({ color, glyph, size = 'lg' }: { color: string; glyph: string; size?: Size }) {
  const long = glyph.length > 2;
  return (
    <span className={`relative flex items-center justify-center overflow-hidden font-display text-bone ${boxClass(size)}`} style={{ background: `linear-gradient(145deg, ${color}, #0b0b10 120%)` }}>
      <span className={size === 'lg' ? (long ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl') : long ? 'text-[10px]' : 'text-sm'}>{glyph}</span>
    </span>
  );
}

/** Avatar for any view: the portrait for the main view, a glyph tile for a recruiter role. */
export function ProfileAvatar({ id, size = 'lg' }: { id: ProfileId; size?: Size }) {
  if (id === 'main') return <PortraitAvatar size={size} />;
  const role = viewers.roles.find((r) => r.id === id);
  return <GlyphAvatar color={role?.color ?? viewers.recruiter.color} glyph={role?.glyph || role?.name.slice(0, 2) || 'R'} size={size} />;
}

const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

function Tile({ onClick, avatar, name, blurb, badge }: { onClick: () => void; avatar: React.ReactNode; name: string; blurb: string; badge?: string }) {
  return (
    <motion.li variants={item}>
      <button type="button" onClick={onClick} data-cursor="play" className="group flex flex-col items-center gap-3 text-center">
        <span className="relative rounded-xl ring-2 ring-transparent transition duration-300 group-hover:scale-105 group-hover:ring-bone group-focus-visible:ring-bone">
          {avatar}
          {badge && <span className="absolute -right-2 -top-2 rounded-full bg-crimson px-2 py-0.5 text-[9px] font-bold tracking-[0.18em] text-white">{badge}</span>}
        </span>
        <span className="font-sans text-sm font-medium text-mist transition group-hover:text-bone sm:text-base">{name}</span>
        <span className="max-w-[10rem] text-[11px] leading-snug text-smoke">{blurb}</span>
      </button>
    </motion.li>
  );
}

/**
 * "Who's watching?" — step 1: the owner's own view or Recruiter.
 * Step 2 (Recruiter): pick the role being hired for; each role reorders the site around it.
 */
export default function ProfileSelector({ onPick }: { onPick: (id: ProfileId) => void }) {
  const [step, setStep] = useState<'who' | 'roles'>('who');
  const { main, recruiter, roles } = viewers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (step === 'roles') setStep('who');
      else onPick('main');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPick, step]);

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center overflow-y-auto bg-ink px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
      transition={{ duration: 0.7, ease: EASE }}
      role="dialog"
      aria-label={step === 'who' ? "Who's watching?" : recruiter.title}
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_srgb,var(--color-crimson)_14%,transparent),transparent_70%)]" />

      <AnimatePresence mode="wait">
        {step === 'who' ? (
          <motion.div key="who" className="relative flex flex-col items-center" exit={{ opacity: 0, x: -40, filter: 'blur(6px)' }} transition={{ duration: 0.35, ease: EASE }}>
            <motion.h2
              className="mb-10 text-center font-sans text-3xl font-medium tracking-tight text-bone sm:text-5xl"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              Who&apos;s watching?
            </motion.h2>
            <motion.ul className="flex gap-8 sm:gap-12" initial="hidden" animate="show" transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}>
              <Tile onClick={() => onPick('main')} avatar={<PortraitAvatar size="lg" />} name={main.name} blurb={main.blurb} badge="MAIN" />
              <Tile onClick={() => setStep('roles')} avatar={<GlyphAvatar color={recruiter.color} glyph="R" />} name={recruiter.name} blurb={recruiter.blurb} />
            </motion.ul>
            <p className="mt-12 max-w-md text-center text-xs leading-relaxed text-smoke">
              Every profile watches the same true story of {profile.displayName} — it only changes what plays first.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="roles"
            className="relative flex w-full flex-col items-center"
            initial={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <button type="button" onClick={() => setStep('who')} className="mb-8 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold tracking-wide text-mist transition hover:border-bone hover:text-bone">
              ← Back
            </button>
            <h2 className="text-center font-sans text-3xl font-medium tracking-tight text-bone sm:text-5xl">{recruiter.title}</h2>
            <p className="mt-3 max-w-md text-center text-sm text-mist">{recruiter.subtitle}</p>
            <motion.ul className="mt-10 grid grid-cols-2 gap-6 sm:flex sm:gap-10" initial="hidden" animate="show" transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}>
              {roles.map((r) => (
                <Tile key={r.id} onClick={() => onPick(r.id)} avatar={<ProfileAvatar id={r.id} />} name={r.name} blurb={r.blurb} />
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
