import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Button } from "@mui/material";
import useModel from "../../lib/useModel";
import "./styles.css";

function UserPhotos({ match, advanced }) {
  const [overrides, setOverrides] = useState({});
  const { data: order, error: orderError } = useModel(`/photoOrder/${encodeURIComponent(match.params.userId)}`);
  const { data: sourcePhotos, error } = useModel(`/photosOfUser/${encodeURIComponent(match.params.userId)}`);
  useEffect(() => {
    if (sourcePhotos && order && match.params.photoId) {
      const timer = setTimeout(() => { const card = document.querySelector(`[data-photo-id="${match.params.photoId}"]`); if (card) card.scrollIntoView(); }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [sourcePhotos, order, match.params.photoId, advanced]);
  if (error || orderError) return <Typography role="alert">Unable to load photos for this user.</Typography>;
  if (!sourcePhotos || !order) return <Typography>Loading photos…</Typography>;
  const photos = order.map(item => sourcePhotos.find(photo => photo._id === item._id)).filter(Boolean);
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
            <LikeControl photo={overrides[photo._id] || order.find(item => item._id === photo._id)} onUpdate={value => setOverrides({ ...overrides, [photo._id]: value })} />
            <ul className="photo-comments">
              {(photo.comments || []).map((comment) => (
                <li key={comment._id}>
                  <Link to={`/users/${comment.user._id}`}>{comment.user.first_name} {comment.user.last_name}</Link>
                  <time dateTime={comment.date_time}>{formatDate(comment.date_time)}</time>
                  <p>{comment.comment}</p>
                </li>
              ))}
            </ul>
            <CommentForm photoId={photo._id} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
function LikeControl({ photo, onUpdate }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toggle = async () => {
    setBusy(true);
    try { const { data } = await axios.post(`/photoLike/${photo._id}`, { liked: !photo.liked }); onUpdate(data); setError(""); }
    catch (failure) { setError("Unable to update like"); }
    finally { setBusy(false); }
  };
  return <div className="like-control"><button disabled={busy} aria-pressed={photo.liked} onClick={toggle}>{photo.liked ? "Unlike" : "Like"}</button><span>{photo.count} likes</span>{error && <p role="alert">{error}</p>}</div>;
}
function CommentForm({ photoId }) {
  const [message, setMessage] = useState("");
  const add = async event => {
    event.preventDefault();
    const comment = new FormData(event.currentTarget).get("comment");
    try { await axios.post(`/commentsOfPhoto/${photoId}`, { comment }); window.location.reload(); }
    catch (error) { setMessage("Unable to add comment"); }
  };
  return <form aria-label="Add comment" onSubmit={add}><label>New comment<input name="comment" required /></label><button type="submit">Post comment</button><p role="status">{message}</p></form>;
}
export default UserPhotos;
