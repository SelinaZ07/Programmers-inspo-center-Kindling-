import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Inspirations from "./pages/Inspirations";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home />}/>
        <Route
          path="/inspirations"
          element={<Inspirations />}
        />
        <Route path="/profile"
        element = {<Profile/>}/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;