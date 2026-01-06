import React from "react";
import LoginHeader from "./header/LoginHeader";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <LoginHeader />
      <Outlet />
    </>
  );
};

export default Layout;
