
import { useRef, useState, useEffect, useCallback } from "react";
  import Webcam from 'react-webcam'
  import * as faceapi from 'face-api.js';

const UserRegister = () => {
    const [faceDetected, setFaceDetected] = useState(false);
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [msg,setMsg] = useState(null);

    useEffect(() => {
          const loadModelsAndStartCapture = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
          };
      
          loadModelsAndStartCapture();
        }, []);

        const detectFaces = useCallback(async () => {
                const detections = await faceapi.detectAllFaces(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
                console.log(detections)
                if (detections && detections.length === 1) {
                  //console.log(detections)
                  const imageSrc = webcamRef.current.getScreenshot();
                  
                  return true;
                } else {
                  setFaceDetected(false);
                  setImgSrc(null);
                  return false;
                }
              },[webcamRef]);
    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        const flag = await detectFaces();
        if(flag){
        setImgSrc(imageSrc);
        setMsg("Please proceed Ahead")
        }
        else{
          setMsg("No faces has been detected please re-capture your picture")
        }
      }, [detectFaces]);
      const retake = () => {
        setImgSrc(null);
      };    
  return (
    <div className="container">
      <div className="verifyMobile">
        <input text></input>
      </div>
      {imgSrc ? (
        <img src={imgSrc} alt="webcam" />
      ) : (
        <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ zIndex: 0 }}
              />
      )}
      <div className="btn-container">
        {imgSrc ? (
          <button onClick={retake}>Retake photo</button>
        ) : (
          <button onClick={capture}>Capture photo</button>
        )}
      </div>
      <p>{msg}</p>
    </div>
  )
}
export default UserRegister