import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Perfil from "../Perfil";
import Reviews from "../../tutor/Reviews";
import ClasesTutor from "../ClasesTutor";
import { MemoryRouter } from "react-router-dom";
import api from "../../../services/api";

vi.mock("../../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../tutor/Reviews", () => ({
  default: () => <div data-testid="reviews-mock" />,
}));

vi.mock("../ClasesTutor", () => ({
  default: () => <div data-testid="clases-tutor-mock" />,
}));

describe("Perfil", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "Juan",
        role: "tutor",
        email: "juan@example.com",
        number: "+56912345678",
      })
    );

    api.get.mockResolvedValue({
      data: {
        id: 1,
        name: "Juan",
        role: "tutor",
        email: "juan@example.com",
        number: "+56912345678",
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("muestra el heading con el nombre del usuario y los componentes hijos", async () => {
    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>
    );

    const heading = await screen.findByRole("heading", {
      name: (content) =>
        content.includes("Perfil de Juan") || content.includes("Mi Perfil"),
    });
    expect(heading).toBeInTheDocument();

    expect(screen.getByTestId("reviews-mock")).toBeInTheDocument();
    expect(screen.getByTestId("clases-tutor-mock")).toBeInTheDocument();
  });
});
