import React from "react";
import "./styles.css";

class Header extends React.Component {
  render() {
    return (
      <header className="personal-header">
        <div className="header-orbit" aria-hidden="true"><span>e</span></div>
        <div><p className="header-kicker">EDIDADA / WEB EXPLORATIONS</p>
          <h1>Small ideas, working interfaces.</h1>
          <p>01 Discover <span aria-hidden="true">→</span> 02 Build <span aria-hidden="true">→</span> 03 Reflect</p>
        </div>
      </header>
    );
  }
}
export default Header;
