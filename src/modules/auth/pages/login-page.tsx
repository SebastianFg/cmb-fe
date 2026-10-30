import BrandPanel from '@/modules/auth/components/brand-panel';
import LoginForm from '@/modules/auth/components/login-form';

const LoginPage = () => (
  <div className="flex min-h-screen flex-col bg-surface lg:flex-row dark:bg-sidebar">
    <BrandPanel />

    <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-10">
      <LoginForm />
    </main>
  </div>
);

export default LoginPage;
