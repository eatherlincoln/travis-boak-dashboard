import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{ padding: 24, textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you’re looking for doesn’t exist.</p>
      <p>
        <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
          Go back home
        </Link>
      </p>
    </main>
  );
}
