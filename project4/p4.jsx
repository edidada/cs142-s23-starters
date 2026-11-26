import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import Example from "./components/Example";
import States from "./components/States";
import "./styles/main.css";

class SwitchingViews extends React.Component {
  constructor(props) {
    super(props);
    this.state = { states: true };
  }
  render() {
    const { states } = this.state;
    return (
      <>
        <Header />
        <main className="container">
          <button type="button" onClick={() => this.setState((previous) => ({ states: !previous.states }))}>
            Switch to {states ? "Example" : "States"}
          </button>
          {states ? <States /> : <Example />}
        </main>
      </>
    );
  }
}
ReactDOM.render(<SwitchingViews />, document.getElementById("reactapp"));
