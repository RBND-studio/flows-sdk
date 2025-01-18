import * as matchers from "./primitive-matchers";

describe("$regex", () => {
  it("should return true if regex is undefined", () => {
    expect(matchers.$regex("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$regex(undefined, "foo")).toBe(false);
  });
  it("should return false if value is not a string", () => {
    expect(matchers.$regex(123, "foo")).toBe(false);
  });
  it("should return false if value does not match regex", () => {
    expect(matchers.$regex("bar", "foo")).toBe(false);
    expect(matchers.$regex("bar foo", "^foo")).toBe(false);
  });
  it("should return true if value matches regex", () => {
    expect(matchers.$regex("foo", "foo")).toBe(true);
    expect(matchers.$regex("foo bar", "^foo")).toBe(true);
  });
  it("should return true if one value in array of strings matches", () => {
    expect(matchers.$regex("foo", ["bar", "^foo"])).toBe(true);
  });
  it("should return false if none of the strings in the array match the regex", () => {
    expect(matchers.$regex("foo", ["bar", "^baz"])).toBe(false);
  });
});

describe("$eq", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$eq("undefined", undefined)).toBe(true);
    expect(matchers.$eq(undefined, undefined)).toBe(true);
  });
  it("should return false if value is not equal to expected", () => {
    expect(matchers.$eq("bar", "foo")).toBe(false);
    expect(matchers.$eq(undefined, "foo")).toBe(false);
    expect(matchers.$eq(1, "1")).toBe(false);
    expect(matchers.$eq(true, "true")).toBe(false);
    expect(matchers.$eq(null, "null")).toBe(false);
    expect(matchers.$eq("foo", null)).toBe(false);
  });
  it("should return true if value is equal to expected", () => {
    expect(matchers.$eq("foo", "foo")).toBe(true);
    expect(matchers.$eq(1, 1)).toBe(true);
    expect(matchers.$eq(false, false)).toBe(true);
    expect(matchers.$eq(null, null)).toBe(true);
  });
  it("should call itself recursively if expected is an array", () => {
    const spy = jest.spyOn(matchers, "$eq");
    expect(matchers.$eq("foo", ["bar", "foo"])).toBe(true);
    expect(spy).toHaveBeenNthCalledWith(1, "foo", ["bar", "foo"]);
    expect(spy).toHaveBeenNthCalledWith(2, "foo", "bar");
    expect(spy).toHaveBeenNthCalledWith(3, "foo", "foo");
  });
});

describe("$ne", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$ne("undefined", undefined)).toBe(true);
    expect(matchers.$ne(undefined, undefined)).toBe(true);
  });
  it("should return true if value is not equal to expected", () => {
    expect(matchers.$ne("bar", "foo")).toBe(true);
    expect(matchers.$ne(undefined, "foo")).toBe(true);
    expect(matchers.$ne(undefined, "undefined")).toBe(true);
    expect(matchers.$ne(1, "1")).toBe(true);
    expect(matchers.$ne(true, "true")).toBe(true);
    expect(matchers.$ne(null, "null")).toBe(true);
    expect(matchers.$ne("foo", null)).toBe(true);
  });
  it("should return false if value is equal to expected", () => {
    expect(matchers.$ne("foo", "foo")).toBe(false);
    expect(matchers.$ne(1, 1)).toBe(false);
    expect(matchers.$ne(false, false)).toBe(false);
    expect(matchers.$ne(null, null)).toBe(false);
  });
  it("should call itself recursively if expected is an array", () => {
    const spy = jest.spyOn(matchers, "$ne");
    expect(matchers.$ne("foo", ["bar", "foo"])).toBe(false);
    expect(spy).toHaveBeenNthCalledWith(1, "foo", ["bar", "foo"]);
    expect(spy).toHaveBeenNthCalledWith(2, "foo", "bar");
    expect(spy).toHaveBeenNthCalledWith(3, "foo", "foo");
  });
});

