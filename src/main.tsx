import { render } from "preact";
import { useSignal } from "@preact/signals";
import "./index.css";

const App = () => {
  const count = useSignal(0);
  return (
    <>
      <div>{count}</div>
      <button onClick={() => count.value++}>+</button>
    </>
  );
};

render(<App />, document.getElementById("app") as HTMLElement);
