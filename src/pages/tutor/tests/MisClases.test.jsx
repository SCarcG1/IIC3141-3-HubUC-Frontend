// src/pages/tests/MisClases.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MisClases from "../MisClases";
import { MemoryRouter } from "react-router-dom";
import api from "../../../services/api";

vi.mock("../../../services/api");
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
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("muestra clases cargadas correctamente", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 1,
                course_id: 1,
                description: "Ecuaciones y matrices",
                price: 10000,
              },
            ],
          },
        });
      }
      if (url === "/courses/1") {
        return Promise.resolve({ data: { id: 1, name: "Álgebra" } });
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
      expect(screen.getByText("Álgebra")).toBeInTheDocument();
      expect(screen.getByText(/Ecuaciones y matrices/)).toBeInTheDocument();
    });
  });

  it("muestra mensaje cuando no hay clases", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: {} }); // para cualquier otra llamada como cursos
    });

    render(
      <MemoryRouter>
        <MisClases />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No has publicado ninguna clase aún/i)
      ).toBeInTheDocument();
    });
  });

  it("realiza búsqueda inicial de clases con el tutor_id correcto", async () => {
    const mockClases = [
      {
        id: 5,
        course_id: 2,
        description: "Clase de prueba",
        price: 15000,
      },
    ];

    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        expect(url).toContain("tutor_id=10"); // Verificamos que el user.id se usa
        return Promise.resolve({ data: { results: mockClases } });
      }
      if (url === "/courses/2") {
        return Promise.resolve({ data: { id: 2, name: "Cálculo" } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <MisClases />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Clase de prueba")).toBeInTheDocument();
      expect(screen.getByText("Cálculo")).toBeInTheDocument();
    });
  });

  it("permite navegar al editar una clase", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 1,
                course_id: 1,
                description: "Clases de dinámica",
                price: 12000,
              },
            ],
          },
        });
      }
      if (url === "/courses/1") {
        return Promise.resolve({ data: { id: 1, name: "Física" } });
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

    expect(mockNavigate).toHaveBeenCalledWith("/clases/1/editar");
  });

  it("permite eliminar una clase con confirmación", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    api.get.mockImplementation((url) => {
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 2,
                course_id: 1,
                description: "Reacciones y estequiometría",
                price: 14000,
              },
            ],
          },
        });
      }
      if (url === "/courses/1") {
        return Promise.resolve({ data: { id: 1, name: "Química" } });
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
        "/private-lessons/2",
        expect.anything()
      );
    });
  });
});
