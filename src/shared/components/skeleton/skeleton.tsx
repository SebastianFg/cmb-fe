import clsx from 'clsx';
import type { ReactNode } from 'react';

/**
 * Bloque que ocupa el lugar del contenido mientras llega. Va oculto para los
 * lectores de pantalla: el aviso lo da `SkeletonScreen` una sola vez, en lugar
 * de leer una lista de recuadros vacíos.
 */
const Skeleton = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={clsx(
      'block animate-pulse bg-surface-muted dark:bg-sidebar-line',
      className,
    )}
  />
);

export default Skeleton;

type SkeletonScreenProps = {
  /** Lo que se anuncia mientras carga: «Cargando la agenda del día…». */
  label: string;
  className?: string;
  children: ReactNode;
};

/** Contenedor de un esqueleto de pantalla: un único aviso para todo el bloque. */
export const SkeletonScreen = ({
  label,
  className,
  children,
}: SkeletonScreenProps) => (
  <div aria-busy="true" role="status" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);
