import { type UserProperties } from "@flows/shared";
import { type ReactNode } from "react";
import { DebugSection } from "../debug-section";

interface Props {
  userProperties?: UserProperties;
  userId: string;
  panelState: string;
  onClose: () => void;
}

export const UserPanel = ({ userProperties, userId, onClose, panelState }: Props): ReactNode => {
  if (panelState === "user") {
    return (
      <DebugSection onClose={onClose} label="User Information">
        <p className="flows-debug-info-line">
          <strong>User ID:</strong> <code className="flows-debug-inline-code">{userId}</code>
        </p>

        <p className="flows-debug-info-line">
          <strong>User properties:</strong>
        </p>

        <pre className="flows-debug-code-block">
          {JSON.stringify(userProperties ?? {}, null, 2)}
        </pre>
      </DebugSection>
    );
  }

  return null;
};
