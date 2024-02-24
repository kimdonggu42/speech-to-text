'use client';

import axios from 'axios';
import { useState, useRef } from 'react';

const constraints = { audio: true };

export default function Record() {
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
        // 미디어 스트림 생성 후 생성 한 마이크 미디어 스트림을 인자로 전달하여 MediaRecorder 객체 생성
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints); // 마이크(오디오 트랙) 접근 권한 요청
        const newMediaRecorder = new MediaRecorder(mediaStream);
        setMediaRecorder(newMediaRecorder);

        // 오디오 데이터(Blob)가 들어올 때마다 오디오 데이터 조각들을 chunks 배열에 담는 이벤트 핸들러 등록
        newMediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        // 녹음 종료 시 배열에 담긴 오디오 데이터(Blob)들을 합치는 이벤트 핸들러 등록 + 코덱 설정
        newMediaRecorder.onstop = async () => {
          const newBlob = new Blob(chunks, { type: 'audio/*' });
          chunks.splice(0); // 통합 Blob 객체를 생성한 후 기존 오디오 데이터 배열 초기화

          const audioURL = URL.createObjectURL(newBlob); // Blob 데이터에 접근할 수 있는 객체 URL을 생성
          audioRef.current.src = audioURL;

          const newFormData = new FormData();
          newFormData.append('file', newBlob);
          setFormData(newFormData);
        };

        newMediaRecorder.start(); // 녹음 시작
      }
    } catch (err: any) {
      alert(err.message);
      setIsRecording(false);
    }
  };

  const onRecordingStop = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach((track: any) => track.stop()); // 미디어 스트림 중지(마이크 끄기)
      mediaRecorder.stop(); // 녹음 중지
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
              녹음 종료
            </button>
          ) : (
            <button className='bg-red-500' onClick={onRecordingStart}>
              녹음 시작
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
