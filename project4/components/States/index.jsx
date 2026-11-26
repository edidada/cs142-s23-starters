import React from "react";
import "./styles.css";

/**
 * Define States, a React component of CS142 Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.cs142models.statesModel().
 */
class States extends React.Component {
  constructor(props) {
    super(props);
    this.state = { substring: "" };
  }

  render() {
    const { substring } = this.state;
    const matches = window.cs142models.statesModel()
      .filter((name) => name.toLowerCase().includes(substring.toLowerCase())).sort();
    return (
      <section className="states-view">
        <h1>Explore the states</h1>
        <label htmlFor="state-filter">State name contains</label>
        <input id="state-filter" value={substring}
          onChange={(event) => this.setState({ substring: event.target.value })} />
        <p>Current filter: <output>{substring}</output></p>
        {matches.length ? <ul>{matches.map((name) => <li key={name}>{name}</li>)}</ul>
          : <p role="status">No matching states.</p>}
      </section>
    );
  }
}

export default States;
