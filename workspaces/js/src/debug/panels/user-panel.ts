import type { LanguageOption } from "@flows/shared";
import { type UserProperties } from "@flows/shared";
import { html, type TemplateResult } from "lit";

interface Props {
  userProperties?: UserProperties;
  userId: string;
  signature: string | undefined;
  language?: LanguageOption;
}

export const UserPanel = ({
  userId,
  userProperties,
  language,
  signature,
}: Props): TemplateResult => {
  return html`
    <p class="flows-debug-info-line">
      <strong>User ID:</strong> <code class="flows-debug-inline-code">${userId}</code>
    </p>

    <p class="flows-debug-info-line">
      <strong>Signature:</strong>
      <code class="flows-debug-inline-code">${signature ?? "Not set"}</code>
    </p>

    <p class="flows-debug-info-line">
      <strong>User language:</strong>
      <code class="flows-debug-inline-code">${language ?? "Not set"}</code>
    </p>

    <p class="flows-debug-info-line">
      <strong>User properties:</strong>
    </p>

    <pre class="flows-debug-code-block">${JSON.stringify(userProperties ?? {}, null, 2)}</pre>
  `;
};
