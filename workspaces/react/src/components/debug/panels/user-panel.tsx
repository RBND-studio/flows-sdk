import { type UserProperties } from "@flows/shared";
import { type ReactNode } from "react";

interface Props {
  userProperties?: UserProperties;
  userId: string;
}

export const UserPanel = ({ userProperties, userId }: Props): ReactNode => {
  return (
    <>
      <p className="flows-debug-info-line">
        <strong>User ID:</strong> <code className="flows-debug-inline-code">{userId}</code>
      </p>

      <p className="flows-debug-info-line">
        <strong>User properties:</strong>
      </p>

      <pre className="flows-debug-code-block">{JSON.stringify(userProperties ?? {}, null, 2)}</pre>
    </>
  );
};
