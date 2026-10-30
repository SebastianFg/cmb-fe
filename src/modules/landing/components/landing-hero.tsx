import {
  centerOptions,
  WHATSAPP_MESSAGES,
  whatsappHref,
} from '@/config/center-options';
import { heroStats } from '@/modules/landing/data/landing-content';
import { CallButton, WhatsappButton } from './landing-buttons';

const STAT_POSITIONS = [
  'left-[4%] top-[6%]',
  'right-0 top-[46%]',
  'bottom-[2%] left-[12%]',
];

const LandingHero = () => (
  <section id="inicio" className="overflow-hidden bg-accent-dark text-white">
    <div className="mx-auto grid max-w-[1296px] items-center gap-14 px-6 pb-26 pt-22 min-[1001px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-7">
        <p className="inline-flex self-start border border-accent-bright/50 px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-accent-bright">
          Belgrano · {centerOptions.address.split(',')[0]}
        </p>

        <h1 className="font-condensed text-[46px] font-bold leading-[0.98] tracking-[-0.02em] min-[721px]:text-[84px]">
          Tu salud,
          <br />a <span className="text-accent-bright">un mensaje</span>
          <br />
          de distancia.
        </h1>

        <p className="max-w-[560px] text-xl leading-[1.55] text-accent-soft">
          Ocho especialidades y un equipo que te conoce por tu nombre.
          Escribinos por WhatsApp o llamanos y te damos turno con quien
          necesites.
        </p>

        <div className="flex flex-wrap gap-3">
          <WhatsappButton
            href={whatsappHref(WHATSAPP_MESSAGES.general)}
            className="bg-white text-sidebar hover:bg-accent-soft"
          >
            Escribinos por WhatsApp
          </WhatsappButton>
          <CallButton className="border-2 border-white text-white hover:bg-white/10" />
        </div>

        <p className="text-[15px] text-sidebar-ink">
          {centerOptions.openingHoursShort}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="relative hidden h-[520px] min-[1001px]:block"
      >
        <div className="absolute left-1/3 top-0 h-full w-[34%] bg-accent" />
        <div className="absolute left-0 top-1/3 h-[34%] w-full bg-accent" />
        <div className="absolute left-1/3 top-1/3 h-[34%] w-[34%] bg-accent-bright" />

        {heroStats.map((stat, index) => (
          <div
            key={stat.label}
            className={`absolute flex flex-col gap-0.5 bg-white px-6 py-5 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.25)] ${STAT_POSITIONS[index]}`}
          >
            <span className="font-condensed text-5xl font-bold leading-none text-accent-dark">
              {stat.value}
            </span>
            <span className="text-[15px] font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingHero;
