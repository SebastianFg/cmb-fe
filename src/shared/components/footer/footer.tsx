import { envConfig } from '@/config/env-config';

const Footer = () => (
  <footer className="mt-auto border-t border-line bg-surface text-[0.82rem] text-ink-soft print:hidden">
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 px-4 py-5">
      <span>{envConfig.VITE_PUBLIC_PROJECT_SHORT_NAME}</span>
      <span>
        {envConfig.VITE_PUBLIC_ENVIRONMENT} · v
        {envConfig.VITE_PUBLIC_APP_VERSION}
      </span>
    </div>
  </footer>
);

export default Footer;
