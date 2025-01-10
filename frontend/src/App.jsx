import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Detection from "./pages/detection";
import RecoveryPassword from "./pages/recover-password";
import ResetPassword from "./pages/reset-password";
import History from "./pages/history";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recover-password" element={<RecoveryPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/detection" element={<Detection />} />
        <Route path="/detection/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
