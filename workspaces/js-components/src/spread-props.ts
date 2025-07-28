import type { ElementPart, Part } from "lit";
import { nothing } from "lit/html.js";
import { directive } from "lit/directive.js";
import { AsyncDirective } from "lit/async-directive.js";

/**
 * Usage:
 * ```
 *    import { html, render } from 'lit';
 *    import { spreadProps } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spreadProps({
 *              prop1: 'prop1',
 *              prop2: ['Prop', '2'],
 *              prop3: {
 *                  prop: 3,
 *              }
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 * ```
 */
export class SpreadPropsDirective extends AsyncDirective {
  host!: EventTarget | object | Element;
  element!: Element;
  prevData: Record<string, unknown> = {};

  render(_spreadData: Record<string, unknown>): unknown {
    return nothing;
  }
  update(part: Part, [spreadData]: Parameters<this["render"]>): void {
    if (this.element !== (part as ElementPart).element) {
      this.element = (part as ElementPart).element;
    }
    this.host = part.options?.host || this.element;
    this.apply(spreadData);
    this.groom(spreadData);
    this.prevData = { ...spreadData };
  }

  apply(data?: Record<string, unknown>): void {
    if (!data) return;
    const { prevData, element } = this;
    for (const key in data) {
      const value = data[key];
      if (value === prevData[key]) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- needed for dynamic indexing
      // @ts-ignore
      element[key] = value;
    }
  }

  groom(data?: Record<string, unknown>): void {
    const { prevData, element } = this;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- could be undefined
    if (!prevData) return;
    for (const key in prevData) {
      if (
        !data ||
        (!(key in data) &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- needed for dynamic indexing
          // @ts-ignore
          element[key] === prevData[key])
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- needed for dynamic indexing
        // @ts-ignore
        element[key] = undefined;
      }
    }
  }
}

export const spreadProps = directive(SpreadPropsDirective);
