import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function NavLink({ href, children }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      href={href}
      className="inline-flex items-center rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
