import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

import UserComments from "./components/UserComments";

import LoginRegister from "./components/LoginRegister";

function PhotoShare() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { axios.get("/session").then(({ data }) => setUser(data)).catch(() => setUser(null)).finally(() => setReady(true)); }, []);
  const login = data => { setUser(data); window.location.hash = "/users/" + data._id; };
  const [advanced, setAdvanced] = useState(false);
  if (!ready) return <p>Checking session…</p>;
  return (
    <HashRouter>
      {user ? <TopBar advanced={advanced} onAdvancedChange={setAdvanced} /> : <h2>Please Login</h2>}
      {user && <SessionControls user={user} onLogout={() => { setUser(null); setAdvanced(false); }} />}
      <Grid container spacing={2} className="photo-layout">
        <Grid item xs={12} sm={3}>
          <Paper className="cs142-main-grid-item">{user && <UserList advanced={advanced} />}</Paper>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Paper className="cs142-main-grid-item">
            {!user && <><Redirect to="/login-register" /><LoginRegister onLogin={login} /></>}
            {user && (
              <Switch>
              <Route exact path="/"><Redirect to="/users" /></Route>
              <Route path="/comments/:userId" render={(props) => <UserComments {...props} advanced={advanced} />} />
              <Route path="/users/:userId" component={UserDetail} />
              <Route path="/photos/:userId/:photoId?" render={(props) => <UserPhotos {...props} advanced={advanced} />} />
              <Route path="/users" component={UserList} />
              </Switch>
            )}
          </Paper>
        </Grid>
      </Grid>
    </HashRouter>
  );
}
function SessionControls({ user, onLogout }) {
  const [message, setMessage] = useState("");
  const upload = async event => {
    event.preventDefault();
    try { await axios.post("/photos/new", new FormData(event.currentTarget)); setMessage("Photo added"); window.location.hash = "/photos/" + user._id; window.location.reload(); }
    catch (error) { setMessage("Unable to upload photo"); }
  };
  const logout = async () => { try { await axios.post("/admin/logout"); onLogout(); } catch (error) { setMessage("Unable to logout"); } };
  return (
    <div className="session-controls">
      <span>Hi {user.first_name}</span><button onClick={logout}>Logout</button>
      <form onSubmit={upload}><input aria-label="Photo file" type="file" name="uploadedphoto" accept="image/*" required /><button type="submit">Add Photo</button></form>
      <p role="status">{message}</p>
    </div>
  );
}
ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
