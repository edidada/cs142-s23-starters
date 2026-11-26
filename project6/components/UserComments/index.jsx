import React from "react";
import { Link } from "react-router-dom";
import useModel from "../../lib/useModel";

function UserComments({ match, advanced }) {
  const { data, error } = useModel(`/commentsOfUser/${match.params.userId}`);
  if (!advanced) return <p>Enable Advanced Features to view comments.</p>;
  if (error) return <p role="alert">Unable to load comments.</p>;
  if (!data) return <p>Loading comments…</p>;
  return (
    <section className="user-comments">
      <h1>Authored comments</h1>
      {data.length === 0 && <p>No comments.</p>}
      {data.map(comment => (
        <article key={comment._id} data-comment-id={comment._id}>
          <Link to={`/photos/${comment.photo.user_id}/${comment.photo._id}`}>
            <img width="90" src={`images/${comment.photo.file_name}`} alt="Commented photo" />
            <p>{comment.comment}</p>
          </Link>
        </article>
      ))}
    </section>
  );
}
export default UserComments;
