import { MessageCircle, Phone, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  centerOptions,
  telHref,
  WHATSAPP_MESSAGES,
  whatsappHref,
} from '@/config/center-options';

const SECTIONS = [
  { href: '#especialidades', label: 'Especialidades' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#obras-sociales', label: 'Obras sociales' },
  { href: '#contacto', label: 'Contacto' },
];

const LandingHeader = () => (
  <header className="border-b border-white/15 bg-accent-dark text-white">
    <div className="mx-auto flex max-w-[1296px] items-center gap-3 px-4 py-4 min-[721px]:gap-6 min-[721px]:px-6">
      <a
        className="flex items-center gap-3 text-white no-underline"
        href="#inicio"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center bg-accent-bright"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3.2] text-accent-dark" />
        </span>
        <span className="text-[15px] font-semibold leading-tight min-[721px]:text-[17px]">
          {centerOptions.name}
        </span>
      </a>

      <nav
        aria-label="Principal"
        className="ml-auto hidden items-center gap-7 min-[721px]:flex"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="text-[15px] text-accent-soft no-underline hover:text-white"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex gap-2">
        <a
          href={telHref()}
          className="hidden min-h-11 items-center gap-2 border border-white/40 px-4 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/10 min-[721px]:inline-flex"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Llamar
        </a>
        <a
          href={whatsappHref(WHATSAPP_MESSAGES.general)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-accent-bright px-3 text-sm font-bold text-sidebar no-underline transition-colors hover:bg-white min-[721px]:px-4"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
        <Link
          to="/login"
          className="inline-flex min-h-11 shrink-0 items-center px-2 text-sm text-accent-soft no-underline hover:text-white min-[721px]:px-3"
        >
          Ingresar
        </Link>
      </div>
    </div>
  </header>
);

export default LandingHeader;
