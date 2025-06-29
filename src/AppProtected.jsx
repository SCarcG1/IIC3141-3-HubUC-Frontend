import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/common/Navbar";

export default function App() {
  return (
    <div>
      <main>
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}
