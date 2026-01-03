import { ComponentProps } from "react";
import { cn } from "../lib/client/classNameMerge";

/**
 * Default Class Name: w-screen h-screen p-4 flex flex-col
 * @param children
 * @param className
 * @param props
 * @constructor
 */
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
