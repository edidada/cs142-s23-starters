import React from "react";
import { useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function TopBar() {
  const { pathname } = useLocation();
  const route = pathname.match(/^\/(users|photos)\/([^/]+)$/);
  const { data: info } = useModel("/test/info");
  const { data: user } = useModel(route ? `/user/${route[2]}` : "/user/list");
  const name = route && user && !Array.isArray(user) ? `${user.first_name} ${user.last_name}` : "Users";
  return (
    <AppBar className="cs142-topbar-appBar" position="static">
      <Toolbar className="photo-toolbar">
        <Typography variant="h5">edidada</Typography>
        <Typography className="schema-version">Version {info ? info.__v : "…"}</Typography>
        <Typography className="view-context">{route && route[1] === "photos" ? `Photos of ${name}` : name}</Typography>
      </Toolbar>
    </AppBar>
  );
}
export default TopBar;
