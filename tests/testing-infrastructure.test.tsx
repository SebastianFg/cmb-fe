import { useQueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { Link, useLocation } from 'react-router-dom';
import { envConfig } from '@/config/env-config';
import { renderWithProviders } from './test-utils';

const InfrastructureProbe = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const queryRetriesAreDisabled =
    queryClient.getDefaultOptions().queries?.retry === false;

  return (
    <main>
      <span>{envConfig.VITE_PUBLIC_ENVIRONMENT}</span>
      <span>
        {queryRetriesAreDisabled ? 'query-ready' : 'query-misconfigured'}
      </span>
      <span>{location.pathname}</span>
      <Link to="/verified">Verify router</Link>
    </main>
  );
};

test('renders with the shared test providers and deterministic environment', async () => {
  const { user } = renderWithProviders(<InfrastructureProbe />, {
    initialEntries: ['/smoke'],
  });

  expect(screen.getByText('test')).toBeInTheDocument();
  expect(screen.getByText('query-ready')).toBeInTheDocument();
  expect(screen.getByText('/smoke')).toBeInTheDocument();

  await user.click(screen.getByRole('link', { name: 'Verify router' }));

  expect(screen.getByText('/verified')).toBeInTheDocument();
});
