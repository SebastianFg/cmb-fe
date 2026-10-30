import { screen, waitFor, within } from '@testing-library/react';
import { resetPrototypeStore } from '@/prototype/prototype-store';
import { renderWithProviders } from '../../../../tests/test-utils';
import PatientRegistrationPage from './patient-registration-page';

type User = ReturnType<typeof renderWithProviders>['user'];

const VALID = {
  last_name: 'Quiroga',
  first_name: 'Elena',
  document_number: '41222333',
  birth_date: '1990-04-12',
  phone: '1154001122',
  email: 'elena.quiroga@correo.com',
  member_number: '7788-0011',
  password: 'turnos2026',
};

const fillForm = async (user: User, overrides: Partial<typeof VALID> = {}) => {
  const values = { ...VALID, ...overrides };

  await user.type(screen.getByLabelText(/^Apellido/), values.last_name);
  await user.type(screen.getByLabelText(/^Nombre/), values.first_name);
  await user.type(
    screen.getByLabelText(/^Número de documento/),
    values.document_number,
  );
  await user.type(
    screen.getByLabelText(/^Fecha de nacimiento/),
    values.birth_date,
  );
  await user.selectOptions(screen.getByLabelText(/^Nacionalidad/), '1');
  await user.type(screen.getByLabelText(/^Teléfono/), values.phone);
  await user.type(screen.getByLabelText(/^Correo electrónico/), values.email);
  await user.selectOptions(screen.getByLabelText(/^Obra social/), '2');
  await user.type(
    screen.getByLabelText(/^Número de afiliado/),
    values.member_number,
  );
  await user.type(screen.getByLabelText(/^Contraseña/), values.password);
  await user.type(
    screen.getByLabelText(/^Repetir contraseña/),
    values.password,
  );
  await user.click(screen.getByLabelText(/Acepto que el centro/));
};

const submit = (user: User) =>
  user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

describe('patient registration page', () => {
  beforeEach(() => {
    resetPrototypeStore();
  });

  test('renders the three sections of the form and the portal access block', async () => {
    renderWithProviders(<PatientRegistrationPage />);

    expect(
      screen.getByRole('heading', { name: 'Crear tu cuenta' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Datos personales')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
    expect(screen.getByText('Cobertura')).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: 'Argentina' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: 'OSDE 210' }),
    ).toBeInTheDocument();
  });

  test('starts with every checklist row pending', () => {
    renderWithProviders(<PatientRegistrationPage />);

    expect(screen.getAllByText('Pendiente')).toHaveLength(7);
  });

  test('blocks an empty submission and reports the missing fields', async () => {
    const { user } = renderWithProviders(<PatientRegistrationPage />);

    await submit(user);

    expect(
      await screen.findByText('Ingresá el número de documento.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ingresá el apellido.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tenés que aceptar el uso de tus datos para gestionar turnos.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Cuenta creada' }),
    ).not.toBeInTheDocument();
  });

  test('creates the account and confirms it', async () => {
    const { user } = renderWithProviders(<PatientRegistrationPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillForm(user);
    await submit(user);

    const confirmation = await screen.findByRole('status');
    expect(confirmation).toHaveTextContent('Listo, Elena.');
    expect(confirmation).toHaveTextContent(VALID.email);
    expect(
      within(confirmation).getByRole('link', { name: 'iniciar sesión' }),
    ).toHaveAttribute('href', '/login');
  });

  test('rejects a document that already has a file', async () => {
    const { user } = renderWithProviders(<PatientRegistrationPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillForm(user, { document_number: '30114552' });
    await submit(user);

    expect(
      await screen.findByText('Ya existe una ficha con ese documento.'),
    ).toBeInTheDocument();
  });

  test('rejects an email that already belongs to another patient', async () => {
    const { user } = renderWithProviders(<PatientRegistrationPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillForm(user, { email: 'marta.ferreyra@correo.com' });
    await submit(user);

    expect(
      await screen.findByText('Ese correo ya está registrado.'),
    ).toBeInTheDocument();
  });

  test('rejects an email already used by a staff account', async () => {
    const { user } = renderWithProviders(<PatientRegistrationPage />);
    await screen.findByRole('option', { name: 'Argentina' });

    await fillForm(user, { email: 'admin@cmbelgrano.com.ar' });
    await submit(user);

    expect(
      await screen.findByText('Ese correo ya está registrado.'),
    ).toBeInTheDocument();
  });

  test('reveals both password fields together', async () => {
    const { user } = renderWithProviders(<PatientRegistrationPage />);

    const password = screen.getByLabelText(/^Contraseña/);
    const confirmation = screen.getByLabelText(/^Repetir contraseña/);
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByLabelText('Mostrar contraseña'));

    await waitFor(() => {
      expect(password).toHaveAttribute('type', 'text');
    });
    expect(confirmation).toHaveAttribute('type', 'text');
  });
});
