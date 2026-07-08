describe('CI/CD Gate Demonstration', () => {
  it('should deliberately fail when shouldFail is true', () => {
    // TOGGLE THIS FLAG:
    // Set to true to demonstrate pipeline blocking (the gate fires and fails).
    // Set to false to allow the CI pipeline to pass and complete successfully.
    const shouldFail = false;

    if (shouldFail) {
      throw new Error(
        'Deliberate pipeline block. To pass this gate, set "shouldFail = false" in tests/failing.test.js.'
      );
    }

    expect(shouldFail).toBe(false);
  });
});
