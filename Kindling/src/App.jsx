import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Inspirations from "./pages/Inspirations";
import Profile from "./pages/Profile";

import AuthModal from "./components/AuthModal";

import { supabase } from "./lib/supabaseClient";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  //load in database from supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setAuthLoading(false);
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    //stop listening to authentication changes
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        Loading Kindling...
      </div>
    );
  }

  return (
    <>
      {!user && <AuthModal />}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inspirations" element={<Inspirations />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;