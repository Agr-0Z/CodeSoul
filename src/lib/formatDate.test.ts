import assert from "node:assert/strict";
import { formatDate } from "./formatDate";

assert.equal(formatDate("2026-08-12"), "2026年8月12日");
assert.equal(formatDate("2026-01-01"), "2026年1月1日");
assert.throws(() => formatDate("08/12/2026"));

console.log("formatDate.test.ts ok");
