import { html, type TemplateResult } from "lit";

interface Props {
  className?: string;
  "aria-hidden"?: "true" | "false";
  "data-open"?: "true" | "false";
  "data-expanded"?: "true" | "false";
}

export const Chevron16 = (props: Props): TemplateResult => {
  return html`
    <svg
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden=${props["aria-hidden"]}
      data-open=${props["data-open"]}
      class=${props.className}
    >
      <path
        d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"
      />
    </svg>
  `;
};
