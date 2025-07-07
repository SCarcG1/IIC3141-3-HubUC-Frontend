import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClasesTutor from "../ClasesTutor";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../services/api";

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
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ClasesTutor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "mock-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("carga y muestra clases y cursos correctamente", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/courses") {
        return Promise.resolve({
          data: [
            { id: 1, name: "Matemáticas" },
            { id: 2, name: "Física" },
          ],
        });
      }
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 10,
                course_id: 1,
                description: "Clase de álgebra",
                price: 10000,
                tutor_id: 5,
              },
              {
                id: 11,
                course_id: 2,
                description: "Clase de cinemática",
                price: 12000,
                tutor_id: 5,
              },
            ],
          },
        });
      }
      if (url.startsWith("/users/5")) {
        return Promise.resolve({
          data: { id: 5, name: "Profesor Pérez" },
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <ClasesTutor tutorId={5} user={{ role: "student" }} isOwner={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando clases/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Matemáticas")).toBeInTheDocument();
      expect(screen.getByText("Física")).toBeInTheDocument();

      expect(screen.getByText("Clase de álgebra")).toBeInTheDocument();
      expect(screen.getByText("Clase de cinemática")).toBeInTheDocument();

      expect(screen.getAllByText(/Profesor Pérez/).length).toBeGreaterThan(0);

      expect(screen.getAllByText("Solicitar clase").length).toBe(2);
    });
  });

  it("muestra mensaje cuando no hay clases", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/courses") {
        return Promise.resolve({ data: [] });
      }
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <ClasesTutor tutorId={5} user={{ role: "student" }} isOwner={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron clases/i)).toBeInTheDocument();
    });
  });

  it("muestra el botón manejar clases solo si es owner", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/courses") {
        return Promise.resolve({ data: [] });
      }
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <ClasesTutor tutorId={5} user={{ role: "student" }} isOwner={true} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Manejar clases")).toBeInTheDocument();
    });
  });

  it("navega a /mis-clases al hacer click en manejar clases", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/courses") {
        return Promise.resolve({ data: [] });
      }
      if (url.startsWith("/private-lessons/search")) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <ClasesTutor tutorId={5} user={{ role: "student" }} isOwner={true} />
      </MemoryRouter>
    );

    const btn = await screen.findByText("Manejar clases");
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/mis-clases");
  });
});
