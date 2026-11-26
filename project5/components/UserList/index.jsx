import React from "react";
import { Link } from "react-router-dom";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserList() {
  const { data, error } = useModel("/user/list");
  if (error) return <Typography role="alert">Unable to load users.</Typography>;
  if (!data) return <Typography>Loading users…</Typography>;
  return (
    <List component="nav" aria-label="Users">
      {data.map((user) => (
        <ListItem key={user._id} component={Link} to={`/users/${user._id}`}>
          <ListItemText primary={`${user.first_name} ${user.last_name}`} />
        </ListItem>
      ))}
    </List>
  );
}
export default UserList;
