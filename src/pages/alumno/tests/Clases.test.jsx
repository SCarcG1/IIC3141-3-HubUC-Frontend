import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Clases from '../Clases';

const navigateMock = vi.fn(); // <-- DEBE estar fuera del mock de react-router-dom

// Mockear useNavigate globalmente
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockLessons = [
  {
    id: 1,
    course_id: 123,
    tutor_id: 456,
    price: 10000,
    start_time: '2025-06-09T03:56:28.602574',
  },
  {
    id: 2,
    course_id: 321,
    tutor_id: 654,
    price: 20000,
    start_time: '2025-06-10T18:00:00.000000',
  },
];

describe('Clases (unit tests)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear(); // limpiar navegación entre tests
  });

  it('renderiza clases correctamente con datos enriquecidos', () => {
    render(
      <MemoryRouter>
        <Clases initialLessons={mockLessons} />
      </MemoryRouter>
    );

    expect(screen.getByText('Clases disponibles')).toBeInTheDocument();
    expect(screen.getAllByText(/Precio: \$\d+/)).toHaveLength(2);
    expect(screen.getAllByText('Solicitar clase')).toHaveLength(2);
  });

  it('muestra el modal al hacer clic en "Solicitar clase"', async () => {
    render(
      <MemoryRouter>
        <Clases initialLessons={mockLessons} />
      </MemoryRouter>
    );

    // Click en el botón "Solicitar clase"
    fireEvent.click(screen.getAllByText('Solicitar clase')[0]);

    // Verifica que el título del modal esté presente (más flexible)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /solicitar clase/i })
      ).toBeInTheDocument();
    });

    // Verifica que aparezcan los botones de acción del modal
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();

    // Opcional: validación de mensaje de fecha vacía
    expect(
      screen.getByText(/no hay bloques disponibles/i)
    ).toBeInTheDocument();
  });


  it('muestra mensaje de carga si no hay initialLessons', () => {
    render(
      <MemoryRouter>
        <Clases />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando clases...')).toBeInTheDocument();
  });

  it('permite escribir en filtros y mantiene los valores', () => {
    render(
      <MemoryRouter>
        <Clases initialLessons={mockLessons} />
      </MemoryRouter>
    );

    const cursoInput = screen.getByPlaceholderText('Nombre de curso');
    const tutorInput = screen.getByPlaceholderText('Nombre del tutor');

    fireEvent.change(cursoInput, { target: { value: 'álgebra' } });
    fireEvent.change(tutorInput, { target: { value: 'Carlos' } });

    expect(cursoInput.value).toBe('álgebra');
    expect(tutorInput.value).toBe('Carlos');
  });

  it('navega al perfil del tutor al hacer clic en "Ver perfil tutor"', () => {
    render(
      <MemoryRouter>
        <Clases initialLessons={mockLessons} />
      </MemoryRouter>
    );

    const verPerfilBtn = screen.getAllByText('Ver perfil tutor')[0];
    fireEvent.click(verPerfilBtn);

    expect(navigateMock).toHaveBeenCalledWith('/perfil/456');
  });
});
