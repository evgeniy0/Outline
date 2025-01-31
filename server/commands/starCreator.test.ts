import { Star, Event } from "@server/models";
import { buildDocument, buildUser } from "@server/test/factories";
import { flushdb } from "@server/test/support";
import starCreator from "./starCreator";

beforeEach(() => flushdb());
describe("starCreator", () => {
  const ip = "127.0.0.1";

  it("should create star", async () => {
    const user = await buildUser();
    const document = await buildDocument({
      userId: user.id,
      teamId: user.teamId,
    });

    const star = await starCreator({
      documentId: document.id,
      user,
      ip,
    });

    const event = await Event.findOne();
    expect(star.documentId).toEqual(document.id);
    expect(star.userId).toEqual(user.id);
    expect(star.index).toEqual("P");
    expect(event!.name).toEqual("stars.create");
    expect(event!.modelId).toEqual(star.id);
  });

  it("should not record event if star is existing", async () => {
    const user = await buildUser();
    const document = await buildDocument({
      userId: user.id,
      teamId: user.teamId,
    });

    await Star.create({
      teamId: document.teamId,
      documentId: document.id,
      userId: user.id,
      createdById: user.id,
      index: "P",
    });

    const star = await starCreator({
      documentId: document.id,
      user,
      ip,
    });

    const events = await Event.count();
    expect(star.documentId).toEqual(document.id);
    expect(star.userId).toEqual(user.id);
    expect(star.index).toEqual("P");
    expect(events).toEqual(0);
  });
});
