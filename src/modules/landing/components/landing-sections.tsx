import {
  centerOptions,
  mailHref,
  WHATSAPP_MESSAGES,
  whatsappHref,
} from '@/config/center-options';
import {
  benefits,
  bookingSteps,
  insurers,
  specialties,
  team,
} from '@/modules/landing/data/landing-content';
import { CallButton, WhatsappButton } from './landing-buttons';

const Eyebrow = ({
  children,
  light = false,
}: {
  children: string;
  light?: boolean;
}) => (
  <p
    className={`text-[13px] font-bold uppercase tracking-[0.12em] ${light ? 'text-accent-bright' : 'text-accent'}`}
  >
    {children}
  </p>
);

export const BenefitsSection = () => (
  <section
    aria-labelledby="ben-title"
    className="mx-auto flex max-w-[1296px] flex-col gap-12 px-4 pb-20 pt-24 min-[721px]:px-6"
  >
    <h2
      id="ben-title"
      className="max-w-[820px] font-condensed text-[38px] font-bold leading-[1.02] tracking-[-0.015em] text-accent-dark min-[721px]:text-[56px]"
    >
      Medicina de barrio,
      <br />
      con la atención que te merecés.
    </h2>

    <div className="grid gap-8 min-[721px]:grid-cols-2 min-[1001px]:grid-cols-4">
      {benefits.map((benefit) => (
        <div
          key={benefit.title}
          className="flex flex-col gap-3 border-t-[3px] border-accent pt-5"
        >
          <span className="text-xl font-semibold">{benefit.title}</span>
          <span className="text-base leading-[1.6] text-ink-soft">
            {benefit.text}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export const SpecialtiesSection = () => (
  <section
    id="especialidades"
    aria-labelledby="esp-title"
    className="bg-ground"
  >
    <div className="mx-auto flex max-w-[1296px] flex-col gap-10 px-4 py-22 min-[721px]:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Eyebrow>Especialidades</Eyebrow>
          <h2
            id="esp-title"
            className="font-condensed text-[34px] font-bold leading-[1.05] tracking-[-0.01em] min-[721px]:text-5xl"
          >
            ¿Qué necesitás hoy?
          </h2>
        </div>
        <p className="max-w-[380px] text-base text-ink-soft">
          Tocá la especialidad y nos llega tu consulta por WhatsApp, lista para
          darte turno.
        </p>
      </div>

      <div className="grid gap-4 min-[721px]:grid-cols-2 min-[1001px]:grid-cols-4">
        {specialties.map((specialty) => (
          <a
            key={specialty.name}
            href={specialty.whatsappHref}
            className="group flex min-h-42 flex-col justify-between gap-4 border border-border-strong bg-surface p-6 text-ink no-underline transition-colors hover:bg-accent-dark hover:text-white"
          >
            <span className="font-mono text-[13px] opacity-70">
              {specialty.num}
            </span>
            <span className="flex flex-col gap-2">
              <span className="font-condensed text-[28px] font-bold leading-[1.05]">
                {specialty.name}
              </span>
              <span className="text-[15px] font-semibold text-accent group-hover:text-accent-bright">
                Pedir turno →
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export const StepsSection = () => (
  <section
    aria-labelledby="como-title"
    className="mx-auto flex max-w-[1296px] flex-col gap-10 px-4 py-24 min-[721px]:px-6"
  >
    <h2
      id="como-title"
      className="font-condensed text-[34px] font-bold leading-[1.05] tracking-[-0.01em] min-[721px]:text-5xl"
    >
      Pedir turno es así de fácil
    </h2>

    <ol className="grid list-none gap-8 min-[721px]:grid-cols-3">
      {bookingSteps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-3.5">
          <span className="font-condensed text-7xl font-bold leading-none text-accent-bright [-webkit-text-stroke:1px_#0D6B68]">
            {index + 1}
          </span>
          <span className="text-[22px] font-semibold">{step.title}</span>
          <span className="text-base leading-[1.6] text-ink-soft">
            {index === 0
              ? `Por WhatsApp o al ${centerOptions.phone}. ${step.text}`
              : step.text}
          </span>
        </li>
      ))}
    </ol>
  </section>
);

export const TeamSection = () => (
  <section
    id="equipo"
    aria-labelledby="eq-title"
    className="bg-accent-dark text-white"
  >
    <div className="mx-auto flex max-w-[1296px] flex-col gap-10 px-4 py-22 min-[721px]:px-6">
      <div className="flex flex-col gap-3">
        <Eyebrow light>Nuestro equipo</Eyebrow>
        <h2
          id="eq-title"
          className="font-condensed text-[34px] font-bold leading-[1.05] tracking-[-0.01em] min-[721px]:text-5xl"
        >
          Profesionales que te escuchan
        </h2>
      </div>

      <ul className="grid list-none gap-px border border-white/15 bg-white/15 min-[721px]:grid-cols-2 min-[1001px]:grid-cols-3">
        {team.map((member) => (
          <li
            key={member.name}
            className="flex items-center gap-4 bg-accent-dark p-6"
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 flex-none items-center justify-center bg-accent-bright text-lg font-bold text-sidebar"
            >
              {member.initials}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-lg font-semibold">{member.name}</span>
              <span className="text-[15px] text-accent-soft">
                {member.specialty}
              </span>
              <span className="font-mono text-[13px] text-sidebar-ink">
                {member.license}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export const InsurersSection = () => (
  <section
    id="obras-sociales"
    aria-labelledby="os-title"
    className="mx-auto flex max-w-[1296px] flex-col items-center gap-8 px-4 py-22 text-center min-[721px]:px-6"
  >
    <Eyebrow>Obras sociales y prepagas</Eyebrow>
    <h2
      id="os-title"
      className="font-condensed text-[34px] font-bold leading-[1.05] tracking-[-0.01em] min-[721px]:text-5xl"
    >
      Atendemos con tu cobertura
    </h2>

    <ul className="flex list-none flex-wrap justify-center gap-3">
      {insurers.map((insurer) => (
        <li
          key={insurer}
          className="border-2 border-ink px-7 py-4.5 text-[22px] font-bold"
        >
          {insurer}
        </li>
      ))}
    </ul>

    <p className="text-base text-ink-soft">
      ¿No ves la tuya?{' '}
      <a
        className="font-semibold text-accent hover:text-accent-dark"
        href={whatsappHref(WHATSAPP_MESSAGES.coverage)}
      >
        Preguntanos por WhatsApp
      </a>
      .
    </p>
  </section>
);

export const ContactSection = () => (
  <section
    id="contacto"
    aria-labelledby="ct-title"
    className="bg-accent-bright text-sidebar"
  >
    <div className="mx-auto grid max-w-[1296px] items-center gap-14 px-4 py-24 min-[721px]:px-6 min-[1001px]:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-6">
        <h2
          id="ct-title"
          className="font-condensed text-[38px] font-bold leading-[1.02] tracking-[-0.015em] min-[721px]:text-[56px]"
        >
          Pedí tu turno ahora.
        </h2>

        <a
          href={`tel:${centerOptions.phoneE164}`}
          className="whitespace-nowrap font-condensed text-[clamp(2rem,5.2vw,5.5rem)] font-bold leading-none tracking-[-0.02em] text-sidebar no-underline"
        >
          {centerOptions.phone}
        </a>

        <div className="flex flex-wrap gap-3">
          <WhatsappButton
            href={whatsappHref(WHATSAPP_MESSAGES.general)}
            className="bg-sidebar text-white hover:bg-accent-dark"
          >
            Escribinos por WhatsApp
          </WhatsappButton>
          <CallButton className="border-2 border-sidebar text-sidebar hover:bg-sidebar/10">
            Llamar ahora
          </CallButton>
        </div>
      </div>

      <div className="flex flex-col gap-5 bg-white p-8 text-ink">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Dónde estamos
          </span>
          <span className="text-xl font-semibold">{centerOptions.address}</span>
          <span className="text-base text-ink-soft">{centerOptions.city}</span>
        </div>

        <div className="flex h-45 items-center justify-center border border-dashed border-ink-muted bg-surface-muted text-sm text-ink-soft">
          [Mapa de Google]
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
              Horarios
            </span>
            {centerOptions.openingHours.map((line) => (
              <span key={line} className="text-base leading-[1.5]">
                {line}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
              Correo
            </span>
            <a
              className="text-base text-accent hover:underline"
              href={mailHref()}
            >
              {centerOptions.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const LandingFooter = () => (
  <footer className="bg-sidebar text-sidebar-ink">
    <div className="mx-auto flex max-w-[1296px] flex-wrap justify-between gap-3 px-4 py-8 text-sm min-[721px]:px-6">
      <span>
        © {new Date().getFullYear()} {centerOptions.name} · Dir. médico:{' '}
        {centerOptions.medicalDirector}
      </span>
      <span>
        Ante una emergencia, llamá al {centerOptions.emergencyPhone} (
        {centerOptions.emergencyLabel}).
      </span>
    </div>
  </footer>
);
