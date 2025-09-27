// src/components/ui/tabs.tsx
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-card p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-colors",
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
