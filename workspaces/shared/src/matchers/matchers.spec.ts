import * as matchers from "./matchers";

describe("pathnameMatch", () => {
  it("should return true if operator is undefined", () => {
    expect(matchers.pathnameMatch({ pathname: "pathname", value: ["pathname"] })).toBe(true);
  });
  it("should return true if value is undefined", () => {
    expect(matchers.pathnameMatch({ operator: "contains", pathname: "pathname" })).toBe(true);
  });
  it("should return true if value is undefined", () => {
    expect(matchers.pathnameMatch({ operator: "contains", pathname: "pathname" })).toBe(true);
  });
  it("should return false if operator doesn't match", () => {
    expect(
      matchers.pathnameMatch({ operator: "contains", pathname: "wrong", value: ["pathname"] }),
    ).toBe(false);
  });
  it("should return true if operator matchers", () => {
    expect(
      matchers.pathnameMatch({ operator: "contains", pathname: "pathname", value: ["pathname"] }),
    ).toBe(true);
  });
});

describe("elementContains", () => {
  it("should return true if element contains value", () => {
    const parent = document.createElement("div");
    parent.classList.add("parent");
    const child = document.createElement("div");
    child.classList.add("child");
    parent.appendChild(child);
    document.body.appendChild(parent);
    expect(matchers.elementContains({ eventTarget: child, value: ".parent" })).toBe(true);
  });
  it("should return true if element is equal to value", () => {
    const parent = document.createElement("div");
    parent.classList.add("parent");
    document.body.appendChild(parent);
    expect(matchers.elementContains({ eventTarget: parent, value: ".parent" })).toBe(true);
  });
  it("should return true if two elements are found and only the second one contains the eventTarget", () => {
    const parent1 = document.createElement("div");
    parent1.classList.add("parent");
    const parent2 = document.createElement("div");
    parent2.classList.add("parent");
    const child = document.createElement("div");
    child.classList.add("child");
    parent2.appendChild(child);
    document.body.appendChild(parent1);
    document.body.appendChild(parent2);
    expect(matchers.elementContains({ eventTarget: child, value: ".parent" })).toBe(true);
  });
  it("should return false if element doesn't contain value", () => {
    const parent = document.createElement("div");
    parent.classList.add("parent");
    const child = document.createElement("div");
    child.classList.add("child");
    document.body.appendChild(parent);
    document.body.appendChild(child);
    expect(matchers.elementContains({ eventTarget: parent, value: ".child" })).toBe(false);
  });
  it("should return false if value is undefined", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(matchers.elementContains({ eventTarget: el, value: undefined })).toBe(false);
  });
});
