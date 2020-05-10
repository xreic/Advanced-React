describe('Sample Test 101', () => {
  it('works as expected', () => {
    const age = 100;

    expect(1).toEqual(1);
    expect(age).toEqual(100);
  });

  it('handles ranges fine', () => {
    const age = 200;

    expect(age).toBeGreaterThan(100);
  });
});
