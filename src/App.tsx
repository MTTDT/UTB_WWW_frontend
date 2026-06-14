"use client";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UsersPage from "@/pages/UserPage";

import { AuthProvider } from "./components/AuthProvider";
import { AuthDialog } from "./components/AuthDialog";
import { UserMenu } from "./components/UserMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "./hooks/useAuth";
import { BarChart2, LogIn } from "lucide-react";

import StocksContent from "@/components/StocksContent";


export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { isAuthenticated, user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">StockSim</span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<StocksContent />} />

        <Route
          path="/users"
          element={
            user?.is_admin
              ? <UsersPage />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
      

      

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}