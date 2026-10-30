import { type ReactNode, useEffect, useRef } from 'react';

type DialogProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Diálogo modal sobre el elemento nativo: trae por sí solo el foco atrapado,
 * el cierre con Escape y el fondo inerte.
 */
const Dialog = ({ isOpen, title, onClose, children, footer }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    // jsdom no implementa showModal: sin esta guarda el render explota y las
    // pruebas no verían el formulario.
    if (!dialog || typeof dialog.showModal !== 'function') return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={ref}
      open
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-50 m-auto w-[min(32rem,calc(100vw-2rem))] border border-border-strong bg-surface p-0 text-ink backdrop:bg-ink/50 dark:border-sidebar-line dark:bg-sidebar-soft dark:text-white"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="dialog-title" className="text-[1.2rem] font-semibold">
          {title}
        </h2>
        {children}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4 dark:border-sidebar-line">
        {footer}
      </div>
    </dialog>
  );
};

export default Dialog;
