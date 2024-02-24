'use client';

import axios from 'axios';
import { useState, useRef } from 'react';

// getDisplayMedia의 option에서 video의 기본값은 true, audio의 기본값은 false
const constraints = { audio: true };

export default function Share() {
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [text, setText] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeechToTextProcessing, setIsSpeechToTextProcessing] = useState<boolean>(false);

  const audioRef = useRef<any>();
  const chunks: any = [];

  const onRecordingStart = async () => {
    setIsRecording(true);
    try {
      if (navigator.mediaDevices) {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
        // mediaStream.getVideoTracks().forEach((track) => track.stop());
        const newMediaRecorder = new MediaRecorder(mediaStream);
        setMediaRecorder(newMediaRecorder);

        newMediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        newMediaRecorder.onstop = async () => {
          const newBlob = new Blob(chunks, { type: 'audio/*' });
          chunks.splice(0);

          const audioUrl = URL.createObjectURL(newBlob);
          audioRef.current.src = audioUrl;

          const newFormData = new FormData();
          newFormData.append('file', newBlob);
          setFormData(newFormData);
        };

        newMediaRecorder.start();
      }
    } catch (err: any) {
      alert(err.message);
      setIsRecording(false);
    }
  };

  const onRecordingStop = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const submitAndTranscribeAudio = async () => {
    setIsSpeechToTextProcessing(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/transcribe/`, formData);
      const { status, data } = res;
      if (status === 200) {
        setText(data.text);
        setExecutionTime(data.execution_time_seconds);
        setIsSpeechToTextProcessing(false);
      }
    } catch (err: any) {
      alert(err.message);
      setIsSpeechToTextProcessing(false);
    }
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex flex-col gap-y-[50px] text-[15px]'>
        <div className='flex gap-x-[20px]'>
          {isRecording ? (
            <button className='bg-blue-500' onClick={onRecordingStop}>
              화면 공유 및 녹음 종료
            </button>
          ) : (
            <button className='bg-red-500' onClick={onRecordingStart}>
              화면 공유 및 녹음 시작
            </button>
          )}
          <button className='bg-teal-900 text-white' onClick={submitAndTranscribeAudio}>
            녹음 파일 변환
          </button>
          <audio controls ref={audioRef} />
        </div>
        {isSpeechToTextProcessing ? (
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
