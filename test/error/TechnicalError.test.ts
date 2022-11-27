import { TechnicalError } from "../../src/error/TechnicalError";

test('TechnicalError constructor', async () => {
  const error = new TechnicalError("errorMessage");

  expect(error.message).toBe("errorMessage");
  expect(error.name).toBe("TechnicalError");
});