import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Button } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserPhotos({ match, advanced }) {
  const { data: photos, error } = useModel(`/photosOfUser/${encodeURIComponent(match.params.userId)}`);
  if (error) return <Typography role="alert">Unable to load photos for this user.</Typography>;
  if (!photos) return <Typography>Loading photos…</Typography>;
  if (!photos.length) return <Typography>No photos yet.</Typography>;
  const index = match.params.photoId ? photos.findIndex((photo) => photo._id === match.params.photoId) : 0;
  if (advanced && index < 0) return <Typography role="alert">Photo not found for this user.</Typography>;
  const visible = advanced ? [photos[index]] : photos;
  const photoLink = (position) => `/photos/${match.params.userId}/${photos[position]._id}`;
  const formatDate = (date) => new Date(date).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short"
  });
  return (
    <section className="user-photos" aria-label="User photos">
      {advanced && (
        <nav className="photo-stepper" aria-label="Photo navigation">
          <Button component={Link} to={photoLink(Math.max(0, index - 1))} disabled={index === 0}>Previous photo</Button>
          <Typography component="span">{index + 1} / {photos.length}</Typography>
          <Button component={Link} to={photoLink(Math.min(photos.length - 1, index + 1))} disabled={index === photos.length - 1}>Next photo</Button>
          <Button component={Link} to={photoLink(index)}>Bookmark this photo</Button>
        </nav>
      )}
      {visible.map((photo) => (
        <Card key={photo._id} className="photo-card" data-photo-id={photo._id}>
          <img src={`images/${photo.file_name}`} alt={`Shared by user ${photo.user_id}`} />
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
