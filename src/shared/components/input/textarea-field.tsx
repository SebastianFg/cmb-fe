import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from 'react-hook-form';
import Field, { fieldControlClasses } from './field';

export type TextareaFieldProps<T extends FieldValues> =
  UseControllerProps<T> & {
    label: ReactNode;
    hint?: ReactNode;
    counter?: ReactNode;
    requiredMark?: boolean;
    fieldClassName?: string;
  } & Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'name' | 'defaultValue'
    >;

/** Área de texto controlada por React Hook Form. */
const TextareaField = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  className,
  counter,
  fieldClassName,
  hint,
  id,
  label,
  requiredMark = false,
  ...props
}: TextareaFieldProps<T>) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  return (
    <Field
      id={textareaId}
      label={
        counter ? (
          <span className="flex items-baseline justify-between gap-2">
            <span>{label}</span>
            <span className="font-mono text-[0.8rem] font-normal text-ink-muted">
              {counter}
            </span>
          </span>
        ) : (
          label
        )
      }
      hint={hint}
      error={error?.message}
      required={requiredMark}
      className={fieldClassName}
    >
      <textarea
        {...field}
        {...props}
        id={textareaId}
        value={field.value ?? ''}
        aria-describedby={
          [hint && `${textareaId}-hint`, error && `${textareaId}-error`]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-invalid={error ? true : undefined}
        className={`${fieldControlClasses(Boolean(error))} min-h-24 resize-y ${className ?? ''}`}
      />
    </Field>
  );
};

export default TextareaField;
