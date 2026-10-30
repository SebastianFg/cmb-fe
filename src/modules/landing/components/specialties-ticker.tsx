import { SPECIALTY_NAMES } from '@/modules/landing/data/landing-content';

const Group = () => (
  <div className="flex flex-none items-center gap-7 pr-7">
    {SPECIALTY_NAMES.map((name) => (
      <span key={name} className="contents">
        <span>{name}</span>
        <span>+</span>
      </span>
    ))}
  </div>
);

/** Marquesina de especialidades. Se frena al pasar el mouse. */
const SpecialtiesTicker = () => (
  <div
    aria-hidden="true"
    className="group flex h-[66px] items-center overflow-hidden whitespace-nowrap bg-accent-bright text-sidebar"
  >
    <div className="flex w-max animate-ticker font-condensed text-[26px] font-bold uppercase leading-none tracking-[0.02em] group-hover:[animation-play-state:paused] motion-reduce:[animation-duration:120s]">
      <Group />
      <Group />
    </div>
  </div>
);

export default SpecialtiesTicker;
