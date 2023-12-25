import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../Service/Peer";
import { useSocket } from "../Context/SoketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setShowAddButton(false);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      // console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      // console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const handleToggleAudio = () => {
    const audioTracks = myStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
    });
  };

  const handleToggleVideo = () => {
    const videoTracks = myStream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoMuted(!track.enabled);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full h-full max-w-screen-xl">
        <div className="mb-4 flex items-center justify-center">
          <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 h-full">
          {/* My Stream */}
          {myStream && (
            <div className="bg-gray-200 p-4 rounded h-full">
              <h1 className="text-xl font-bold mb-2 text-center">My Stream</h1>
              <ReactPlayer
                playing
                muted
                height="80%"
                width="90%"
                url={myStream}
              />
            </div>
          )}

          {/* Remote Stream */}
          {remoteStream && (
            <div className="bg-gray-200 p-4 rounded h-full">
              <h1 className="text-xl font-bold mb-2 text-center">
                Remote Stream
              </h1>
              <ReactPlayer
                className="content-center"
                playing
                muted
                height="80%"
                width="90%"
                url={remoteStream}
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-center space-x-4 mb-6">
          {myStream && (
            <button
              onClick={sendStreams}
              className="bg-blue-500 text-white py-2 px-6 rounded-full focus:outline-none focus:shadow-outline-blue"
            >
              Send Stream
            </button>
          )}
          {remoteSocketId && showAddButton && (
            <button
              onClick={handleCallUser}
              className="bg-green-500 text-white py-2 px-6 rounded-full focus:outline-none focus:shadow-outline-green"
            >
              Call
            </button>
          )}
          {/* Toggle Audio Button */}
          {myStream && (
            <button
              onClick={handleToggleAudio}
              className={`${
                isAudioMuted ? "bg-gray-500" : "bg-yellow-500"
              } text-white py-2 px-6 rounded-full focus:outline-none focus:shadow-outline-yellow`}
            >
              {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
            </button>
          )}
          {/* Toggle Video Button */}
          {myStream && (
            <button
              onClick={handleToggleVideo}
              className={`${
                isVideoMuted ? "bg-gray-500" : "bg-red-500"
              } text-white py-2 px-6 rounded-full focus:outline-none focus:shadow-outline-red`}
            >
              {isVideoMuted ? "Unmute Video" : "Mute Video"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
