import React from "react";
import { Link } from "react-router-dom";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserList({ advanced = false }) {
  const { data, error } = useModel("/user/list");
  const { data: stats, error: statsError } = useModel("/userStats");
  if (error) return <Typography role="alert">Unable to load users.</Typography>;
  if (!data) return <Typography>Loading users…</Typography>;
  return (
    <List component="nav" aria-label="Users">
      {data.map((user) => (
        <ListItem key={user._id}>
          <ListItemText primary={<Link to={`/users/${user._id}`}>{user.first_name} {user.last_name}</Link>} />
          {advanced && stats && stats.filter(stat => stat._id === user._id).map(stat => (
            <span key={stat._id} className="user-counts">
              <span className="photo-count" aria-label={`Photos by ${user.first_name}`}>{stat.photos}</span>
              <Link className="comment-count" aria-label={`Comments by ${user.first_name}`} to={`/comments/${user._id}`}>{stat.comments}</Link>
            </span>
          ))}
          {advanced && statsError && <span role="alert">Counts unavailable</span>}
        </ListItem>
      ))}
    </List>
  );
}
export default UserList;
