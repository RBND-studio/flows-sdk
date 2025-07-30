import { type TemplateResult, html } from "lit";

interface Props {
  organizationId: string;
  environment: string;
  statusItems: TemplateResult;
}

export const SdkSetupPanel = ({
  organizationId,
  environment,
  statusItems,
}: Props): TemplateResult => {
  const organizationText = organizationId
    ? organizationId
    : html`<span class="flows-debug-validation-invalid">Not set</span>`;
  const environmentText = environment
    ? environment
    : html`<span class="flows-debug-validation-invalid">Not set</span>`;
  return html`
    <p class="flows-debug-info-line">
      <strong>Organization ID:</strong>
      <code class="flows-debug-inline-code">${organizationText}</code>
    </p>
    <p class="flows-debug-info-line">
      <strong>Environment:</strong>
      <code class="flows-debug-inline-code">${environmentText}</code>
    </p>
    <p class="flows-debug-info-line">
      <strong>Validation:</strong>
    </p>
    ${statusItems}
  `;
};
