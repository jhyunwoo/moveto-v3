import { ComponentProps } from "react";
import { cn } from "../lib/client/classNameMerge";

export default function DefaultLayout({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("w-screen h-screen p-4 flex flex-col", className)}
    >
      {children}
    </div>
  );
}
