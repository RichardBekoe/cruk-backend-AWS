import { UserNotFoundError } from "../../src/error/UserNotFoundError";

test('UserNotFoundError constructor', async () => {
  const error = new UserNotFoundError("errorMessage");

  expect(error.message).toBe("errorMessage");
  expect(error.name).toBe("UserNotFoundError");
});