import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const init = vi.fn();
vi.mock("posthog-js", () => ({ default: { init } }));

import { initAnalytics } from "./analytics";

const fetchMock = vi.fn();

beforeEach(() => {
  init.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// Runs the before_send hook PostHog was given on a fake event
const send = () => {
  const { before_send } = init.mock.calls[0][1];
  return before_send({ event: "$pageview", properties: {} });
};

describe("initAnalytics", () => {
  test("never calls posthog.init or /api/geo without a key", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    await initAnalytics();
    expect(init).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("with a key, inits cookieless without autocapture", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ country: null })));
    await initAnalytics();
    expect(init).toHaveBeenCalledWith("phc_test", {
      api_host: "https://eu.i.posthog.com",
      capture_pageview: "history_change",
      autocapture: false,
      cookieless_mode: "always",
      before_send: expect.any(Function),
    });
  });

  test("adds the country from /api/geo to every event", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ country: "NZ" })));
    await initAnalytics();
    expect(fetchMock).toHaveBeenCalledWith("/api/geo");
    expect(send().properties).toEqual({ $geoip_country_code: "NZ", $geoip_disable: true });
  });

  test("still inits, with no country, when /api/geo fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    fetchMock.mockRejectedValue(new Error("offline"));
    await initAnalytics();
    expect(init).toHaveBeenCalled();
    expect(send().properties).toEqual({});
  });
});
