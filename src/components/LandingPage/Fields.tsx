import clsx from "clsx";

const formClasses =
  "block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function Label({ id, children }) {
  return (
    <label
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      htmlFor={id}
      className="mb-3 block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

export function TextField({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  id,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  label,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      {label && <Label id={id}>{label}</Label>}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <input id={id} type={type} {...props} className={formClasses} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function SelectField({ id, label, className = "", ...props }) {
  return (
    <div className={className}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      {label && <Label id={id}>{label}</Label>}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <select id={id} {...props} className={clsx(formClasses, "pr-8")} />
    </div>
  );
}