describe("$gt", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$gt("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$gt(undefined, "foo")).toBe(false);
    expect(matchers.$gt(undefined, 1)).toBe(false);
    expect(matchers.$gt(undefined, new Date())).toBe(false);
  });
  it("should return false if value is not a number, string or date", () => {
    expect(matchers.$gt(true, 1)).toBe(false);
    expect(matchers.$gt(null, 1)).toBe(false);
    expect(matchers.$gt("foo", 1)).toBe(false);
  });
  it("should return false if value is not greater than expected", () => {
    expect(matchers.$gt(1, 1)).toBe(false);
    expect(matchers.$gt(1, 2)).toBe(false);
    expect(matchers.$gt("foo", "foo")).toBe(false);
    expect(matchers.$gt("foo", "foobar")).toBe(false);
    expect(matchers.$gt(new Date("2020-01-01"), new Date("2020-01-01"))).toBe(false);
    expect(matchers.$gt(new Date("2020-01-01"), new Date("2020-01-02"))).toBe(false);
  });
  it("should return false when comparing date with date string not in ISO 8601 format", () => {
    expect(matchers.$gt(new Date("2020-01-02"), "2020-01-01")).toBe(false);
  });
  it("should return true if value is greater than expected", () => {
    expect(matchers.$gt(2, 1)).toBe(true);
    expect(matchers.$gt("foobar", "foo")).toBe(true);
    expect(matchers.$gt(new Date("2020-01-02"), new Date("2020-01-01"))).toBe(true);
    expect(matchers.$gt(new Date("2020-01-02"), "2020-01-01T00:00:00.000Z")).toBe(true);
  });
});

describe("$gte", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$gte("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$gte(undefined, "foo")).toBe(false);
    expect(matchers.$gte(undefined, 1)).toBe(false);
    expect(matchers.$gte(undefined, new Date())).toBe(false);
  });
  it("should return false if value is not a number, string or date", () => {
    expect(matchers.$gte(true, 1)).toBe(false);
    expect(matchers.$gte(null, 1)).toBe(false);
    expect(matchers.$gte("foo", 1)).toBe(false);
  });
  it("should return false if value is not greater than or equal to expected", () => {
    expect(matchers.$gte(1, 2)).toBe(false);
    expect(matchers.$gte("foo", "foobar")).toBe(false);
    expect(matchers.$gte(new Date("2020-01-01"), new Date("2020-01-02"))).toBe(false);
  });
  it("should return false when comparing date with date string not in ISO 8601 format", () => {
    expect(matchers.$gte(new Date("2020-01-01"), "2020-01-01")).toBe(false);
  });
  it("should return true if value is greater than or equal to expected", () => {
    expect(matchers.$gte(1, 1)).toBe(true);
    expect(matchers.$gte(2, 1)).toBe(true);
    expect(matchers.$gte("foo", "foo")).toBe(true);
    expect(matchers.$gte("foobar", "foo")).toBe(true);
    expect(matchers.$gte(new Date("2020-01-01"), new Date("2020-01-01"))).toBe(true);
    expect(matchers.$gte(new Date("2020-01-02"), new Date("2020-01-01"))).toBe(true);
    expect(matchers.$gte(new Date("2020-01-01"), "2020-01-01T00:00:00.000Z")).toBe(true);
    expect(matchers.$gte("2020-01-01T00:00:00.000Z", new Date("2020-01-01"))).toBe(true);
  });
});

describe("$lt", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$lt("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$lt(undefined, "foo")).toBe(false);
    expect(matchers.$lt(undefined, 1)).toBe(false);
    expect(matchers.$lt(undefined, new Date())).toBe(false);
  });
  it("should return false if value is not a number, string or date", () => {
    expect(matchers.$lt(true, 1)).toBe(false);
    expect(matchers.$lt(null, 1)).toBe(false);
    expect(matchers.$lt("foo", 1)).toBe(false);
  });
  it("should return false if value is not less than expected", () => {
    expect(matchers.$lt(1, 1)).toBe(false);
    expect(matchers.$lt(2, 1)).toBe(false);
    expect(matchers.$lt("foo", "foo")).toBe(false);
    expect(matchers.$lt("foobar", "foo")).toBe(false);
    expect(matchers.$lt(new Date("2020-01-01"), new Date("2020-01-01"))).toBe(false);
    expect(matchers.$lt(new Date("2020-01-02"), new Date("2020-01-01"))).toBe(false);
  });

  it("should return false when comparing date with date string not in ISO 8601 format", () => {
    expect(matchers.$lt(new Date("2020-01-01"), "2020-01-02")).toBe(false);
  });
  it("should return true if value is less than expected", () => {
    expect(matchers.$lt(1, 2)).toBe(true);
    expect(matchers.$lt("foo", "foobar")).toBe(true);
    expect(matchers.$lt(new Date("2020-01-01"), new Date("2020-01-02"))).toBe(true);
    expect(matchers.$lt(new Date("2020-01-01"), "2020-01-02T00:00:00.000Z")).toBe(true);
    expect(matchers.$lt("2020-01-01T00:00:00.000Z", new Date("2020-01-02"))).toBe(true);
  });
});

