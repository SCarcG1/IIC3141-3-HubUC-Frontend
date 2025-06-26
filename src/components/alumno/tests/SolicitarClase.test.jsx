import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SolicitarClase from '../SolicitarClase';
import api from '../../../services/api';

// Mocks
vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

// Mock de navigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ lessonId: '42' }),
    useNavigate: () => navigateMock,
  };
});

describe('SolicitarClase', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra mensaje de carga inicialmente y luego bloques disponibles', async () => {
    api.get.mockResolvedValueOnce({ data: { tutor_id: 99 } }); // private-lesson
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          weekday: 'Monday',
          start_hour: 9,
          end_hour: 10,
          valid_until: '2025-06-30T00:00:00Z',
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/solicitar/42']}>
        <Routes>
          <Route path="/solicitar/:lessonId" element={<SolicitarClase />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando bloques/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Lunes de 9:00 a 10:00/i)).toBeInTheDocument();
    });
  });

  it('permite seleccionar fecha y bloque, y enviar reserva', async () => {
    api.get.mockResolvedValueOnce({ data: { tutor_id: 99 } }); // private-lesson
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          weekday: 'Monday',
          start_hour: 9,
          end_hour: 10,
          valid_until: '2025-06-30T00:00:00Z',
        },
      ],
    });

    api.post.mockResolvedValueOnce({});

    window.alert = vi.fn();

    render(
      <MemoryRouter initialEntries={['/solicitar/42']}>
        <Routes>
          <Route path="/solicitar/:lessonId" element={<SolicitarClase />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Lunes de 9:00 a 10:00/);

    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: '2025-06-25' },
    });

    fireEvent.click(screen.getByText(/Lunes de 9:00 a 10:00/));
    fireEvent.click(screen.getByText(/Confirmar Reserva/i));

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
        "/reservations/lesson/42",
        expect.objectContaining({
            start_time: expect.stringContaining("2025-06-24"),
        }),
        expect.anything()
        );
      expect(window.alert).toHaveBeenCalledWith('Clase solicitada correctamente');
      expect(navigateMock).toHaveBeenCalledWith('/mis-reservas');
    });
  });

  it('muestra alerta si falta la fecha o el bloque', async () => {
    api.get.mockResolvedValueOnce({ data: { tutor_id: 99 } }); // private-lesson
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          weekday: 'Monday',
          start_hour: 9,
          end_hour: 10,
          valid_until: '2025-06-30T00:00:00Z',
        },
      ],
    });

    window.alert = vi.fn();

    render(
      <MemoryRouter initialEntries={['/solicitar/42']}>
        <Routes>
          <Route path="/solicitar/:lessonId" element={<SolicitarClase />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Lunes de 9:00 a 10:00/);

    // Sin seleccionar nada
    fireEvent.click(screen.getByText(/Confirmar Reserva/i));
    expect(window.alert).toHaveBeenCalledWith('Selecciona fecha y bloque');
  });
});
