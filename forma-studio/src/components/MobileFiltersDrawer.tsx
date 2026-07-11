import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function MobileFiltersDrawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-auto rounded-t-3xl border border-black/10 bg-white p-4 outline-none">
          <div className="flex items-center justify-between pb-3">
            <Dialog.Title className="text-sm font-semibold">
              Filtros
            </Dialog.Title>
            <Dialog.Close className="rounded-xl p-2 hover:bg-black/5">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {children}

          <Dialog.Close className="mt-4 w-full rounded-2xl bg-[#0B0B0C] px-4 py-3 text-sm font-semibold text-white">
            Aplicar
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}