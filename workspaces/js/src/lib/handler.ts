interface Handler {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is correct type
  handler: (...args: any[]) => any;
}

let handlers: Handler[] = [];

export const addHandlers = (handlersToAdd: Handler[]): void => {
  handlers.forEach(({ type, handler }) => {
    document.removeEventListener(type, handler, true);
  });
  handlersToAdd.forEach(({ type, handler }) => {
    document.addEventListener(type, handler, true);
  });
  handlers = handlersToAdd;
};
