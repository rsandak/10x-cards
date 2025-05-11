import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {
  "data-test-id"?: string;
}

function Alert({ className, variant, "data-test-id": dataTestId, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      data-test-id={dataTestId}
      {...props}
    />
  );
}

interface AlertTitleProps extends React.ComponentProps<"div"> {
  "data-test-id"?: string;
}

function AlertTitle({ className, "data-test-id": dataTestId, ...props }: AlertTitleProps) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      data-test-id={dataTestId}
      {...props}
    />
  );
}

interface AlertDescriptionProps extends React.ComponentProps<"div"> {
  "data-test-id"?: string;
}

function AlertDescription({ className, "data-test-id": dataTestId, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      data-test-id={dataTestId}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
