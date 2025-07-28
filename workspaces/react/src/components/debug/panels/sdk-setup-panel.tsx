import { type ReactNode } from "react";
import { DebugSection } from "../debug-section";

interface Props {
  organizationId: string;
  environment: string;
  panelState: string;
  onClose: () => void;
  statusItems: ReactNode;
}

export const SdkSetupPanel = ({
  organizationId,
  environment,
  onClose,
  statusItems,
  panelState,
}: Props): ReactNode => {
  if (panelState === "sdk-setup") {
    const organizationText = organizationId ? (
      organizationId
    ) : (
      <span className="flows-debug-validation-invalid">Not set</span>
    );
    const environmentText = environment ? (
      environment
    ) : (
      <span className="flows-debug-validation-invalid">Not set</span>
    );
    return (
      <DebugSection onClose={onClose} label="SDK Setup">
        <p className="flows-debug-info-line">
          <strong>Organization ID:</strong>{" "}
          <code className="flows-debug-inline-code">{organizationText}</code>
        </p>
        <p className="flows-debug-info-line">
          <strong>Environment:</strong>{" "}
          <code className="flows-debug-inline-code">{environmentText}</code>
        </p>
        <p className="flows-debug-info-line">
          <strong>Validation:</strong>
        </p>
        {statusItems}
      </DebugSection>
    );
  }
  return null;
};
