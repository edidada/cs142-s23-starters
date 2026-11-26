import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserDetail({ match }) {
  const { data: user, error } = useModel(`/user/${encodeURIComponent(match.params.userId)}`);
  if (error) return <Typography role="alert">Unable to load this user.</Typography>;
  if (!user) return <Typography>Loading user…</Typography>;
  return (
    <section className="user-detail">
      <Typography variant="h4" component="h1">{user.first_name} {user.last_name}</Typography>
      <dl><dt>Location</dt><dd>{user.location}</dd><dt>Occupation</dt><dd>{user.occupation}</dd></dl>
      <Typography paragraph>{user.description}</Typography>
      <Button component={Link} to={`/photos/${user._id}`} variant="contained">View photos</Button>
    </section>
  );
}
export default UserDetail;
