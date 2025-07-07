import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MisClases from "../MisClases";
import { MemoryRouter } from "react-router-dom";
import api from "../../../services/api";

// Mock del API
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

// Mock del navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("MisClases", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ id: 10 }));
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("role", "tutor");
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("muestra clases correctamente con curso válido (Matemáticas)", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 1,
                course_id: 101,
                description: "Clase de funciones lineales",
                price: 12000,
              },
            ],
          },
        });
      }
      if (url === "/courses/101") {
        return Promise.resolve({ data: { id: 101, name: "Matemáticas" } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <MisClases />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando clases/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Matemáticas")).toBeInTheDocument();
      expect(
        screen.getByText(/Clase de funciones lineales/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content) => content.includes("12") && content.includes("000")
        )
      ).toBeInTheDocument();
    });
  });

  it("muestra mensaje cuando no hay clases", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <MisClases />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.queryByText(/Cargando clases/i)).not.toBeInTheDocument()
    );

    expect(
      screen.getByText((content) =>
        content.includes("No has publicado ninguna clase aún")
      )
    ).toBeInTheDocument();
  });

  it("permite editar una clase", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 2,
                course_id: 102,
                description: "Clase de cinemática",
                price: 15000,
              },
            ],
          },
        });
      }
      if (url === "/courses/102") {
        return Promise.resolve({ data: { id: 102, name: "Física" } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <MisClases />
      </MemoryRouter>
    );

    const botonEditar = await screen.findByText("Editar");
    fireEvent.click(botonEditar);

    expect(mockNavigate).toHaveBeenCalledWith("/clases/2/editar");
  });

  it("permite eliminar una clase con confirmación", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 3,
                course_id: 103,
                description: "Clase de bucles en Python",
                price: 13000,
              },
            ],
          },
        });
      }
      if (url === "/courses/103") {
        return Promise.resolve({ data: { id: 103, name: "Programación" } });
      }
      return Promise.resolve({ data: {} });
    });

    api.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <MisClases />
      </MemoryRouter>
    );

    const botonEliminar = await screen.findByText("Eliminar");
    fireEvent.click(botonEliminar);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        "/private-lessons/3",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });
  });
});
