import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Horarios from '../HorariosTutor';
import { MemoryRouter } from 'react-router-dom';
import api from '../../../services/api';

vi.mock('../../../services/api');
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HorariosTutor', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ id: 99 }));
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra mensaje mientras se cargan los horarios', () => {
    render(
      <MemoryRouter>
        <Horarios />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cargando horarios/i)).toBeInTheDocument();
  });

  it('muestra mensaje si no hay horarios', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Horarios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No tienes horarios publicados/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra horarios correctamente', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          weekday: 'Tuesday',
          start_hour: '09:00',
          end_hour: '12:00',
          valid_from: '2025-06-10T00:00:00Z',
          valid_until: '2025-07-01T00:00:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <Horarios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Martes de 09:00 a 12:00/)).toBeInTheDocument();
      expect(screen.getByText(/Vigente desde/)).toBeInTheDocument();
    });
  });

  it('navega correctamente al crear nuevo horario', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Horarios />
      </MemoryRouter>
    );

    const btn = await screen.findByText('+ Crear nuevo horario');
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/horarios/nuevo');
  });

  it('navega correctamente al dashboard', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Horarios />
      </MemoryRouter>
    );

    const btn = await screen.findByText(/volver al dashboard/i);
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/tutor');
  });

  it('elimina un horario cuando se confirma', async () => {
    const horario = {
      id: 42,
      weekday: 'Monday',
      start_hour: '08:00',
      end_hour: '10:00',
      valid_from: '2025-06-10T00:00:00Z',
      valid_until: '2025-07-01T00:00:00Z',
    };

    api.get.mockResolvedValueOnce({ data: [horario] });
    api.delete.mockResolvedValueOnce({});

    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    render(
      <MemoryRouter>
        <Horarios />
      </MemoryRouter>
    );

    await screen.findByText(/Lunes de 08:00 a 10:00/);

    const btnEliminar = screen.getByText('Eliminar');
    fireEvent.click(btnEliminar);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/weekly-timeblocks/42',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    // Se elimina del DOM
    expect(screen.queryByText(/Lunes de 08:00 a 10:00/)).not.toBeInTheDocument();
  });
});
