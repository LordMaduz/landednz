import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const init = vi.fn();
vi.mock("posthog-js", () => ({ default: { init } }));

import { initAnalytics } from "./analytics";

beforeEach(() => init.mockClear());
afterEach(() => vi.unstubAllEnvs());

describe("initAnalytics", () => {
  test("never calls posthog.init without a key", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    await initAnalytics();
    expect(init).not.toHaveBeenCalled();
  });

  test("with a key, inits without cookies or autocapture", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
    await initAnalytics();
    expect(init).toHaveBeenCalledWith("phc_test", {
      api_host: "https://eu.i.posthog.com",
      capture_pageview: "history_change",
      autocapture: false,
      cookieless_mode: "always",
    });
  });
});
