import { useState } from "react";

export function AccordionSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="rounded-3xl border border-black/10 bg-white p-4"
    >
      <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-widest text-black/50">
        {title}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}