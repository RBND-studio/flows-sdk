import { type ReactNode } from "react";

interface Props {
  organizationId: string;
  environment: string;
  statusItems: ReactNode;
}

export const SdkSetupPanel = ({ organizationId, environment, statusItems }: Props): ReactNode => {
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
    <>
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
    </>
  );
};
