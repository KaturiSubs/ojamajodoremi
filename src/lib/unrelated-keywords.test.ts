import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { unrelatedKeywordRedirect } from "./unrelated-keywords";

describe("unrelated experiment keywords", () => {
  for (const keyword of [
    "ojamelody", "marudashi", "marudashi 2027", "ojamelody doremi",
    "fnf", "friday night funkin", "friday night funkin'", "bishoujo",
  ]) {
    test(`${keyword} opens the unrelated page`, () => {
      assert.equal(unrelatedKeywordRedirect(keyword), "/unrelated");
      assert.equal(unrelatedKeywordRedirect(` ${keyword.toUpperCase()} `), "/unrelated");
    });
  }
  test("other secrets remain unchanged", () => {
    assert.equal(unrelatedKeywordRedirect("progress"), null);
    assert.equal(unrelatedKeywordRedirect("7b"), null);
    assert.equal(unrelatedKeywordRedirect("marudashi 2028"), null);
  });
});