describe("$lte", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$lte("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$lte(undefined, "foo")).toBe(false);
    expect(matchers.$lte(undefined, 1)).toBe(false);
    expect(matchers.$lte(undefined, new Date())).toBe(false);
  });
  it("should return false if value is not a number, string or date", () => {
    expect(matchers.$lte(true, 1)).toBe(false);
    expect(matchers.$lte(null, 1)).toBe(false);
    expect(matchers.$lte("foo", 1)).toBe(false);
  });
  it("should return false if value is not less than or equal to expected", () => {
    expect(matchers.$lte(2, 1)).toBe(false);
    expect(matchers.$lte("foobar", "foo")).toBe(false);
    expect(matchers.$lte(new Date("2020-01-02"), new Date("2020-01-01"))).toBe(false);
  });
  it("should return false when comparing date with date string not in ISO 8601 format", () => {
    expect(matchers.$lte(new Date("2020-01-01"), "2020-01-01")).toBe(false);
  });
  it("should return true if value is less than or equal to expected", () => {
    expect(matchers.$lte(1, 1)).toBe(true);
    expect(matchers.$lte(1, 2)).toBe(true);
    expect(matchers.$lte("foo", "foo")).toBe(true);
    expect(matchers.$lte("foo", "foobar")).toBe(true);
    expect(matchers.$lte(new Date("2020-01-01"), new Date("2020-01-01"))).toBe(true);
    expect(matchers.$lte(new Date("2020-01-01"), new Date("2020-01-02"))).toBe(true);
    expect(matchers.$lte(new Date("2020-01-01"), "2020-01-01T00:00:00.000Z")).toBe(true);
    expect(matchers.$lte("2020-01-01T00:00:00.000Z", new Date("2020-01-01"))).toBe(true);
  });
});

describe("$contains", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$contains("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$contains(undefined, "foo")).toBe(false);
  });
  it("should return false if value is not a string", () => {
    expect(matchers.$contains(123, "foo")).toBe(false);
  });
  it("should return false if value does not contain expected", () => {
    expect(matchers.$contains("bar", "foo")).toBe(false);
    expect(matchers.$contains("bar foo", "barr")).toBe(false);
  });
  it("should return true if value contains expected", () => {
    expect(matchers.$contains("foo", "foo")).toBe(true);
    expect(matchers.$contains("bar foo bar", "foo")).toBe(true);
  });
  it("should call itself recursively if expected is an array", () => {
    const spy = jest.spyOn(matchers, "$contains");
    expect(matchers.$contains("foo bar", ["baz", "foo"])).toBe(true);
    expect(spy).toHaveBeenNthCalledWith(1, "foo bar", ["baz", "foo"]);
    expect(spy).toHaveBeenNthCalledWith(2, "foo bar", "baz");
    expect(spy).toHaveBeenNthCalledWith(3, "foo bar", "foo");
  });
});

describe("$notContains", () => {
  it("should return true if expected is undefined", () => {
    expect(matchers.$notContains("foo")).toBe(true);
  });
  it("should return false if value is undefined", () => {
    expect(matchers.$notContains(undefined, "foo")).toBe(false);
  });
  it("should return false if value is not a string", () => {
    expect(matchers.$notContains(123, "foo")).toBe(false);
  });
  it("should return false if value contains expected", () => {
    expect(matchers.$notContains("foo", "foo")).toBe(false);
    expect(matchers.$notContains("bar foo bar", "foo")).toBe(false);
  });
  it("should return true if value does not contain expected", () => {
    expect(matchers.$notContains("bar", "foo")).toBe(true);
    expect(matchers.$notContains("bar foo", "barr")).toBe(true);
  });
});
