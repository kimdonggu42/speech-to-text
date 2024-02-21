'use client';

import axios from 'axios';
import { useState, useRef } from 'react';

export default function Upload() {
  const [audioFile, setAudioFile] = useState<FormData | null>(null);
  const [audioFilePathName, setAudioFilePathName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && fileInputRef.current?.value !== undefined) {
      const mp3File = e.target.files[0];
      const formData = new FormData();
      formData.append('file', mp3File);
      setAudioFilePathName(fileInputRef.current?.value);
      setAudioFile(formData);
    }
  };

  const translate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (audioFile) {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/transcribe/`, audioFile);
        const { status, data } = res;
        if (status === 200) {
          setText(data.text);
          setExecutionTime(data.execution_time_seconds);
          setIsLoading(false);
        }
      } else {
        alert('오디오 파일을 업로드해주세요.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex flex-col gap-y-[50px] text-[15px]'>
        <form className='flex h-[30px] gap-x-[10px]' onSubmit={translate}>
          <input
            className='w-[300px] border border-solid border-black px-[5px]'
            placeholder={audioFilePathName}
            disabled
          />
          <input className='hidden' type='file' onChange={uploadFile} ref={fileInputRef} />
          <button
            className='bg-teal-900 px-[5px] text-white'
            type='button'
            onClick={handleUploadButtonClick}
          >
            오디오 파일 업로드
          </button>
          <button className='bg-[#2DD4BF] px-[5px] text-white' type='submit'>
            텍스트 추출
          </button>
        </form>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className='flex flex-col gap-y-[10px]'>
            <div>추출한 텍스트: {text}</div>
            <div>실행 시간: {executionTime}</div>
          </div>
        )}
      </div>
    </div>
  );
}
