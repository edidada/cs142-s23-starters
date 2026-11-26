import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserPhotos({ match }) {
  const { data: photos, error } = useModel(`/photosOfUser/${encodeURIComponent(match.params.userId)}`);
  if (error) return <Typography role="alert">Unable to load photos for this user.</Typography>;
  if (!photos) return <Typography>Loading photos…</Typography>;
  if (!photos.length) return <Typography>No photos yet.</Typography>;
  const formatDate = (date) => new Date(date).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short"
  });
  return (
    <section className="user-photos" aria-label="User photos">
      {photos.map((photo) => (
        <Card key={photo._id} className="photo-card" data-photo-id={photo._id}>
          <img src={`images/${photo.file_name}`} alt={`Photo by user ${photo.user_id}`} />
          <CardContent>
            <Typography component="time" dateTime={photo.date_time}>{formatDate(photo.date_time)}</Typography>
            <ul className="photo-comments">
              {(photo.comments || []).map((comment) => (
                <li key={comment._id}>
                  <Link to={`/users/${comment.user._id}`}>{comment.user.first_name} {comment.user.last_name}</Link>
                  <time dateTime={comment.date_time}>{formatDate(comment.date_time)}</time>
                  <p>{comment.comment}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
export default UserPhotos;
