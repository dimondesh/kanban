import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-zinc-900 border-b border-zinc-700 text-white p-4 flex items-center justify-between">
      <Link to="/" className="text-lg font-semibold hover:text-blue-400">
        <img src="/logo.svg" alt="Logo" className="size-8" />{" "}
      </Link>

      <nav className="flex gap-4">
        <Link
          to="/boards"
          className={`${currentPath.includes("/boards") ? "text-blue-500" : ""} font-semibold`}
        >
          Boards
        </Link>
        <Link
          to="/"
          className={`${currentPath === "/" ? "text-blue-500" : ""} font-semibold`}
        >
          Home
        </Link>
      </nav>
    </header>
  );
};

export default Header;
