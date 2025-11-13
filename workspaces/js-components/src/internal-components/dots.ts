import classNames from "classnames";
import { html, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";

interface Props {
  count: number;
  index: number;
}

export const Dots = ({ count, index }: Props): TemplateResult => {
  const dots = Array(count)
    .fill(null)
    .map((_, i) => i);

  return html`
    <div class="flows_basicsV2_dots">
      ${repeat(
        dots,
        (item) =>
          html`<div
            class=${classNames(
              "flows_basicsV2_dots_dot",
              item === index && "flows_basicsV2_dots_dot_active",
            )}
          ></div>`,
      )}
    </div>
  `;
};
