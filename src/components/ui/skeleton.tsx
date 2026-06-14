import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
