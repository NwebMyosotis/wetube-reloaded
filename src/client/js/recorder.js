import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop); // innerText 변경을 addEventListener와 removeEventListener를 활용해 구현함.
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    //dataavailable은 녹화가 멈추면 발생하는 이벤트임 , on 뒤에 이벤트명이 오는 건 addEventListener와 유사함. 즉, 이벤트 리스너를 만드는 것.
    videoFile = URL.createObjectURL(event.data); // 브라우저가 메모리에 저장한 url을 우리에게 전달함. (파일에 접근할 수 있게 해줌)(이 url은 백엔드에 존재x)
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const handleDownload = () => {
  //자체적인 기능보다는 anchor 태그와 그에 속한 download 속성을 응용, click 트리거가 작동하도록 해 구현함.
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "myVideo.webm";
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    //MediaDevices는 마이크, 카메라와 같은 미디어 장비들에 접근하게 함.
    audio: false,
    video: true, //getUserMedia로 audio는 받지 않고 video만 받아오게 만들었음.
  });
  video.srcObject = stream;
  //stream: 우리가 어딘가에 넣어둘 0과 1로 이루어진 데이터를 의미, 여기서는 video 엘리먼트에 stream을 넣음. (srcObject 사용)
  //MediaElement.srcObject: 미디어 소스 역할을 하는 데이터를 설정 및 반환함.
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
