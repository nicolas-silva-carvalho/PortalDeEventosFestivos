import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/navbar/navbar";

import Home from "@/pages/Home";
import Legislacao from "@/pages/Legislacao";
import Sobre from "@/pages/Sobre";
import NotFound from "@/pages/NaoEncontrada";
import { AsyncBoundary } from "@/core/ui/async-boundary";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
            <AsyncBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/legislacao" element={<Legislacao />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AsyncBoundary>
        </main>
      </div>
    </Router>
  );
}
