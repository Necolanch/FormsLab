import React, { PropsWithChildren } from 'react';

export default function AuthFormWrapper({ children }: PropsWithChildren) {
  return (
    <section className="mx-auto flex flex-col items-center justify-center lg:mt-6">
      <div className="mt-4 w-full rounded-lg bg-white/30 p-6 shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md">
        {children}
      </div>
    </section>
  );
}
