import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { Div, Button, Video } from '../ui/components';
import { byId } from '../utils/DomUtils';
import { setURL } from '../utils/HistoryUtils';
import {
  microphoneIcon,
  microphoneSlashIcon,
  phoneIcon,
} from '../utils/FontAwesomeIcons';
const socket = io();

const getUserMedia =
  navigator?.mediaDevices?.getUserMedia ||
  (navigator as any).getUserMedia ||
  (navigator as any).webkitGetUserMedia ||
  (navigator as any).mozGetUserMedia;

const styles = {
  height: '100%',
  width: '100%',
  objectFit: 'cover',
  borderRadius: '8px',
  padding: '4px',
  transform: 'rotateY(180deg)',
  '-webkit-transform': 'rotateY(180deg)',
  '-moz-transform': 'rotateY(180deg)',
};

const buttonStyles = {
  height: '40px',
  width: '40px',
  backgroundColor: '#c7c7c7',
  border: '1px solid #c7c7c7',
  borderRadius: '50%',
  fontSize: '18px',
  color: '#fff',
  cursor: 'pointer',
};

const peers: any = [];

export function Videocall() {
  const roomId = window.location.pathname.split('/')[1];
  const myPeer = new Peer();
  let myVideoId = '';
  let myStream: any = null;

  myPeer.on('open', (id) => {
    const video = document.getElementsByTagName('video')?.[0];
    myVideoId = id;
    video.id = myVideoId;
    socket.emit('join-room', roomId, myVideoId);
  });

  const container = Div();
  const el = Div({
    styles: {
      height: '100%',
      padding: '8px',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'center',
    },
  });

  const myVideo = Video({
    muted: true,
    styles,
  });

  getUserMedia({
    video: true,
    audio: true,
  }).then((stream) => {
    addVideoStream(myVideo, stream);

    myStream = stream;
    myPeer.on('call', (call) => {
      peers.push({ userId: call });
      call.answer(stream);
      const video = Video({ styles });
      video.id = call.peer;
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      setTimeout(connectToNewUser, 1000, userId, stream);
    });
  });

  socket.on('user-disconnected', (userId) => {
    const userToDisconnect = peers.find((peer) => peer.userId?.peer === userId);
    userToDisconnect?.userId.close();
    const videoRemoved = byId(userToDisconnect.userId.peer);
    videoRemoved?.remove();
  });

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });

    if (el.children.length) {
      adjustVideoElements();
    }

    el.append(video);
    if (el.children.length > 1) {
      buttons.prepend(muteButton);
    }
  }

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream); // call and send our video stream
    const otherUserVideo = Video({ styles });
    otherUserVideo.id = userId;

    call.on('stream', (userVideoStream) => {
      addVideoStream(otherUserVideo, userVideoStream);
    });
    call.on('close', () => {
      otherUserVideo.remove();
    });
    peers.push({ userId: call });
  }

  function getColumns() {
    let col = 0;
    if (el.childElementCount === 1) {
      col = 1;
    } else if (el.childElementCount > 1 && el.childElementCount <= 4) {
      col = 2;
    } else if (el.childElementCount > 4 && el.childElementCount <= 9) {
      col = 3;
    } else if (el.childElementCount > 9) {
      col = 4;
    }
    return col;
  }

  function adjustVideoElements() {
    const columns = getColumns();
    const videoWidth = window.innerWidth / columns;
    const rows = Math.ceil(el.children.length / columns);
    const videoHeight = window.innerHeight / rows;

    Array.from(el.children).forEach((child) => {
      (child as HTMLElement).style.height = (videoHeight - 20).toString();
      (child as HTMLElement).style.width = (videoWidth - 20).toString();
    });
  }

  const buttons = Div({
    styles: {
      width: '100%',
      display: 'flex',
      position: 'fixed',
      bottom: '40px',
      justifyContent: 'center',
    },
  });
  const exitCallButton = Button({
    innerHTML: phoneIcon,
    styles: {
      ...buttonStyles,
      right: '20px',
      backgroundColor: '#e62626',
      borderColor: '#e62626',
      transform: 'rotate(137deg)',
      marginLeft: '8px',
    },
    onClick: () => {
      socket.close();
      setURL('/');
    },
  });
  const muteButton = Button({
    innerHTML: microphoneIcon,
    styles: buttonStyles,
    onClick: () => {
      const audioTracks = myStream.getAudioTracks()[0];
      if (audioTracks.enabled) {
        muteButton.innerHTML = microphoneSlashIcon;
        audioTracks.enabled = false;
      } else {
        muteButton.innerHTML = microphoneIcon;
        audioTracks.enabled = true;
      }
    },
  });
  buttons.append(exitCallButton);
  container.append(el);
  container.append(buttons);
  return container;
}
