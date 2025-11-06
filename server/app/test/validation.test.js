const { isValidUsername } = require("../utils/user.config");

test("reject empty username", () => {
  expect(isValidUsername("")).toBe(false);
});

test("reject non-string input", () => {
  expect(isValidUsername(12345)).toBe(false);
});

test("accepts proper username", () => {
  expect(isValidUsername("user1")).toBe(true);
});
