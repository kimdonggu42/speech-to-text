'use client';

import { useRouter } from 'next/navigation';

const category = [{ path: 'upload' }, { path: 'record' }, { path: 'share' }];

export default function Home() {
  const router = useRouter();

  return (
    <main className='flex h-screen items-center justify-center'>
      <ul className='flex w-[300px] flex-col gap-y-[20px] text-[30px]'>
        {category.map((value, index) => {
          return (
            <li
              key={index}
              className='cursor-pointer bg-teal-900 text-center text-white'
              onClick={() => router.push(`/${value.path}`)}
            >
              {value.path} page
            </li>
          );
        })}
      </ul>
    </main>
  );
}
