import { screen, waitFor, within } from '@testing-library/react';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { resetPrototypeStore } from '@/prototype/prototype-store';
import { renderWithProviders } from '../../../../tests/test-utils';
import PatientDeskPage from './patient-desk-page';

type User = ReturnType<typeof renderWithProviders>['user'];

const fillDeskForm = async (user: User, document = '41222333') => {
  await user.type(screen.getByLabelText(/^Apellido/), 'Quiroga');
  await user.type(screen.getByLabelText(/^Nombre/), 'Elena');
  await user.type(screen.getByLabelText(/^Número de documento/), document);
  await user.type(screen.getByLabelText(/^Fecha de nacimiento/), '1990-04-12');
  await user.selectOptions(screen.getByLabelText(/^Nacionalidad/), '1');
  await user.type(screen.getByLabelText(/^Teléfono/), '1154001122');
  await user.selectOptions(screen.getByLabelText(/^Obra social \*/), '2');
  await user.type(screen.getByLabelText(/^Número de afiliado/), '7788-0011');
};

const table = () => screen.getByRole('table');

describe('alta de pacientes desde el mostrador', () => {
  beforeEach(() => {
    resetPrototypeStore();
    useAuthStore.getState().setSession({
      token: 'tok',
      user: {
        id: 2,
        name: 'Claudia Molina',
        shortName: 'C. Molina',
        email: 'recepcion@cmbelgrano.com.ar',
        role: 'reception',
      },
    });
  });

  test('la tabla queda ocupada hasta que llega la primera página', async () => {
    renderWithProviders(<PatientDeskPage />);

    expect(table()).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => {
      expect(table()).toHaveAttribute('aria-busy', 'false');
    });
  });

  test('no pide credenciales: la ficha la carga recepción', async () => {
    renderWithProviders(<PatientDeskPage />);

    expect(screen.queryByLabelText(/^Contraseña/)).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Acepto que el centro/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Enviar invitación al portal'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar paciente' }),
    ).toBeInTheDocument();
  });

  test('el correo es opcional en mostrador', async () => {
    const { user } = renderWithProviders(<PatientDeskPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillDeskForm(user);
    await user.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Se registró a Elena',
    );
  });

  test('la ficha nueva aparece en el listado', async () => {
    const { user } = renderWithProviders(<PatientDeskPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillDeskForm(user);
    await user.click(screen.getByRole('button', { name: 'Guardar paciente' }));
    await screen.findByRole('status');

    await user.type(screen.getByLabelText(/Buscar por documento/), '41222333');

    await waitFor(() => {
      expect(within(table()).getByText('Quiroga, Elena')).toBeInTheDocument();
    });
    expect(within(table()).getByText('41222333')).toBeInTheDocument();
  });

  test('rechaza un documento ya registrado', async () => {
    const { user } = renderWithProviders(<PatientDeskPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillDeskForm(user, '30114552');
    await user.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    expect(
      await screen.findByText('Ya existe una ficha con ese documento.'),
    ).toBeInTheDocument();
  });

  test('busca por apellido', async () => {
    const { user } = renderWithProviders(<PatientDeskPage />);

    await user.type(screen.getByLabelText(/Buscar por documento/), 'Ferreyra');

    // El seed tiene dos Ferreyra, así que son dos filas más la cabecera.
    await waitFor(() => {
      expect(within(table()).getAllByRole('row')).toHaveLength(3);
    });
    expect(
      within(table()).getByText('Ferreyra, Marta Elena'),
    ).toBeInTheDocument();
  });

  test('filtra por acceso al portal', async () => {
    const { user } = renderWithProviders(<PatientDeskPage />);
    await waitFor(() => {
      expect(within(table()).getAllByRole('row').length).toBeGreaterThan(1);
    });

    await user.selectOptions(
      screen.getByLabelText('Acceso al portal'),
      'active',
    );

    await waitFor(() => {
      expect(
        within(table()).queryByText('No registrado'),
      ).not.toBeInTheDocument();
    });
    expect(within(table()).getAllByText('Activo').length).toBeGreaterThan(0);
  });

  test('pagina de a diez', async () => {
    const { user } = renderWithProviders(<PatientDeskPage />);

    await waitFor(() => {
      expect(screen.getByText(/Página 1 de/)).toBeInTheDocument();
    });
    // Cabecera + 10 filas.
    expect(within(table()).getAllByRole('row')).toHaveLength(11);

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => {
      expect(screen.getByText(/Página 2 de/)).toBeInTheDocument();
    });
  });
});
