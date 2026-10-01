'use client';

import type { Label as LabelPrimitive } from 'radix-ui';
import { Slot } from 'radix-ui';
import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { Label } from '~/components/ui/label';
import { cn } from '~/libs/utils';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}

/*
 * Adições do projeto (não fazem parte do shadcn de fábrica).
 *
 * São os blocos de layout que todo formulário usa. A hierarquia é:
 *
 *   <FormSection>                    // linha: cabeçalho à esquerda, campos à direita
 *     <FormSectionHeader>
 *       <FormSectionTitle />
 *       <FormSectionDescription />
 *     </FormSectionHeader>
 *     <FormSectionFields>            // coluna de campos
 *       <FormFieldGroup>             // campos lado a lado (empilham no mobile)
 *         <FormField ... />
 *       </FormFieldGroup>
 *     </FormSectionFields>
 *   </FormSection>
 */

function FormFieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-field-group"
      className={cn('flex w-full flex-col items-start gap-4 sm:flex-row', className)}
      {...props}
    />
  );
}

function FormSection({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-section"
      className={cn('grid gap-4 lg:grid-cols-3', className)}
      {...props}
    />
  );
}

function FormSectionHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="form-section-header" className={className} {...props} />;
}

function FormSectionFields({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-section-fields"
      className={cn('space-y-4 lg:col-span-2', className)}
      {...props}
    />
  );
}

function FormSectionTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="form-section-title"
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  );
}

function FormSectionDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="form-section-description"
      className={cn('mt-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormFieldGroup,
  FormItem,
  FormLabel,
  FormMessage,
  FormSection,
  FormSectionDescription,
  FormSectionFields,
  FormSectionHeader,
  FormSectionTitle,
  useFormField,
};
