import { MessageCircle } from 'lucide-react';
import { WHATSAPP_MESSAGES, whatsappHref } from '@/config/center-options';
import LandingHeader from '@/modules/landing/components/landing-header';
import LandingHero from '@/modules/landing/components/landing-hero';
import {
  BenefitsSection,
  ContactSection,
  InsurersSection,
  LandingFooter,
  SpecialtiesSection,
  StepsSection,
  TeamSection,
} from '@/modules/landing/components/landing-sections';
import SpecialtiesTicker from '@/modules/landing/components/specialties-ticker';

/** Sitio público del centro. Es la única pantalla que no pide sesión. */
const LandingPage = () => (
  <div className="w-full bg-surface text-ink">
    <LandingHeader />

    <main>
      <LandingHero />
      <SpecialtiesTicker />
      <BenefitsSection />
      <SpecialtiesSection />
      <StepsSection />
      <TeamSection />
      <InsurersSection />
      <ContactSection />
    </main>

    <LandingFooter />

    <a
      className="fixed bottom-4 right-4 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_28px_rgba(11,58,53,0.35)] transition-colors hover:bg-accent-dark min-[721px]:bottom-6 min-[721px]:right-6"
      href={whatsappHref(WHATSAPP_MESSAGES.general)}
      aria-label="Escribinos por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  </div>
);

export default LandingPage;
