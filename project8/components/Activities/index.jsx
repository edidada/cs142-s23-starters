import React, { useState } from "react";
import useModel from "../../lib/useModel";
function Activities() {
  const [revision, setRevision] = useState(0);
  const { data, error } = useModel(`/activities?refresh=${revision}`);
  return (
    <section className="activities">
      <h1>Activities</h1><button onClick={() => setRevision(revision + 1)}>Refresh activities</button>
      {error && <p role="alert">Unable to load activities.</p>}
      {data && data.length === 0 && <p>No activities yet.</p>}
      {data && data.map(activity => (
        <article key={activity._id} data-activity-id={activity._id}>
          <time dateTime={activity.date_time}>{new Date(activity.date_time).toLocaleString()}</time>
          <p>{activity.user_name} · {activity.type}</p>
          {activity.photo && activity.photo.file_name && <img width="90" src={`images/${activity.photo.file_name}`} alt="Activity context" />}
        </article>
      ))}
    </section>
  );
}
export default Activities;
