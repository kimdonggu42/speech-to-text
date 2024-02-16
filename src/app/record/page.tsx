'use client';

import axios from 'axios';
import { useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function AudioRecord() {
  const [stream, setStream] = useState<any>();
  const [media, setMedia] = useState<any>();
  const [onRec, setOnRec] = useState<any>(false);
  const [source, setSource] = useState<any>();
  const [analyser, setAnalyser] = useState<any>();
  const [audioUrl, setAudioUrl] = useState<any>();

  const [text, setText] = useState<string>('');

  const onRecAudio = () => {
    const audioCtx = new window.AudioContext();
    const analyser = audioCtx.createScriptProcessor(0, 1, 1);
    setAnalyser(analyser);

    const makeSound = (stream: any) => {
      const source = audioCtx.createMediaStreamSource(stream);
      setSource(source);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    };

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      setStream(stream);
      setMedia(mediaRecorder);
      makeSound(stream);

      analyser.onaudioprocess = (e: any) => {
        setAudioUrl(e.data);
        setOnRec(true);
      };
    });
  };

  const offRecAudio = () => {
    media.ondataavailable = (e: any) => {
      setAudioUrl(e.data);
      setOnRec(false);
    };

    stream.getAudioTracks().forEach((track: any) => {
      track.stop();
    });

    media.stop();
    analyser.disconnect();
    source.disconnect();
  };

  const onSubmitAudioFile = async (e: any) => {
    e.preventDefault();

    const recordFile = new File([audioUrl], 'audio.mp3', {
      type: 'audio/mpeg',
    });
    const formData = new FormData();
    formData.append('audio_file', recordFile);

    console.log(URL.createObjectURL(audioUrl));
    console.log(recordFile);

    try {
      const res = await axios.post(`${BASE_URL}/transcribe/`, formData);
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
      <form className='flex gap-x-[20px]' onSubmit={onSubmitAudioFile}>
        {onRec ? (
          <button type='button' className='bg-blue-500' onClick={offRecAudio}>
            녹음 종료
          </button>
        ) : (
          <button type='button' className='bg-red-500' onClick={onRecAudio}>
            녹음 시작
          </button>
        )}
        <button className='bg-teal-900 text-white' type='submit'>
          녹음 파일 변환
        </button>
      </form>
      <div>{text}</div>
    </div>
  );
}

export default AudioRecord;
