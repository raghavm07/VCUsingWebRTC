import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../Context/SoketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();
  //console.log(socket);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // console.log({ email, roomCode });
      socket.emit("room:join", { roomCode, email });
    },
    [email, roomCode, socket]
  );

  const handleRoomJoin = useCallback(
    (data) => {
      const { roomCode, email } = data;
      //console.log(email, roomCode);
      navigate(`/room/${roomCode}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleRoomJoin);
    return () => {
      socket.off("room:join", handleRoomJoin);
    };
  }, [socket, handleRoomJoin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Lobby</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="eMail"
              className="block text-sm font-medium text-gray-600"
            >
              Email Id
            </label>
            <input
              type="email"
              id="eMail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="roomCode"
              className="block text-sm font-medium text-gray-600"
            >
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>

          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white rounded border border-blue-600 hover:bg-blue-600"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
