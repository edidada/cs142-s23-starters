import React from "react";
import ReactDOM from "react-dom";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

function PhotoShare() {
  return (
    <HashRouter>
      <TopBar />
      <Grid container spacing={2} className="photo-layout">
        <Grid item xs={12} sm={3}>
          <Paper className="cs142-main-grid-item"><UserList /></Paper>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              <Route exact path="/"><Redirect to="/users" /></Route>
              <Route path="/users/:userId" component={UserDetail} />
              <Route path="/photos/:userId" component={UserPhotos} />
              <Route path="/users" component={UserList} />
            </Switch>
          </Paper>
        </Grid>
      </Grid>
    </HashRouter>
  );
}
ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
