import { describe, it, expect } from "vitest";

describe("Environment Variables", () => {
  it("VITE_APP_BASE_URL should be set and valid", () => {
    const baseUrl = process.env.VITE_APP_BASE_URL;
    expect(baseUrl).toBeDefined();
    expect(baseUrl).not.toBe("");
    // Should be a valid URL
    expect(() => new URL(baseUrl!)).not.toThrow();
    // Should start with https
    expect(baseUrl).toMatch(/^https:\/\//);
  });
});
