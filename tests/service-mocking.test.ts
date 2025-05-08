import { describe, it, expect, vi, beforeEach } from "vitest";

// Definiuję interfejs dla danych użytkownika
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

// Przykładowa klasa serwisu do mockowania
class UserService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUser(_id: string): Promise<User> {
    // W rzeczywistej implementacji byłoby tutaj zapytanie do API/bazy danych
    // ale na potrzeby przykładu zwracamy zawsze obiekt error
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUser(_id: string, _data: Partial<User>): Promise<{ success: boolean }> {
    // W rzeczywistej implementacji byłaby aktualizacja w API/bazie danych
    throw new Error("Not implemented");
  }
}

// Przykładowa funkcja korzystająca z serwisu
async function getUserDisplayName(userService: UserService, userId: string): Promise<string> {
  try {
    const user = await userService.getUser(userId);
    return `${user.firstName} ${user.lastName}`;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _error = error;
    return "Unknown User";
  }
}

describe("Mocking external services", () => {
  let userService: UserService;

  beforeEach(() => {
    // Przygotowanie świeżej instancji serwisu przed każdym testem
    userService = new UserService();
  });

  it("should return formatted user name when user exists", async () => {
    // Arrange - mockowanie metody getUser
    vi.spyOn(userService, "getUser").mockResolvedValue({
      id: "123",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
    });

    // Act
    const result = await getUserDisplayName(userService, "123");

    // Assert
    expect(userService.getUser).toHaveBeenCalledWith("123");
    expect(userService.getUser).toHaveBeenCalledTimes(1);
    expect(result).toBe("Jan Kowalski");
  });

  it('should return "Unknown User" when user does not exist', async () => {
    // Arrange - mockowanie metody getUser, która rzuca wyjątek
    vi.spyOn(userService, "getUser").mockRejectedValue(new Error("User not found"));

    // Act
    const result = await getUserDisplayName(userService, "999");

    // Assert
    expect(userService.getUser).toHaveBeenCalledWith("999");
    expect(result).toBe("Unknown User");
  });

  it("should mock class implementation completely", async () => {
    // Arrange - kompletne mockowanie klasy
    const MockedUserService = vi.fn(() => ({
      getUser: vi.fn().mockResolvedValue({
        id: "456",
        firstName: "Anna",
        lastName: "Nowak",
      }),
      updateUser: vi.fn().mockResolvedValue({ success: true }),
    }));

    const mockedService = new MockedUserService();

    // Act
    const result = await getUserDisplayName(mockedService as unknown as UserService, "456");

    // Assert
    expect(mockedService.getUser).toHaveBeenCalledWith("456");
    expect(result).toBe("Anna Nowak");
  });
});
