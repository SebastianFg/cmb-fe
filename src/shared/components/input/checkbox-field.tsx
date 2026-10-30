import clsx from 'clsx';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form';

export type CheckboxFieldProps<T extends FieldValues> =
  UseControllerProps<T> & {
    label: ReactNode;
    fieldClassName?: string;
  } & Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'defaultValue' | 'type' | 'checked'
    >;

/** Casilla controlada por React Hook Form: el valor del campo es booleano. */
const CheckboxField = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  className,
  fieldClassName,
  id,
  label,
  ...props
}: CheckboxFieldProps<T>) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  return (
    <div className={clsx('flex flex-col gap-[7px]', fieldClassName)}>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-2.5 text-[0.95rem] text-ink-strong dark:text-sidebar-ink"
      >
        <input
          {...props}
          id={inputId}
          name={field.name}
          ref={field.ref}
          type="checkbox"
          checked={Boolean(field.value)}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(event.target.checked)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className={clsx(
            'mt-0.5 h-[18px] w-[18px] flex-none accent-accent',
            className,
          )}
        />
        <span>{label}</span>
      </label>

      {error?.message && (
        <p id={`${inputId}-error`} className="text-[0.85rem] text-danger">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default CheckboxField;
