import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "..//Dashboard";
import api from "../../../services/api";

vi.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Dashboard", () => {
  const mockData = [
    {
      id: 1,
      status: "accepted",
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      private_lesson: {
        course: { name: "Programación" },
        tutor: { name: "Tutor X" },
      },
      student: { name: "Alumno A" },
    },
  ];

  beforeEach(() => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("role", "student");
    localStorage.setItem("user", JSON.stringify({ name: "Juan" }));
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renderiza correctamente con datos mock", async () => {
    api.get.mockResolvedValueOnce({ data: mockData });

    render(
      <MemoryRouter>
        <Dashboard
          roleCheck="student"
          apiEndpoint="/reservations/student"
          linkSolicitudes="/solicitudes/alumno"
          mostrarSoloClasesAceptadas={true}
          acciones={[
            {
              title: "Buscar clases",
              links: [{ to: "/clases", label: "Ver clases" }],
            },
          ]}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText("Buscar clases")).toBeInTheDocument();
    expect(await screen.findByText("Programación")).toBeInTheDocument();
  });

  it("redirige si el rol no coincide", async () => {
    localStorage.setItem("role", "tutor");

    render(
      <MemoryRouter>
        <Dashboard
          roleCheck="student"
          apiEndpoint="/reservations/student"
          linkSolicitudes="/solicitudes/alumno"
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
