import { render, screen, fireEvent } from '@testing-library/react';
import PublicarClase from '../PublicarClase';

describe('PublicarClase', () => {
  it('muestra el botón del acordeón', () => {
    render(<PublicarClase />);
    expect(
      screen.getByRole('button', { name: /publicar nueva clase/i })
    ).toBeInTheDocument();
  });

  it('muestra los campos al expandir el acordeón', () => {
    render(<PublicarClase />);
    fireEvent.click(
      screen.getByRole('button', { name: /publicar nueva clase/i })
    );

    expect(
      screen.getByPlaceholderText(/\$ CLP/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /publicar clase/i })
    ).toBeInTheDocument();
  });

  it('permite ingresar un precio', () => {
    render(<PublicarClase />);
    fireEvent.click(screen.getByRole('button', { name: /publicar nueva clase/i }));

    const input = screen.getByPlaceholderText(/\$ CLP/);
    fireEvent.change(input, { target: { value: '12345' } });
    expect(input.value).toBe('12345');
  });
});
