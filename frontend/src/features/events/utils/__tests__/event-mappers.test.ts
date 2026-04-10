import { mapUpsertEventToDraftPayload } from "../event-mappers";

describe("event mappers", () => {
  it("maps a featured image path into the draft payload", () => {
    const payload = mapUpsertEventToDraftPayload({
      title: "Atlas Summit",
      description: "Leadership gathering",
      city: "Casablanca",
      venue: "Expo Hall",
      startAt: "2026-04-02T09:00:00.000Z",
      endAt: "2026-04-02T18:00:00.000Z",
      price: 120,
      currency: "MAD",
      capacity: 300,
      theme: "Leadership",
      imageUrl: "/images/event-media-demo.svg"
    });

    expect(payload.coverImageRef).toBe("/images/event-media-demo.svg");
    expect(payload.pricingType).toBe("PAID");
  });
});
