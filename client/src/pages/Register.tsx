import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Step 1: Register the user
      await authService.register(email, password);
      
      // Step 2: Automatically log in after successful registration
      const { accessToken } = await authService.login(email, password);
      
      // Store accessToken in memory (could use context/state management)
      sessionStorage.setItem('accessToken', accessToken);
      
      // Step 3: Redirect to dashboard
      navigate('/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]">description</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">DocIndex</h2>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <a
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            href="#"
          >
            Documentation
          </a>
          <a
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            href="#"
          >
            Support
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#15202b] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/5 text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
              Create an account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Get started with DocIndex today.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="fullname">
                Full name
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3 transition-colors placeholder:text-slate-400"
                  id="fullname"
                  name="fullname"
                  placeholder="John Doe"
                  required
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                Work email
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3 transition-colors placeholder:text-slate-400"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3 transition-colors placeholder:text-slate-400"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  required
                  type="password"
                />
              </div>
            </div>

            <button
              className="flex w-full justify-center items-center rounded-lg bg-primary mt-2 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="relative mt-8">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#15202b] px-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
              href="#"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M12.0003 20.45C16.667 20.45 20.5843 17.275 22.0153 12.9833H12.0003V12.9833H12.0003V9.55005H22.7843C22.9033 10.3667 22.9673 11.2 22.9673 12.05C22.9673 18.0667 18.0673 23 12.0003 23C5.93333 23 1.00033 18.0667 1.00033 12C1.00033 5.93338 5.93333 1.00005 12.0003 1.00005C14.7333 1.00005 17.1673 1.90005 19.1003 3.36672L16.4843 5.98338C15.5343 5.23338 14.0003 4.53338 12.0003 4.53338C8.01733 4.53338 4.65033 7.63338 4.65033 12C4.65033 16.3667 8.01733 19.4667 12.0003 19.4667V20.45Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-xs sm:text-sm">Google</span>
            </a>
            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
              href="#"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-[#0d141b] dark:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  fillRule="evenodd"
                />
              </svg>
              <span className="text-xs sm:text-sm">GitHub</span>
            </a>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?
            <Link className="font-semibold text-primary hover:text-primary/80 transition-colors ml-1" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© 2024 DocIndex Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
