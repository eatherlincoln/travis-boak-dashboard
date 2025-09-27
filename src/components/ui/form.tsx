import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/** Re-export RHF’s provider for convenience */
export const Form = FormProvider;

/** Context so child parts can know the field name if needed */
const FormFieldContext = React.createContext<{ name: string } | undefined>(
  undefined
);

export function useFormField() {
  const ctx = React.useContext(FormFieldContext);
  if (!ctx) {
    throw new Error("useFormField must be used within <FormField>");
  }
  return ctx;
}

/**
 * Field wrapper that binds a single field by name.
 * render MUST return a ReactElement (not just ReactNode).
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TName;
  /** Must return a ReactElement */
  render: (args: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) => React.ReactElement;
}) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        name={props.name}
        control={control}
        render={(args) => props.render(args)} // returns ReactElement
      />
    </FormFieldContext.Provider>
  );
}

/* --- Simple building blocks to mirror shadcn/ui API --- */

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function FormItem({ className, ...rest }, ref) {
  return <div ref={ref} className={cn("space-y-2", className)} {...rest} />;
});

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(function FormLabel({ className, ...rest }, ref) {
  const field = useFormField();
  return (
    <Label
      ref={ref}
      htmlFor={field?.name}
      className={cn("text-sm font-medium", className)}
      {...rest}
    />
  );
});

/** Wraps your input so you can style it consistently if you want */
export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function FormControl({ className, ...rest }, ref) {
  return <div ref={ref} className={cn("space-y-1", className)} {...rest} />;
});

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function FormDescription({ className, ...rest }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-xs text-muted-foreground", className)}
      {...rest}
    />
  );
});

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function FormMessage({ className, ...rest }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-xs text-destructive", className)}
      {...rest}
    />
  );
});
