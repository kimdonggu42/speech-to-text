'use client';

import axios from 'axios';
import { useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  const [text, setText] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number>(0);

  const uploadFile = async (e: any) => {
    e.preventDefault();
    const mp3File = e.target.files[0];
    const formData = new FormData();
    formData.append('file', mp3File);
    console.log(mp3File);
    try {
      const res = await axios.post(`${BASE_URL}/transcribe/`, formData);
      console.log(res);
      const { status, data } = res;
      if (status === 200) {
        setText(data.text);
        setExecutionTime(data.execution_time_seconds);
      } else {
        throw new Error('something was wrong!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main>
      <form>
        <input className='border border-solid border-black' type='file' onChange={uploadFile} />
      </form>
      <div>
        <div>{text}</div>
        <div>{executionTime}</div>
      </div>
    </main>
  );
}
