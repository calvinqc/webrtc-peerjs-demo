// Connect Client to the server socket, in this case, it's default '/'
// But usually server and client are hosted separately
// for ex: const socket = io('localhost:8080');
const socket = io('/');
const yourVideoGrid = document.getElementById('your-video-grid');
const otherVideoGrid = document.getElementById('other-video-grid');
const myVideo = document.createElement('video');
const peers = {};

// check out more STUN servers: https://gist.github.com/zziuni/3741933
/**
 * Default config
  const DEFAULT_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:0.peerjs.com:3478", username: "peerjs", credential: "peerjsp" }
  ],
  sdpSemantics: "unified-plan"
};
 */
const myPeer = new Peer().on('open', (socketID) =>
    socket.emit('join', ROOM_ID, socketID)
);

socket.on('user-disconnected', (socketID) => peers[socketID].close());

navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((myStream) => {
        // create your Video

        addVideoStream(myVideo, myStream, true);

        // Init "WAITING_CALL STATE" of current peer
        // 4. PersonN waiting for a call from (2)
        myPeer.on('call', (incomingCall) => {
            const personNVideo = document.createElement('video');
            // 5. personN answers the call given personN's Video Stream
            incomingCall.answer(myStream);

            // 6. personN now will add myPeer Stream to personN's screen
            incomingCall.on('stream', (otherVideoStream) => {
                addVideoStream(personNVideo, otherVideoStream);
            });
        });

        // 1. Receive a signal from the server that a new user just joined
        socket.on('new-user-connected', (personN) => {
            // 2 .call() share public IP and establish a connection
            // 3. myPeer call personN given my videoStream
            const call = myPeer.call(personN, myStream);
            const personNVideo = document.createElement('video');
            // 6. AfterpersonN accept the call, myPeer will add personN's stream on myPeer's screen
            call.on('stream', (otherVideoStream) => {
                addVideoStream(personNVideo, otherVideoStream);
            });

            call.on('close', () => personNVideo.remove());

            peers[personN] = call;
        });
    });

function addVideoStream(video, stream, yourVideo = false) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => video.play());

    if (yourVideo) yourVideoGrid.append(video);
    else otherVideoGrid.append(video);
}
