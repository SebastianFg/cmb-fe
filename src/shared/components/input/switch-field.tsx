import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form';

export type SwitchFieldProps<T extends FieldValues> = UseControllerProps<T> & {
  label: ReactNode;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'defaultValue' | 'type' | 'checked'
  >;

/** Interruptor controlado por React Hook Form. */
const SwitchField = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  id,
  label,
  ...props
}: SwitchFieldProps<T>) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const { field } = useController({ name, control, rules, defaultValue });

  return (
    <label
      htmlFor={inputId}
      className="group flex cursor-pointer items-center gap-3 text-[0.95rem] text-ink-strong dark:text-sidebar-ink"
    >
      <input
        {...props}
        id={inputId}
        name={field.name}
        ref={field.ref}
        type="checkbox"
        role="switch"
        checked={Boolean(field.value)}
        onBlur={field.onBlur}
        onChange={(event) => field.onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-8 w-14 flex-none bg-[#D6DEDD] transition-colors peer-checked:bg-accent peer-focus-visible:ring-3 peer-focus-visible:ring-accent/35 after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:bg-white after:transition-transform peer-checked:after:translate-x-6"
      />
      <span>{label}</span>
    </label>
  );
};

export default SwitchField;
