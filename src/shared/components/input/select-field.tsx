import { ChevronDown } from 'lucide-react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { useId } from 'react';
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form';
import Field, { fieldControlClasses } from './field';

export type SelectOption = {
  value: string | number;
  label: string;
};

export type SelectFieldProps<T extends FieldValues> = UseControllerProps<T> & {
  label: ReactNode;
  hint?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  requiredMark?: boolean;
  fieldClassName?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'defaultValue'>;

/** Desplegable controlado por React Hook Form. */
const SelectField = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  className,
  fieldClassName,
  hint,
  id,
  label,
  options,
  placeholder,
  requiredMark = false,
  ...props
}: SelectFieldProps<T>) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  return (
    <Field
      id={selectId}
      label={label}
      hint={hint}
      error={error?.message}
      required={requiredMark}
      className={fieldClassName}
      trailing={
        <ChevronDown
          className="pointer-events-none h-4 w-4 text-ink-soft"
          aria-hidden="true"
        />
      }
    >
      <select
        {...field}
        {...props}
        id={selectId}
        value={field.value ?? ''}
        aria-describedby={
          [hint && `${selectId}-hint`, error && `${selectId}-error`]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-invalid={error ? true : undefined}
        className={`${fieldControlClasses(Boolean(error))} appearance-none pr-10 ${className ?? ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
};

export default SelectField;
