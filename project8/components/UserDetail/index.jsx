import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserDetail({ match }) {
  const { data: user, error } = useModel(`/user/${encodeURIComponent(match.params.userId)}`);
  const { data: summary, error: summaryError } = useModel(`/profileSummary/${encodeURIComponent(match.params.userId)}`);
  if (error) return <Typography role="alert">Unable to load this user.</Typography>;
  if (!user) return <Typography>Loading user…</Typography>;
  return (
    <section className="user-detail">
      <Typography variant="h4" component="h1">{user.first_name} {user.last_name}</Typography>
      <dl><dt>Location</dt><dd>{user.location}</dd><dt>Occupation</dt><dd>{user.occupation}</dd></dl>
      <Typography paragraph>{user.description}</Typography>
      {summaryError && <p role="alert">Unable to load summary.</p>}
      {summary && ["latest", "mostCommented"].map(kind => (
        <div key={kind} className="profile-summary" data-summary={kind}>
          <h2>{kind === "latest" ? "Latest upload" : "Most commented"}</h2>
          {summary[kind] ? (
            <Link to={`/photos/${user._id}/${summary[kind]._id}`}>
              <img width="90" src={`images/${summary[kind].file_name}`} alt="Profile highlight" />
              <span>{kind === "latest" ? new Date(summary[kind].date_time).toLocaleString() : `${summary[kind].comments} comments`}</span>
            </Link>
          ) : <p>No photos yet.</p>}
        </div>
      ))}
      <Button component={Link} to={`/photos/${user._id}`} variant="contained">View photos</Button>
    </section>
  );
}
export default UserDetail;
