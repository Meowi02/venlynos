// components/Card.tsx
import { cn } from "@/lib/utils";

export default function Card({className,children}:{className?:string;children:any}) {
  return <section className={cn("card", className)}>{children}</section>;
}