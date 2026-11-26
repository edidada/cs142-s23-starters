import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Checkbox, FormControlLabel } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function TopBar({ advanced, onAdvancedChange, children }) {
  const { pathname } = useLocation();
  const route = pathname.match(/^\/(users|photos|comments)\/([^/]+)(?:\/[^/]+)?$/);
  const { data: info } = useModel("/test/info");
  const { data: user } = useModel(route ? `/user/${route[2]}` : "/user/list");
  const name = route && user && !Array.isArray(user) ? `${user.first_name} ${user.last_name}` : "Users";
  return (
    <AppBar className="cs142-topbar-appBar" position="static">
      <Toolbar className="photo-toolbar">
        <Typography variant="h5">edidada</Typography>
        <Typography className="schema-version">Version {info ? info.version : "…"}</Typography>
        <FormControlLabel label="Enable Advanced Features" control={
          <Checkbox checked={advanced} onChange={(event) => onAdvancedChange(event.target.checked)} sx={{ color: "inherit", "&.Mui-checked": { color: "inherit" } }} />
        } />
        <Typography className="view-context">{route && route[1] === "photos" ? `Photos of ${name}` : name}</Typography>
        <Link to="/activities" style={{ color: "inherit" }}>Activities</Link>
        {children}
      </Toolbar>
    </AppBar>
  );
}
export default TopBar;
