const BrandPanel = () => (
  <aside className="flex flex-col gap-10 bg-sidebar px-6 py-10 text-white lg:w-2/5 lg:justify-between lg:gap-0 lg:px-14 lg:py-16">
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-[34px] w-[34px] shrink-0 bg-accent"
      />
      <span className="text-[17px] font-bold">Centro Médico Belgrano</span>
    </div>

    <div>
      <h1 className="text-[32px] font-bold leading-[1.2] lg:text-[40px] lg:leading-[48px]">
        Gestión de turnos
        <br />
        del centro
      </h1>

      <p className="mt-3 max-w-[25rem] text-[15px] leading-[26px] text-sidebar-ink">
        Acceso para recepción, profesionales y administración. Cada operación
        queda registrada en la auditoría del sistema.
      </p>
    </div>

    <p className="text-[15px] text-sidebar-muted">
      ¿Sos paciente?{' '}
      <a
        href="/turnos"
        className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:text-white focus-visible:underline focus-visible:outline-none"
      >
        Sacá tu turno desde el sitio del centro.
      </a>
    </p>
  </aside>
);

export default BrandPanel;
