import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogTitle = RD.Title;
export const DialogHeader = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-2", className)} {...p} />
);

export function DialogContent({
  className,
  children,
  ...props
}: RD.DialogContentProps) {
  return (
    <RD.Portal>
      <RD.Overlay className="fixed inset-0 bg-black/40" />
      <RD.Content
        className={cn(
          "fixed left-1/2 top-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </RD.Content>
    </RD.Portal>
  );
}
