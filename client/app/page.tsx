'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timestamps, setTimestamps] = useState<
    { startTime: number; endTime: number; sentence: string }[]
  >([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const options = {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm; codecs=opus',
      };

      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/wav';
      }

      setMediaRecorder(new MediaRecorder(stream, options));
    });
  }, []);

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.addEventListener('dataavailable', (event) => {
        setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);
      });
    }
  }, [mediaRecorder]);

  const startRecording = () => {
    setAudioChunks([]);
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = () => {
    const audioBlob = new Blob(audioChunks, {
      type: 'audio/webm; codecs=opus',
    });
    const formData = new FormData();
    formData.append('audio', audioBlob);

    fetch('http://localhost:3000/transcribe', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // Assume the response is a JSON object containing stdout
        // which is a string of sentences with timestamps
        const stdout = data.stdout;
        const transcription = data.transcription;

        // Split stdout into an array of sentences
        const sentences = stdout.split('\n');

        // Parse each sentence to extract the timestamp and text
        const timestamps = [];
        for (let sentence of sentences) {
          const match = sentence.match(
            /\[([0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}) --> ([0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3})\]\s*(.*)/
          );
          if (match) {
            const startTime = match[1];
            const endTime = match[2];
            const text = match[3].trim();
            timestamps.push({
              startTime: startTime,
              endTime: endTime,
              sentence: text,
            });
          }
        }

        // Update state with parsed timestamps and sentences
        setTimestamps(timestamps);
        console.log('timestamps:', timestamps);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="flex w-screen h-screen flex-col items-center justify-between p-24 bg-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:bg-red-600 disabled:cursor-not-allowed"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
        >
          Stop Recording
        </button>
        <button
          onClick={transcribeAudio}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled"
        >
          Transcribe Audio
        </button>
      </div>
      <div className="flex w-[1080px] h-[720px]">
        <Canvas
          className="w-1/2"
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [-4, 3, 6],
          }}
        >
          <Experience />
        </Canvas>
        <div className="w-1/2 flex flex-col justify-center items-start text-white space-y-4 p-8">
          <h2 className="text-5xl font-semibold">
            Reflect like Marcus Aurelius
          </h2>
          <p className="text-2xl">Your daily audio mood journal.</p>
          <Link href="/journal">
            <button className="text-lg bg-blue-500 px-3 py-2 rounded-xl">
              Enter journal
            </button>
          </Link>
        </div>
      </div>
      <div className="text-5xl text-white font-extrabold flex flex-col items-center gap-2">
        {timestamps.map((item, index) => (
          <p key={index}>{item.sentence}</p>
        ))}
      </div>
    </div>
  );
}
