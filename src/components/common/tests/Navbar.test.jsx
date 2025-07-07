import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";

// Mock de useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("Navbar", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("redirige al inicio si no hay usuario", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("muestra el rol correctamente", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Juan", role: "tutor" })
    );

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText("Tutor")).toBeInTheDocument();
    expect(screen.getByText("Panel Principal")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("redirige a dashboard correcto al hacer click en logo o Panel Principal", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Juan", role: "student" })
    );

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("TutorUC"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/alumno");

    fireEvent.click(screen.getByText("Panel Principal"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/alumno");
  });

  it("redirige a perfil del usuario al hacer click en Perfil", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 42, name: "Ana", role: "student" })
    );

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const perfilLink = screen.getByText("Perfil");
    expect(perfilLink.getAttribute("href")).toBe("/perfil/42");
  });

  it("cierra sesión correctamente", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Juan", role: "student" })
    );
    localStorage.setItem("token", "abc");
    localStorage.setItem("role", "student");

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Cerrar sesión"));

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("role")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
