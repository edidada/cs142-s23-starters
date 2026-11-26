import { useEffect, useState } from "react";
import axios from "axios";
export default function useActivities() {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let active = true;
    const refresh = () => axios.get("/latestActivities").then(({ data }) => { if (active) setState({ data, error: null }); }).catch(error => { if (active) setState({ data: null, error }); });
    refresh();
    const timer = setInterval(refresh, 2000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return state;
}
