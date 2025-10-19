require("dotenv").config();
const {
  userRecord,
  findUserByEmail,
  findUserById,
  validateAuthInput,
} = require("../utils/user.config");

describe("User work", () => {
  test.skip("User created", async () => {
    // Arrange - setup
    const name = "Mobi Dick";
    const email = "dick@gmail.com";
    const password = "1234567890";

    // Act - execute the functionality
    const result = await userRecord(name, email, password);

    // Assert - verify the outcome
    expect(result.name).toBe("Mobi Dick");
    expect(result.username).toBe("dick");
    expect(result.id).toBeDefined();
  });

  test("Login user", async () => {
    // Arrange - setup
    const email = "medibo@gmail.com";

    // Act - execute the functionality
    const result = await findUserByEmail(email);

    // Assert - verify the outcome
    expect(result.payload.name).toBe("Ritik Dibo");
    expect(result.payload.username).toBe("medibo");
    expect(result.payload.id).toBeDefined();
  });

  test("User by Id", async () => {
    // Arrange - setup
    const id = "someGarbageData";

    // Act - execute the functionality
    const result = await findUserById(id);

    // Assert - verify the outcome
    expect(result.payload.name).toBe("Mobi Dick");
    expect(result.payload.email).toBe("dick@gmail.com");
  });

  test("User Input Validation", () => {
    // Arrange - setup
    const email = "mobi@gmail.com";
    const password = "1234567890";

    // Act - execute the functionality
    const result = validateAuthInput(email, password);
    console.log(result);

    // Assert - verify the outcome
    expect(result.length <= 0).toBe(true);
  });
});
