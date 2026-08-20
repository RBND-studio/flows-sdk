import type { LanguageOption } from "@flows/shared";
import { type UserProperties } from "@flows/shared";
import { type ReactNode } from "react";

interface Props {
  userProperties?: UserProperties;
  userId: string | null;
  signature: string | null | undefined;
  language: LanguageOption | undefined;
}

export const UserPanel = ({ userProperties, userId, language, signature }: Props): ReactNode => {
  return (
    <>
      <p className="flows-debug-info-line">
        <strong>User ID:</strong>{" "}
        <code className="flows-debug-inline-code">{userId ?? "Not set"}</code>
      </p>

      <p className="flows-debug-info-line">
        <strong>Signature:</strong>{" "}
        <code className="flows-debug-inline-code">{signature ?? "Not set"}</code>
      </p>

      <p className="flows-debug-info-line">
        <strong>User language:</strong>{" "}
        <code className="flows-debug-inline-code">{language ?? "Not set"}</code>
      </p>

      <p className="flows-debug-info-line">
        <strong>User properties:</strong>
      </p>

      <pre className="flows-debug-code-block">{JSON.stringify(userProperties ?? {}, null, 2)}</pre>
    </>
  );
};
