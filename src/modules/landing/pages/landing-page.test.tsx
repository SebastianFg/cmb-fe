import { screen, within } from '@testing-library/react';
import { centerOptions } from '@/config/center-options';
import { insurers, team } from '@/modules/landing/data/landing-content';
import { renderWithProviders } from '../../../../tests/test-utils';
import LandingPage from './landing-page';

const waLinks = () =>
  screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href')?.startsWith('https://wa.me/'));

describe('landing pública', () => {
  test('arma las secciones del diseño', () => {
    renderWithProviders(<LandingPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Tu salud, a un mensaje de distancia/,
      }),
    ).toBeInTheDocument();

    for (const name of [
      'Medicina de barrio, con la atención que te merecés.',
      '¿Qué necesitás hoy?',
      'Pedir turno es así de fácil',
      'Profesionales que te escuchan',
      'Atendemos con tu cobertura',
      'Pedí tu turno ahora.',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
  });

  test('usa el teléfono de las opciones en todos los enlaces de llamada', () => {
    renderWithProviders(<LandingPage />);

    const callLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('tel:'));

    expect(callLinks.length).toBeGreaterThanOrEqual(3);
    for (const link of callLinks) {
      expect(link).toHaveAttribute('href', `tel:${centerOptions.phoneE164}`);
    }
    expect(screen.getAllByText(centerOptions.phone).length).toBeGreaterThan(0);
  });

  test('arma los enlaces de WhatsApp con el número configurado', () => {
    renderWithProviders(<LandingPage />);

    const links = waLinks();

    expect(links.length).toBeGreaterThan(8);
    for (const link of links) {
      expect(link.getAttribute('href')).toContain(
        `https://wa.me/${centerOptions.whatsapp}`,
      );
    }
  });

  test('cada especialidad escribe su propio mensaje', () => {
    renderWithProviders(<LandingPage />);

    const section = screen.getByRole('region', { name: '¿Qué necesitás hoy?' });
    const card = within(section).getByRole('link', { name: /Pediatría/ });

    expect(card.getAttribute('href')).toContain(
      encodeURIComponent('un turno de Pediatría'),
    );
  });

  test('lista las fichas del equipo y las coberturas que acepta el centro', () => {
    renderWithProviders(<LandingPage />);

    const teamSection = screen.getByRole('region', {
      name: 'Profesionales que te escuchan',
    });
    expect(within(teamSection).getAllByRole('listitem')).toHaveLength(
      team.length,
    );

    const coverage = screen.getByRole('region', {
      name: 'Atendemos con tu cobertura',
    });
    expect(
      within(coverage)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([...insurers]);
  });

  test('ofrece entrar al sistema', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  test('muestra la dirección, el correo y el aviso de emergencias', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByText(centerOptions.address)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: centerOptions.email }),
    ).toHaveAttribute('href', `mailto:${centerOptions.email}`);
    expect(screen.getByText(/llamá al 107/)).toBeInTheDocument();
  });
});
