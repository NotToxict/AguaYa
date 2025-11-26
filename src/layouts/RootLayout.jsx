import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";

// Si tienes un Footer, impórtalo y colócalo debajo del Outlet
export default function RootLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}