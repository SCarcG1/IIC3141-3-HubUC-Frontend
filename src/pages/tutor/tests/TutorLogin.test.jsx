
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TutorLogin from '../TutorLogin'
import * as apiModule from '../../../services/api'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../../services/api')

describe('TutorLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el formulario de ingreso por defecto', () => {
    render(<TutorLogin />, { wrapper: BrowserRouter })
    expect(screen.getByText(/ingreso tutor/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument()
  })

  it('permite cambiar a registro y volver a ingreso', () => {
    render(<TutorLogin />, { wrapper: BrowserRouter })

    const toggleBtn = screen.getByRole('button', {
      name: /¿no tienes cuenta\? regístrate aquí/i,
    })
    fireEvent.click(toggleBtn)

    expect(screen.getByText(/registro tutor/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument()

    const toggleBackBtn = screen.getByRole('button', {
      name: /¿ya tienes cuenta\? inicia sesión/i,
    })
    fireEvent.click(toggleBackBtn)

    expect(screen.getByText(/ingreso tutor/i)).toBeInTheDocument()
  })

  it('muestra mensaje de éxito tras login', async () => {
    apiModule.default.post.mockResolvedValue({ data: {} })

    render(<TutorLogin />, { wrapper: BrowserRouter })
    fireEvent.change(screen.getByPlaceholderText(/correo/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText(/ingreso exitoso/i)).toBeInTheDocument()
  })
})
