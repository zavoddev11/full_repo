// Dynamically load React, ReactDOM, and Babel
const loadScript = (src, callback) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  };
  
  // Load React, ReactDOM, and Babel from CDN
  loadScript("https://unpkg.com/react@18/umd/react.development.js", () => {
    loadScript("https://unpkg.com/react-dom@18/umd/react-dom.development.js", () => {
      loadScript("https://unpkg.com/@babel/standalone/babel.min.js", () => {
        
        // JSX code starts here
        const jsxCode = `
          function App() {
            return (
              <div>
                <p>This is a functional component.</p>
                <Button />
              </div>
            );
          }
  
          function Button() {
            return (
              <button onClick={() => alert("Button Clicked!")}>
                Click Me
              </button>
            );
          }
  
          // Render App component
          const root = ReactDOM.createRoot(document.getElementById("root"));
          root.render(<App />);
        `;
  
        // Compile the JSX code with Babel and execute it
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.text = Babel.transform(jsxCode, { presets: ["react"] }).code;
        document.body.appendChild(script);
      });
    });
  });
  