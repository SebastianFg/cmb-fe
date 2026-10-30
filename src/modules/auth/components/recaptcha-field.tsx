import { useId } from 'react';
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form';

export type RecaptchaFieldProps<T extends FieldValues> = UseControllerProps<T>;

/**
 * Marcador visual del widget de reCAPTCHA. Reproduce la caja del diseño para
 * que el formulario quede completo en el prototipo; se reemplaza por el widget
 * real de Google cuando haya site key.
 */
const RecaptchaField = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
}: RecaptchaFieldProps<T>) => {
  const inputId = useId();

  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  return (
    <div className="flex flex-col">
      <div className="flex h-[78px] items-center justify-between border border-border bg-surface-alt px-4 dark:border-sidebar-line dark:bg-sidebar-soft">
        <div className="flex items-center gap-3">
          <input
            id={inputId}
            name={field.name}
            ref={field.ref}
            type="checkbox"
            checked={Boolean(field.value)}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.checked)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            aria-invalid={error ? true : undefined}
            className="h-[18px] w-[18px] shrink-0 accent-accent"
          />
          <label
            htmlFor={inputId}
            className="cursor-pointer text-[15px] text-ink dark:text-white"
          >
            No soy un robot
          </label>
        </div>

        <div
          aria-hidden="true"
          className="flex select-none flex-col items-center gap-1"
        >
          <span className="h-[22px] w-[22px] bg-border-strong" />
          <span className="font-mono text-[9px] tracking-wide text-ink-muted">
            reCAPTCHA
          </span>
        </div>
      </div>

      {error?.message && (
        <p id={`${inputId}-error`} className="mt-1.5 text-[13px] text-danger">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default RecaptchaField;
