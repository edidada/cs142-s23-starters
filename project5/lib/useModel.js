import { useEffect, useState } from "react";
import fetchModel from "./fetchModelData";

export default function useModel(url) {
  const [result, setResult] = useState({ url, data: null, error: null });
  useEffect(() => {
    let active = true;
    fetchModel(url).then(({ data }) => {
      if (active) setResult({ url, data, error: null });
    }).catch((error) => {
      if (active) setResult({ url, data: null, error });
    });
    return () => { active = false; };
  }, [url]);
  return result.url === url ? result : { url, data: null, error: null };
}
