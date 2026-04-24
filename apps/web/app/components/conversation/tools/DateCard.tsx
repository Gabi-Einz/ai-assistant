import type { GetDatePayload } from "@repo/shared";

export function DateCard({ payload }: { payload: GetDatePayload }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
      <span>📅</span>
      <span className="font-medium">{payload.date}</span>
    </div>
  );
}
