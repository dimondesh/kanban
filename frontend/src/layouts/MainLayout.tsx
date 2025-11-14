import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export const MainLayout = () => {
  return (
    <div className="min-h-screen  bg-zinc-950  text-white flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
