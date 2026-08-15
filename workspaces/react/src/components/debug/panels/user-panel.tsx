import type { LanguageOption } from "@flows/shared";
import { type UserProperties } from "@flows/shared";
import { type ReactNode } from "react";

interface Props {
  userProperties?: UserProperties;
  userId: string;
  language?: LanguageOption;
}

export const UserPanel = ({ userProperties, userId, language }: Props): ReactNode => {
  return (
    <>
      <p className="flows-debug-info-line">
        <strong>User ID:</strong> <code className="flows-debug-inline-code">{userId}</code>
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
