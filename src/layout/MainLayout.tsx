import React from "react";
import Sidebar from "../components/Sidebar";
import { SidebarProvider } from "../context/SidebarContext";
import Header from "../components/header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ">
          <Header />
          <div className="flex-1 overflow-y-auto max-w-7xl  mx-auto px-8 p-7">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;