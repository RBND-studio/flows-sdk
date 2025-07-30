import { type UserProperties } from "@flows/shared";
import { html, type TemplateResult } from "lit";

interface Props {
  userProperties?: UserProperties;
  userId: string;
}

export const UserPanel = ({ userId, userProperties }: Props): TemplateResult => {
  return html`
    <p class="flows-debug-info-line">
      <strong>User ID:</strong> <code class="flows-debug-inline-code">${userId}</code>
    </p>

    <p class="flows-debug-info-line">
      <strong>User properties:</strong>
    </p>

    <pre class="flows-debug-code-block">${JSON.stringify(userProperties ?? {}, null, 2)}</pre>
  `;
};
