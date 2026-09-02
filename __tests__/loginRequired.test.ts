import { redirect, unauthorized } from "next/navigation";
import getCurrentUser from "@/features/auth/getUserProfile";
import cookiesUtils from "@/features/auth/cookies/cookiesUtils";
import loginRequired, {
  loginRequiredApi,
} from "@/features/auth/loginRequired";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
  unauthorized: jest.fn(() => {
    throw new Error("unauthorized");
  }),
}));

jest.mock("@/features/auth/getUserProfile", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/features/auth/cookies/cookiesUtils", () => ({
  __esModule: true,
  default: {
    getJWT: jest.fn(),
    getRefreshToken: jest.fn(),
    removeJWT: jest.fn(),
    removeRefreshToken: jest.fn(),
  },
}));

const getCurrentUserMock = jest.mocked(getCurrentUser);
const redirectMock = jest.mocked(redirect);
const unauthorizedMock = jest.mocked(unauthorized);
const cookiesUtilsMock = jest.mocked(cookiesUtils);

const user = {
  id: 4,
  name: "Dmitry",
  email: "dmitry@example.com",
  avatarUrl: null,
  roleName: { type: "user" as const, title: "User" },
};

describe("loginRequiredApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current user when access token is valid", async () => {
    cookiesUtilsMock.getJWT.mockResolvedValue("access-token");
    cookiesUtilsMock.getRefreshToken.mockResolvedValue("refresh-token");
    getCurrentUserMock.mockResolvedValue(user);

    await expect(loginRequiredApi()).resolves.toEqual(user);
    expect(unauthorizedMock).not.toHaveBeenCalled();
  });

  it("returns 401 when both tokens are missing", async () => {
    cookiesUtilsMock.getJWT.mockResolvedValue(undefined);
    cookiesUtilsMock.getRefreshToken.mockResolvedValue(undefined);

    await expect(loginRequiredApi()).rejects.toThrow("unauthorized");
    expect(unauthorizedMock).toHaveBeenCalledTimes(1);
    expect(cookiesUtilsMock.removeJWT).not.toHaveBeenCalled();
  });

  it("removes only invalid access before returning 401", async () => {
    cookiesUtilsMock.getJWT.mockResolvedValue("invalid-access");
    cookiesUtilsMock.getRefreshToken.mockResolvedValue("refresh-token");
    getCurrentUserMock.mockResolvedValue(null);

    await expect(loginRequiredApi()).rejects.toThrow("unauthorized");
    expect(cookiesUtilsMock.removeJWT).toHaveBeenCalledTimes(1);
    expect(cookiesUtilsMock.removeRefreshToken).not.toHaveBeenCalled();
  });
});

describe("loginRequired", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current user when access token is valid", async () => {
    cookiesUtilsMock.getJWT.mockResolvedValue("access-token");
    cookiesUtilsMock.getRefreshToken.mockResolvedValue("refresh-token");
    getCurrentUserMock.mockResolvedValue(user);

    await expect(loginRequired()).resolves.toEqual(user);
  });

  it("redirects an invalid session without refreshing or mutating cookies", async () => {
    cookiesUtilsMock.getJWT.mockResolvedValue("invalid-access");
    cookiesUtilsMock.getRefreshToken.mockResolvedValue("refresh-token");
    getCurrentUserMock.mockResolvedValue(null);

    await expect(loginRequired()).rejects.toThrow(
      "redirect:/login?session-expired=true",
    );
    expect(redirectMock).toHaveBeenCalledWith(
      "/login?session-expired=true",
    );
    expect(cookiesUtilsMock.removeJWT).not.toHaveBeenCalled();
    expect(cookiesUtilsMock.removeRefreshToken).not.toHaveBeenCalled();
  });

  it("redirects to login when both tokens are missing", async () => {
    cookiesUtilsMock.getJWT.mockResolvedValue(undefined);
    cookiesUtilsMock.getRefreshToken.mockResolvedValue(undefined);

    await expect(loginRequired()).rejects.toThrow("redirect:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
    expect(cookiesUtilsMock.removeJWT).not.toHaveBeenCalled();
    expect(cookiesUtilsMock.removeRefreshToken).not.toHaveBeenCalled();
  });
});
