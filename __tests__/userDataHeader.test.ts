import {
  deserializeUserData,
  serializeUserData,
} from "@/features/auth/userDataHeader";

const user = {
  id: 4,
  name: "Дмитрий",
  email: "dmitry@example.com",
  avatarUrl: null,
  roleName: { type: "user" as const, title: "Пользователь" },
};

describe("userDataHeader", () => {
  it("round-trips a user profile with unicode fields", () => {
    expect(deserializeUserData(serializeUserData(user))).toEqual(user);
  });

  it("rejects malformed header data", () => {
    expect(deserializeUserData("not-a-user-profile")).toBeNull();
  });

  it("rejects a valid JSON object that is not a user profile", () => {
    const value = Buffer.from(JSON.stringify({ id: 4 }), "utf8").toString(
      "base64url",
    );

    expect(deserializeUserData(value)).toBeNull();
  });
});
