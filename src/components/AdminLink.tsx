import { Link } from "react-router-dom";

export default function AdminLink() {
  return (
    <Link
      to="/admin"
      className="rounded-full bg-black px-4 py-1 text-sm font-medium text-white hover:bg-neutral-800 transition"
    >
      Admin
    </Link>
  );
}
