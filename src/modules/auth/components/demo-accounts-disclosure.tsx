import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
} from '@/modules/auth/data/demo-accounts';
import { getRoleLabel } from '@/shared/constants/roles';

const DemoAccountsDisclosure = () => (
  <details className="border border-dashed border-border-strong px-4 py-3 dark:border-sidebar-soft">
    <summary className="cursor-pointer text-[14px] text-ink-soft dark:text-sidebar-ink">
      Cuentas de prueba del prototipo
    </summary>

    <p className="mt-2 text-[13px] text-ink-muted">
      La contraseña de todas es{' '}
      <span className="font-mono text-ink dark:text-white">
        {DEMO_PASSWORD}
      </span>
      .
    </p>

    <ul className="mt-3 flex flex-col gap-2">
      {DEMO_ACCOUNTS.map(({ user }) => (
        <li
          key={user.email}
          className="flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]"
        >
          <span className="font-mono text-ink dark:text-white">
            {user.email}
          </span>
          <span className="text-ink-muted">{getRoleLabel(user.role)}</span>
        </li>
      ))}
    </ul>
  </details>
);

export default DemoAccountsDisclosure;
