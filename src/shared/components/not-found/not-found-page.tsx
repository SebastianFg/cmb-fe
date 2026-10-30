import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotFoundPageProps = {
  redirectTo?: string;
  buttonLabel?: string;
};

const NotFoundPage = ({
  redirectTo = '/',
  buttonLabel = 'Volver al inicio',
}: NotFoundPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-50 px-6 py-10 text-center dark:bg-gray-900">
      <img
        src="/images/404.webp"
        alt="404 Illustration"
        className="rounded-md shadow-lg w-80 max-w-full mb-8"
        loading="lazy"
      />

      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
        Página no encontrada
      </h1>

      <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-md">
        Ups... parece que la página que buscas no existe, fue movida o ya no
        está disponible.
      </p>

      <button
        onClick={() => navigate(redirectTo)}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <Home className="h-4 w-4" />
        {buttonLabel}
      </button>
    </div>
  );
};

export default NotFoundPage;
