'use client';

import axios from 'axios';
import { useState, useRef } from 'react';

export default function AudioRecord() {
  const [stream, setStream] = useState<any>();
  // const [media, setMedia] = useState<any>();
  const [onRec, setOnRec] = useState<any>(false);
  const [source, setSource] = useState<any>();
  const [analyser, setAnalyser] = useState<any>();
  const [audioUrl, setAudioUrl] = useState<any>();
  const [text, setText] = useState<string>('');

  const [mediaRecorder, setMediaRecorder] = useState<any>(null);

  const audioRef = useRef<any>();
  const audioChunks: any = [];

  const onRecAudio = async () => {
    // const audioCtx = new window.AudioContext();
    // const analyser = audioCtx.createScriptProcessor(0, 1, 1);
    // setAnalyser(analyser);

    // const makeSound = (stream: any) => {
    //   const source = audioCtx.createMediaStreamSource(stream);
    //   setSource(source);
    //   source.connect(analyser);
    //   analyser.connect(audioCtx.destination);
    // };

    try {
      // 마이크 mediaStream 생성, Promise를 반환
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // MediaRecorder 생성, 마이크 mediaStream을 인자로 전달
      const createMediaRecorder = new MediaRecorder(mediaStream);
      setMediaRecorder(createMediaRecorder);

      // 이벤트 핸들러, 녹음 데이터 취득 처리
      createMediaRecorder.ondataavailable = (e: any) => {
        audioChunks.push(e.data);
      };

      // 이벤트 핸들러, 녹음 종료 처리
      createMediaRecorder.onstop = () => {
        // 녹음이 종료되면, 배열에 담긴 오디오 데이터(Blob)들을 합침 + 코덱 설정
        const audioBlob = new Blob(audioChunks, { type: 'audio/ogg codecs=opus' });
        audioChunks.splice(0); // 기존 오디오 데이터 초기화

        // Blob 데이터에 접근할 수 있는 객체 URL을 생성
        const audioBlobURL = window.URL.createObjectURL(audioBlob);
        audioRef.current.src = audioBlobURL;
      };

      createMediaRecorder.start();
    } catch (error) {
      console.error('마이크 사용을 허용해주세요.');
    }
  };

  const offRecAudio = () => {
    mediaRecorder.stop();
  };

  const onSubmitAudioFile = async () => {
    const recordFile = new File([audioUrl], 'audio.mp3', {
      type: 'audio/mpeg',
    });
    const formData = new FormData();
    formData.append('audio_file', recordFile);

    console.log(URL.createObjectURL(audioUrl));
    console.log(recordFile);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/transcribe/`, formData);
      console.log(res);
      const { status, data } = res;
      if (status === 200) {
        console.log(data);
        setText(data.text);
      } else {
        throw new Error('something was wrong!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className='flex gap-x-[20px]'>
        <button type='button' className='bg-red-500' onClick={onRecAudio}>
          녹음 시작
        </button>

        <button type='button' className='bg-blue-500' onClick={offRecAudio}>
          녹음 종료
        </button>

        <button className='bg-teal-900 text-white' onClick={onSubmitAudioFile}>
          녹음 파일 변환
        </button>
      </div>
      <audio controls ref={audioRef} />
      <div>{text}</div>
    </div>
  );
}
