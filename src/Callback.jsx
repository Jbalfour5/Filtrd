import { useEffect } from "react";
import { getAccessToken } from "./spotifyAuth";

export default function Callback() {
  useEffect(() => {
    async function fetchToken() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) return;

      const token = await getAccessToken(code);
      localStorage.setItem("spotify_access_token", token);

      window.history.replaceState({}, document.title, "/");
      window.location.href = "/";
    }

    fetchToken();
  }, []);

  return <div>Loading Spotify authorization...</div>;
}
