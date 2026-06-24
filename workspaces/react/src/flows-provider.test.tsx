/**
 * Regression test for https://github.com/RBND-studio/flows-sdk/issues/384
 * FlowsProvider threw "Rendered more hooks than during the previous render"
 * when userId changed from null to a string because PathnameProvider was
 * conditionally included in the tree.
 */

import React, { act, type FC, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FlowsProvider } from "./flows-provider";

// Required for React 19 concurrent act() in non-browser environments (jsdom).
// See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#configuring-your-testing-environment
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Minimal stubs so the provider can mount in jsdom without real network calls
// ---------------------------------------------------------------------------

// Stub WebSocket so useWebsocket does not attempt real connections.
class StubWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = StubWebSocket.CONNECTING;
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

// Stub getApi so useBlocks never fires real HTTP requests.
jest.mock("@flows/shared", () => {
  const actual = jest.requireActual<Record<string, unknown>>("@flows/shared");
  return {
    ...actual,
    getApi: () => ({
      getBlocks: () => new Promise<never>(() => {}), // never resolves
      sendEvent: () => Promise.resolve(),
    }),
    getSessionStorageRunningSurveys: () => [],
    saveSessionStorageRunningSurveys: () => {},
  };
});

// ---------------------------------------------------------------------------
// Minimal component props for FlowsProvider
// ---------------------------------------------------------------------------
const COMMON_PROPS = {
  organizationId: "org-test",
  environment: "test",
  components: {},
  tourComponents: {},
  surveyComponents: {},
} as const;

// ---------------------------------------------------------------------------
// Helper: a wrapper component that can toggle userId between null and string
// ---------------------------------------------------------------------------
let setUserIdExternal: ((id: string | null) => void) | null = null;

const Wrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  setUserIdExternal = setUserId;

  return (
    <FlowsProvider {...COMMON_PROPS} userId={userId}>
      {children ?? <div data-testid="child">child</div>}
    </FlowsProvider>
  );
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("FlowsProvider – userId change", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalWebSocket = (globalThis as Record<string, unknown>).WebSocket;

  beforeAll(() => {
    (globalThis as Record<string, unknown>).WebSocket = StubWebSocket;
  });

  afterAll(() => {
    (globalThis as Record<string, unknown>).WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    setUserIdExternal = null;
  });

  it("does not throw when userId changes from null to a string", () => {
    // Mount with userId=null (SDK disabled state)
    act(() => {
      root.render(<Wrapper />);
    });

    // Confirm the child is rendered even while userId is null
    expect(container.querySelector("[data-testid=child]")).not.toBeNull();

    // Change userId from null → "user-1" — this previously threw:
    // "Rendered more hooks than during the previous render."
    expect(() => {
      act(() => {
        setUserIdExternal?.("user-1");
      });
    }).not.toThrow();

    // Child should still be rendered after the transition
    expect(container.querySelector("[data-testid=child]")).not.toBeNull();
  });

  it("does not throw when userId changes from a string back to null", () => {
    act(() => {
      root.render(<Wrapper />);
    });

    act(() => {
      setUserIdExternal?.("user-1");
    });

    expect(() => {
      act(() => {
        setUserIdExternal?.(null);
      });
    }).not.toThrow();

    expect(container.querySelector("[data-testid=child]")).not.toBeNull();
  });

  it("does not throw on rapid null → string → null → string transitions", () => {
    act(() => {
      root.render(<Wrapper />);
    });

    expect(() => {
      act(() => {
        setUserIdExternal?.("user-1");
        setUserIdExternal?.(null);
        setUserIdExternal?.("user-2");
      });
    }).not.toThrow();

    expect(container.querySelector("[data-testid=child]")).not.toBeNull();
  });
});
