import clsx from "clsx";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function Container({ className, ...props }) {
  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
