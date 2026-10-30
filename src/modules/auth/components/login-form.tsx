import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import DemoAccountsDisclosure from '@/modules/auth/components/demo-accounts-disclosure';
import GoogleButton from '@/modules/auth/components/google-button';
import RecaptchaField from '@/modules/auth/components/recaptcha-field';
import { useCredentialsLogin } from '@/modules/auth/hooks/use-credentials-login';
import {
  type LoginFormValues,
  loginDefaultValues,
  loginSchema,
} from '@/modules/auth/schemas/login.schema';
import {
  isSanctumAuthMode,
  startGoogleLogin,
} from '@/modules/auth/services/auth.service';
import Button from '@/shared/components/button/button';
import CheckboxField from '@/shared/components/input/checkbox-field';
import TextField from '@/shared/components/input/text-field';

const LoginForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRedirectingToGoogle, setIsRedirectingToGoogle] = useState(false);
  const { error, isSigningIn, signIn } = useCredentialsLogin();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleLogin = () => {
    setIsRedirectingToGoogle(true);
    startGoogleLogin();
  };

  return (
    <div className="w-full max-w-[456px]">
      <h1 className="text-[30px] font-bold leading-tight text-ink dark:text-white">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft dark:text-sidebar-ink">
        Ingresá con tu cuenta del centro.
      </p>

      <form
        className="mt-7"
        noValidate
        onSubmit={handleSubmit((values) => signIn(values))}
      >
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          className="min-h-[52px] px-4 text-[1.05rem]"
          control={control}
          name="email"
        />

        <div className="mt-6">
          <TextField
            label="Contraseña"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            className="min-h-[52px] px-4 text-[1.05rem]"
            trailing={
              <button
                type="button"
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                className="text-[15px] text-accent transition-colors hover:text-accent-dark focus-visible:underline focus-visible:outline-none dark:text-sidebar-ink"
              >
                {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
              </button>
            }
            control={control}
            name="password"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <CheckboxField
            control={control}
            name="keepSession"
            label="Mantener la sesión"
            fieldClassName="text-[14px]"
          />

          <Link
            to="/recuperar-contrasena"
            className="text-[14px] text-accent transition-colors hover:text-accent-dark hover:underline dark:text-sidebar-ink"
          >
            Olvidé mi contraseña
          </Link>
        </div>

        <div className="mt-6">
          <RecaptchaField control={control} name="notARobot" />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {error instanceof Error
              ? error.message
              : 'No se pudo iniciar sesión.'}
          </p>
        )}

        <div className="mt-6">
          <Button
            block
            className="min-h-[54px] text-[1.1rem]"
            isLoading={isSigningIn}
            type="submit"
            variant="primary"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line dark:bg-sidebar-soft" />
        <span className="text-[13px] text-ink-muted">o</span>
        <span className="h-px flex-1 bg-line dark:bg-sidebar-soft" />
      </div>

      <div className="mt-6">
        <GoogleButton
          disabled={isRedirectingToGoogle}
          onClick={handleGoogleLogin}
        />
      </div>

      <p className="mt-6 text-center text-[15px] text-ink-soft dark:text-sidebar-ink">
        ¿No tenés cuenta?{' '}
        <Link
          to="/registro"
          className="font-bold text-accent transition-colors hover:text-accent-dark hover:underline dark:text-sidebar-ink"
        >
          Registrarme
        </Link>
      </p>

      <p className="mx-auto mt-5 max-w-[410px] text-center text-[13px] leading-[22px] text-ink-muted">
        Este formulario está protegido por reCAPTCHA. El acceso queda registrado
        en la auditoría.
      </p>

      {!isSanctumAuthMode() && (
        <div className="mt-5">
          <DemoAccountsDisclosure />
        </div>
      )}
    </div>
  );
};

export default LoginForm;
