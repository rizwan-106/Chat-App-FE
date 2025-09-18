import { Toaster } from "react-hot-toast";
import Router from "./router/Router";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <Router />
    </>
  );
}

export default App;
