import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { getRoleLabel } from '@/shared/constants/roles';

/**
 * Pantalla puente hasta que estén las vistas de `doc/vistas`: confirma con
 * qué cuenta y rol quedó abierta la sesión.
 */
const SessionSummaryPage = () => {
  const user = useAuthStore((state) => state.user);

  const roleLabel = getRoleLabel(user?.role) ?? 'Sin rol asignado';

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">
          Hola, {user?.shortName ?? 'Usuario'}
        </h1>
        <p className="text-sm text-ink-soft dark:text-sidebar-ink">
          Sesión iniciada correctamente.
        </p>
      </header>

      <dl className="grid gap-4 border border-border bg-surface p-5 text-sm dark:border-sidebar-line dark:bg-sidebar sm:grid-cols-2">
        <div>
          <dt className="font-medium text-ink-muted">Rol</dt>
          <dd className="mt-1 text-ink dark:text-white">{roleLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-muted">Correo</dt>
          <dd className="mt-1 text-ink dark:text-white">
            {user?.email ?? '—'}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default SessionSummaryPage;
