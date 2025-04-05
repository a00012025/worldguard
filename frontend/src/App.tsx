import { Route, Routes } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/HomePage";
import VerificationPage from "./pages/VerificationPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/verify" element={<VerificationPage />} />
    </Routes>
  );
}

export default App;
