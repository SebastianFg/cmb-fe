import { Outlet, useLocation } from 'react-router-dom';
import { findNavItem } from '@/router/nav-items';
import Footer from '@/shared/components/footer/footer';
import Sidebar from '@/shared/components/sidebar/sidebar';
import Topbar from '@/shared/components/topbar/topbar';

/**
 * Back-office: barra lateral oscura y barra superior. Hasta 1100px la lateral
 * se apila arriba; desde ahí son dos columnas con la lateral fija.
 */
const StaffShell = () => {
  const location = useLocation();
  const current = findNavItem(location.pathname);

  return (
    <div className="min-h-screen bg-ground min-[1100px]:grid min-[1100px]:grid-cols-[236px_minmax(0,1fr)]">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col">
        <Topbar title={current?.label ?? 'Centro Médico Belgrano'} />

        <main className="flex-1 px-4 py-6 min-[1100px]:px-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default StaffShell;
