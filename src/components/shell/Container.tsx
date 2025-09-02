import { cn } from "@/lib/cn";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn(
      "w-full max-w-7xl mx-auto",
      "floating-container p-6",
      "min-h-[calc(100vh-8rem)]", // Account for padding
      className
    )}>
      {children}
    </div>
  );
}