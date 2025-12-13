import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-600">
          Fleet Management System
        </h1>

        <p className="mt-3 text-2xl">
          Comprehensive solution for managing your fleet operations.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link href="/login" className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Login &rarr;</h3>
            <p className="mt-4 text-xl">
              Access your account to manage your fleet.
            </p>
          </Link>

          <Link href="/dashboard" className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Dashboard &rarr;</h3>
            <p className="mt-4 text-xl">
              Go directly to the dashboard (for demo purposes).
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
