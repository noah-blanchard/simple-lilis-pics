/* Lilis Pics — App entry */
const { createRoot } = ReactDOM;

const App = () => {
  return (
    <main className="bg-ink text-white">
      <Hero />
      <Marquee />
      <About />
      <Specialty />
      <Portfolio />
      <Process />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
};

createRoot(document.getElementById("root")).render(<App />);
