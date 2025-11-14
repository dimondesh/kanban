import { Route, Routes } from "react-router-dom";
import BoardsPage from "./pages/BoardsPage/BoardsPage";
import HomePage from "./pages/HomePage/HomePage";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/boards/:boardId?" element={<BoardsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
