import Lobby from "./Components/Screens/Lobby";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Room from "./Components/Screens/Room";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Lobby />}></Route>
        <Route path="/room/:roomId" element={<Room />}>
          {" "}
        </Route>
      </Routes>
    </>
  );
}

export default App;
