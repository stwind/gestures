import { render } from "preact";
import "./index.css";

const App = () => {
  return <div>hello</div>;
};

render(<App />, document.getElementById("app") as HTMLElement);
