import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

import UserComments from "./components/UserComments";

function PhotoShare() {
  const [advanced, setAdvanced] = useState(false);
  return (
    <HashRouter>
      <TopBar advanced={advanced} onAdvancedChange={setAdvanced} />
      <Grid container spacing={2} className="photo-layout">
        <Grid item xs={12} sm={3}>
          <Paper className="cs142-main-grid-item"><UserList advanced={advanced} /></Paper>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              <Route exact path="/"><Redirect to="/users" /></Route>
              <Route path="/comments/:userId" render={(props) => <UserComments {...props} advanced={advanced} />} />
              <Route path="/users/:userId" component={UserDetail} />
              <Route path="/photos/:userId/:photoId?" render={(props) => <UserPhotos {...props} advanced={advanced} />} />
              <Route path="/users" component={UserList} />
            </Switch>
          </Paper>
        </Grid>
      </Grid>
    </HashRouter>
  );
}
ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
