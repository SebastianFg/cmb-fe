import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form';
import Field, { fieldControlClasses } from './field';

export type TextFieldProps<T extends FieldValues> = UseControllerProps<T> & {
  label: ReactNode;
  hint?: ReactNode;
  trailing?: ReactNode;
  requiredMark?: boolean;
  fieldClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'defaultValue'>;

/** Campo de texto controlado por React Hook Form. */
const TextField = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  className,
  fieldClassName,
  hint,
  id,
  label,
  requiredMark = false,
  trailing,
  ...props
}: TextFieldProps<T>) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error?.message}
      required={requiredMark}
      trailing={trailing}
      className={fieldClassName}
    >
      <input
        {...field}
        {...props}
        id={inputId}
        value={field.value ?? ''}
        aria-describedby={
          [hint && `${inputId}-hint`, error && `${inputId}-error`]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-invalid={error ? true : undefined}
        className={`${fieldControlClasses(Boolean(error), Boolean(trailing))} ${className ?? ''}`}
      />
    </Field>
  );
};

export default TextField;
