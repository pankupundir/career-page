import React, { useState, useRef } from "react";
import RecordRTC from "recordrtc";
import PlayArrow from "../../../public/Play.svg";
import PauseArrow from "../../../public/Pause.svg";
import ResetArrow from "../../../public/Reset.svg";
import Stop from "../../../public/Stop.svg";
import "./VideoRecorder.css";

const VideoRecorder = ({ onRecordingComplete }) => {
  const [recorder, setRecorder] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const timerRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      
      videoPreviewRef.current.srcObject = stream;
      videoPreviewRef.current.play();

      const newRecorder = new RecordRTC(stream, {
        type: "video",
        mimeType: "video/webm",
        bitsPerSecond: 128000,
      });

      newRecorder.startRecording();
      setRecorder(newRecorder);

      setElapsedSeconds(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= 29) stopRecording();
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing camera or microphone:", error);
      alert("Unable to access camera or microphone. Please ensure access is allowed.");
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
  
    if (recorder) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        onRecordingComplete(blob);
  
        // Stop camera feed in the video preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
          videoPreviewRef.current.src = URL.createObjectURL(blob);
          videoPreviewRef.current.controls = true;
          videoPreviewRef.current.play();
        }
      });
  
      // Stop all video and audio tracks to turn off the camera and microphone
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      // Reset state
      setVideoStream(null);
      setRecorder(null);
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  

  const pauseRecording = () => {
    if (isPaused) {
      recorder.resumeRecording();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      recorder.pauseRecording();
      clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };

  const resetRecording = () => {
    clearInterval(timerRef.current);
    setElapsedSeconds(0);
    setRecordedBlob(null);
    videoPreviewRef.current.srcObject = null;
    videoPreviewRef.current.src = "";
    videoPreviewRef.current.controls = false;
    setIsRecording(false);
    setIsPaused(false);
  };

  // const uploadVideo = async () => {
  //   if (recordedBlob) {
  //     const file = new File([recordedBlob], "recorded-video.webm", { type: "video/webm" });
  //     try {
  //       // Upload Recording
  //       const resumeResponse = await webSiteBuilderFormInstance.post(
  //         "/web/upload-file",
  //         {
  //           file: file,
  //         }
  //       );
        
  //     }
  //     catch(error) {
  //       console.log('error', error)
  //     }
  //   }
  // };

  return (
    <div className="video_portview">
      <h1>Record Video with Pause/Resume</h1>
      <div style={{ position: "relative", display: "inline-block" }} className="w-100">
        <video ref={videoPreviewRef} style={{ width: "320px", height: "140px" }} autoPlay muted></video>
        {isRecording && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              padding: "5px 10px",
              fontSize: "18px",
              borderRadius: "5px",
            }}
          >
            {elapsedSeconds}s
          </div>
        )}
      </div>

      {isRecording && elapsedSeconds >= 30 && (
        <div style={{ color: "red", fontSize: "14px", fontWeight: "bold", marginTop: "10px" }}>
          Recording will stop automatically after 30 seconds.
        </div>
      )}

      <div style={{ marginTop: "10px" }} className="custom_btn">
        {!isRecording && (
          // <button onClick={startRecording}>Start Recording</button>
          <img onClick={startRecording} src={PlayArrow} alt="arrow" className="" />
        )}

        {isRecording && (
          <>
            
            {/* <button onClick={stopRecording}>Stop Recording</button>
            <button onClick={pauseRecording}>{isPaused ? "Resume Recording" : "Pause Recording"}</button>
            <button onClick={resetRecording}>Reset</button>
             */}
            <img onClick={stopRecording} src={Stop} alt="arrow" className="" />   
            <img onClick={pauseRecording} src={isPaused ? PlayArrow : PauseArrow} alt="arrow" className="" />
            <img onClick={resetRecording} src={ResetArrow} alt="arrow" className="" />

          </>
        )}

        {/* {recordedBlob && (
          <button onClick={uploadVideo}>Upload Video</button>
        )} */}
      </div>
    </div>
  );
};

export default VideoRecorder;
