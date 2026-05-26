import type {
  FlowsProperties,
  ComponentProps,
  SurveyComponentProps,
  TourComponentProps,
} from "./components";

type ActiveBlockBase<T extends string, P extends { __flows: FlowsProperties }> = {
  /**
   * Unique identifier of the block. Useful as a stable `key` during rendering.
   *
   * Note: each workflow version assigns different ids to each block, so this value changes on workflow publish.
   */
  id: string;
  /**
   * Discriminant that identifies the block variant. Use this to narrow the type and access type-safe `props`.
   *
   * - `"component"` — a standalone workflow block
   * - `"tour-component"` — a single step within a tour
   * - `"survey"` — a survey block
   */
  type: T;
  /**
   * The key of the registered UI component used to render this block.
   * Must match a key registered in `FlowsProvider` (React) or `init` (JS).
   */
  component: string;
  /**
   * Props to pass to the component. The exact shape depends on the block `type`:
   *
   * - `"component"` → `ComponentProps`
   * - `"tour-component"` → `TourComponentProps` — includes `continue`, `previous?`, and `cancel`
   * - `"survey"` → `SurveyComponentProps` — includes `survey`, `complete`, and `cancel`
   */
  props: P;
};

/**
 * An `ActiveBlock` representing a standalone workflow component block.
 *
 * Narrow to this type by checking `block.type === "component"`.
 */
export type ComponentActiveBlock = ActiveBlockBase<
  "component",
  ComponentProps<Record<string, unknown>>
>;

/**
 * An `ActiveBlock` representing a single step within a tour.
 *
 * Narrow to this type by checking `block.type === "tour-component"`.
 */
export type TourComponentActiveBlock = ActiveBlockBase<
  "tour-component",
  TourComponentProps<Record<string, unknown>>
> & {
  /**
   * Unique identifier of the parent tour block this step belongs to. Useful as a stable `key` during rendering.
   *
   * Prefer this over `id` when rendering tour steps — reusing the same key across steps lets the browser
   * reuse the DOM element rather than unmounting and remounting it between individual steps.
   *
   * Note: each workflow version assigns different ids to each block, so this value changes on workflow publish.
   */
  tourBlockId?: string;
};

/**
 * An `ActiveBlock` representing a survey block.
 *
 * Narrow to this type by checking `block.type === "survey"`.
 */
export type SurveyActiveBlock = ActiveBlockBase<
  "survey",
  SurveyComponentProps<Record<string, unknown>>
>;

/**
 * A block that is currently active and ready to render.
 *
 * Use `block.type` to narrow to a specific variant and access type-safe `props`:
 *
 * ```ts
 * if (block.type === "tour-component") {
 *   // props is TourComponentProps — includes continue, previous?, cancel
 *   block.props.continue();
 * }
 * ```
 *
 * @see {@link ComponentActiveBlock} for `"component"` blocks
 * @see {@link TourComponentActiveBlock} for `"tour-component"` blocks
 * @see {@link SurveyActiveBlock} for `"survey"` blocks
 */
export type ActiveBlock = ComponentActiveBlock | TourComponentActiveBlock | SurveyActiveBlock;

export const createActiveBlockProxy = (
  block: ActiveBlock,
  sendActivate: (blockId: string) => Promise<void>,
): ActiveBlock => {
  return new Proxy<ActiveBlock>(block, {
    get(target, prop, receiver) {
      if (prop === "props") void sendActivate(block.id);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's needed for the proxy to work
      return Reflect.get(target, prop, receiver);
    },
  });
};
