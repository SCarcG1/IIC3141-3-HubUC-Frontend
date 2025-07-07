import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Reviews from "../Reviews";
import axios from "../../../services/api";

vi.mock("../ReviewCard", () => ({
  default: ({ review }) => (
    <div data-testid="mock-review-card">
      MockCard: {review.reviewer?.name} ({review.rating})
    </div>
  ),
}));

vi.mock("../../../services/api", () => {
  return {
    __esModule: true,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    },
  };
});

describe("Reviews componente", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    localStorage.setItem("user", JSON.stringify({ id: 1, role: "student" }));
    localStorage.setItem("token", "mocked-token");
  });

  it("muestra reviews, botones y comportamiento según estado", async () => {
    const reviewsData = [
      {
        id: 1,
        content: "Muy buen tutor",
        rating: 5,
        reservation_id: 123,
      },
    ];

    const reservations = [{ id: 123, student_id: 1 }];

    axios.get.mockImplementation((url) => {
      if (url.startsWith("/reviews/tutor/")) {
        return Promise.resolve({ data: reviewsData });
      }
      if (url === "/reservations") {
        return Promise.resolve({ data: reservations });
      }
      if (url === "/users/1") {
        return Promise.resolve({ data: { name: "Alumno 1" } });
      }
      if (url.includes("/reservations/tutor/")) {
        return Promise.resolve({ data: [reservations[0]] });
      }
      return Promise.reject(new Error("URL inesperada: " + url));
    });

    render(<Reviews tutorId={10} isOwner={false} />);

    await waitFor(() => {
      expect(screen.getByText(/MockCard: Alumno 1/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /Editar Review/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Eliminar/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /Dejar una Review/i })
    ).not.toBeInTheDocument();
  });

  it("muestra botón 'Dejar una Review' si no tiene una review previa", async () => {
    axios.get.mockImplementation((url) => {
      if (url.startsWith("/reviews/tutor/")) {
        return Promise.resolve({ data: [] });
      }
      if (url === "/reservations") {
        return Promise.resolve({ data: [{ id: 456, student_id: 1 }] });
      }
      if (url.includes("/reservations/tutor/")) {
        return Promise.resolve({ data: [{ id: 456 }] });
      }
      return Promise.resolve({ data: { name: "Alumno X" } });
    });

    render(<Reviews tutorId={99} isOwner={false} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Este tutor aún no tiene reviews/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /Dejar una Review/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /Editar Review/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Eliminar/i })
    ).not.toBeInTheDocument();
  });

  it("no muestra ningún botón si es dueño del perfil (isOwner)", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<Reviews tutorId={5} isOwner={true} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Este tutor aún no tiene reviews/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Dejar una Review/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Editar Review/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Eliminar/i })
    ).not.toBeInTheDocument();
  });
});
