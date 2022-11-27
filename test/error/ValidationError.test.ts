import { ValidationError } from "../../src/error/ValidationError";

test('ValidationError constructor', async () => {
  const error = new ValidationError("errorMessage");

  expect(error.message).toBe("errorMessage");
  expect(error.name).toBe("ValidationError");
});