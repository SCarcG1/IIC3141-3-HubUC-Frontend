import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Perfil from "../Perfil";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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

describe("Perfil", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Vicente", role: "student" })
    );
  });

  it("renderiza perfil propio y permite editar", async () => {
    api.get.mockResolvedValueOnce({
      data: { id: 1, name: "Vicente", email: "vicente@mail.com", role: "student" },
    });

    render(
      <MemoryRouter initialEntries={["/perfil/1"]}>
        <Routes>
          <Route path="/perfil/:id" element={<Perfil />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Editar perfil"));
    const input = screen.getByLabelText("Nombre");
    fireEvent.change(input, { target: { value: "Nuevo Nombre" } });

    api.patch.mockResolvedValueOnce({});
    fireEvent.click(screen.getByText("Guardar"));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/users/1",
        { name: "Nuevo Nombre", email: "vicente@mail.com" },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      )
    );
  });

  it("renderiza perfil de otro usuario", async () => {
    api.get.mockResolvedValueOnce({
      data: { id: 2, name: "Profesor", email: "profe@mail.com", role: "tutor" },
    });

    render(
      <MemoryRouter initialEntries={["/perfil/2"]}>
        <Routes>
          <Route path="/perfil/:id" element={<Perfil />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Perfil de Profesor")).toBeInTheDocument();
      expect(screen.getByText("Tutor")).toBeInTheDocument();
      expect(screen.getByText("Reviews")).toBeInTheDocument();
      expect(screen.getByText("Clases")).toBeInTheDocument();
    });
  });
});