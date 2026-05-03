import { Modal } from "@heroui/react";
import { ToolResultCard } from "./ToolResultCard";

interface ToolResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  payload: unknown;
  answer?: string | undefined;
}

export function ToolResultModal({ isOpen, onClose, toolName, payload, answer }: ToolResultModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-sm">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-sm font-medium">tool: {toolName}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3 pb-6">
              <ToolResultCard toolName={toolName} payload={payload} />
              {answer && (
                <p className="text-sm text-foreground/70 leading-relaxed">{answer}</p>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
