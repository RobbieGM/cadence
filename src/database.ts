import { DBSchema, openDB } from "idb";
import { createResource } from "solid-js";
import { Track } from "./types";

interface Schema extends DBSchema {
  tracks: { key: number; value: Track };
}

const dbPromise = openDB<Schema>("database", 1, {
  upgrade(db) {
    db.createObjectStore("tracks", { autoIncrement: true });
  },
});

export async function getAllTracks() {
  return (await dbPromise).getAll("tracks");
}

export function useTracks() {
  const [tracks, { mutate }] = createResource(getAllTracks);
  return {
    tracks,
    async add(track: Track) {
      (await dbPromise).add("tracks", track);
      mutate((tracks) => {
        if (tracks == null) {
          // If one is added while they are still loading, just return the new one (unlikely scenario)
          return [track];
        }
        return [...tracks, track];
      });
    },
  };
}

// export async function updateTrack(track: Track) {
//   const db = await dbPromise;
//   return db.put("tracks", track, track.id);
// }
