import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type RenderOptions,
  type RenderResult,
  render,
} from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { PropsWithChildren, ReactElement } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  initialEntries?: NonNullable<MemoryRouterProps['initialEntries']>;
  queryClient?: QueryClient;
};

type RenderWithProvidersResult = RenderResult & {
  queryClient: QueryClient;
  user: UserEvent;
};

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: Number.POSITIVE_INFINITY,
        retry: false,
        retryDelay: 0,
      },
    },
  });

export const createRetryTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Number.POSITIVE_INFINITY,
        retry: 2,
        retryDelay: 0,
      },
    },
  });

export const createAxiosError = (status?: number): AxiosError => {
  if (status === undefined) return new AxiosError('Network Error');

  const response: AxiosResponse = {
    config: { headers: new axios.AxiosHeaders() },
    data: {},
    headers: {},
    status,
    statusText: String(status),
  };
  return new AxiosError(
    `Request failed with status code ${status}`,
    undefined,
    undefined,
    undefined,
    response,
  );
};

type ProvidersProps = PropsWithChildren<{
  initialEntries: NonNullable<MemoryRouterProps['initialEntries']>;
  queryClient: QueryClient;
}>;

const Providers = ({
  children,
  initialEntries,
  queryClient,
}: ProvidersProps): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  </QueryClientProvider>
);

/** Wrapper para `renderHook`: mismas dependencias que `renderWithProviders`. */
export const createWrapper = ({
  initialEntries = ['/'],
  queryClient = createTestQueryClient(),
}: {
  initialEntries?: NonNullable<MemoryRouterProps['initialEntries']>;
  queryClient?: QueryClient;
} = {}) => {
  return ({ children }: PropsWithChildren) => (
    <Providers initialEntries={initialEntries} queryClient={queryClient}>
      {children}
    </Providers>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <Providers initialEntries={initialEntries} queryClient={queryClient}>
      {children}
    </Providers>
  );

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    queryClient,
    user: userEvent.setup({ delay: null }),
  };
};
