'use client';

import axios from 'axios';
import { useState, useRef } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Share() {
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);
  // const [audioChunks, setAudioChunks] = useState<any>([]);
  const [transcriptionResult, setTranscriptionResult] = useState<any>('');
  const [executionTime, setExecutionTime] = useState<any>('');

  const audioRef = useRef<any>();
  const chunks: any = [];

  console.log(chunks);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      mediaStream.getVideoTracks().forEach((track) => track.stop());

      const recorder = new MediaRecorder(mediaStream);
      setMediaRecorder(recorder);
      recorder.start();

      recorder.ondataavailable = (event) => {
        // setAudioChunks([...audioChunks, event.data]);
        chunks.push(event.data);
        // console.log(event);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // setAudioChunks([]);
        console.log(audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;

        const formData = new FormData();
        formData.append('file', audioBlob, 'screen_audio.webm');

        try {
          const res = await axios.post(`${BASE_URL}/transcribe/`, formData);
          console.log(res);
          const { status, data } = res;
          if (status === 200) {
            setTranscriptionResult(data.text);
            setExecutionTime(data.execution_time_seconds);
          } else {
            throw new Error('something was wrong!');
          }
        } catch (err) {
          console.error(err);
        }
      };
    } catch (err) {
      console.error('Error sharing screen or recording:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.stop();
  };

  return (
    <div>
      <button className='bg-blue-500' onClick={startRecording}>
        Share Screen and Start Recording
      </button>
      <button className='bg-red-500' onClick={stopRecording}>
        Stop Recording
      </button>
      <audio controls ref={audioRef} />
      <p>{transcriptionResult}</p>
      <p>{executionTime}</p>
    </div>
  );
}
