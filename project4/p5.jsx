import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Link, Redirect } from "react-router-dom";
import Header from "./components/Header";
import Example from "./components/Example";
import States from "./components/States";
import "./styles/main.css";

ReactDOM.render(
  <HashRouter>
    <Header />
    <main className="container">
      <nav className="view-toolbar" aria-label="Views">
        <Link to="/states">States</Link><Link to="/example">Example</Link>
      </nav>
      <Route exact path="/"><Redirect to="/states" /></Route>
      <Route path="/states" component={States} />
      <Route path="/example" component={Example} />
    </main>
  </HashRouter>, document.getElementById("reactapp")
);
