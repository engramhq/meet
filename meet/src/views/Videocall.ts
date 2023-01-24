import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { Div } from '../../../ui/components/Div';
import { Video } from '../../../ui/components/Video';
const socket = io();

const getUserMedia =
  navigator?.mediaDevices?.getUserMedia ||
  (navigator as any).getUserMedia ||
  (navigator as any).webkitGetUserMedia ||
  (navigator as any).mozGetUserMedia;

export function Videocall() {
  const roomId = window.location.pathname.split('/')[1];

  const myPeer = new Peer();
  myPeer.on('open', (id) => {
    socket.emit('join-room', roomId, id);
    console.log('id', id);
  });

  socket.on('user-connected', (userId) => {
    console.log('User conncted ', userId);
  });

  const el = Div({
    styles: {
      height: '100vh',
      // display: 'grid',
      // gridTemplateColumns: 'repeat(auto-fit, minmax(50%, 1fr))',
      // gridTemplateRows: 'repeat(auto-fit, minmax(50%, 1fr))',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
  });

  const myVideo = Video({
    muted: true,
    styles: {
      height: '100%',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '400px',
    },
  });

  getUserMedia({
    video: true,
    audio: true,
  }).then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', (call) => {
      call.answer(stream);
      const video = Video({
        styles: {
          height: '100%',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '400px',
        },
      });
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    el.append(video);
  }

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream); // call and send our video stream
    const otherUserVideo = Video({
      styles: {
        height: '100%',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '400px',
      },
    });
    call.on('stream', (userVideoStream) => {
      addVideoStream(otherUserVideo, userVideoStream);
    });
    call.on('close', () => {
      otherUserVideo.remove();
    });
  }

  return el;
}