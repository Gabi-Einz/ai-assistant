import { ToolResultCard } from "./ToolResultCard";

interface ToolResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  payload: unknown;
  answer?: string | undefined;
}

export function ToolResultModal({ isOpen, onClose, toolName, payload, answer }: ToolResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            tool: {toolName}
          </p>
          <button
            onClick={onClose}
            className="text-white/40 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            <ToolResultCard toolName={toolName} payload={payload} />
            {answer && (
              <p className="text-sm leading-relaxed text-white/70">{answer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
