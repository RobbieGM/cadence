import { DBSchema, openDB } from "idb";
import { Component, createContext, createResource, Resource } from "solid-js";
import { Track, TrackWithId } from "./types";

interface Schema extends DBSchema {
  tracks: { key: number; value: Track };
}

const dbPromise = openDB<Schema>("database", 1, {
  upgrade(db) {
    db.createObjectStore("tracks", { autoIncrement: true });
  },
});

async function getAllTracks(): Promise<TrackWithId[]> {
  let cursor = await (await dbPromise)
    .transaction("tracks")
    .objectStore("tracks")
    .openCursor();
  if (cursor == null) {
    // Cursor resolves to null when there are no records
    return [];
  }
  cursor = await cursor.continue();
  const tracks: TrackWithId[] = [];
  while (cursor) {
    tracks.push({ ...cursor.value, id: cursor.key });
    // eslint-disable-next-line no-await-in-loop
    cursor = await cursor.continue();
  }
  return tracks;
}

interface DatabaseContextType {
  tracks: Resource<TrackWithId[] | undefined>;
  addTrack(track: Track): Promise<void>;
  deleteTrack(id: number): Promise<void>;
  updateTrack(id: number, track: Track): Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType>();

const DatabaseProvider: Component = (props) => {
  const [tracks, { refetch }] = createResource(getAllTracks);
  return (
    <DatabaseContext.Provider
      value={{
        tracks,
        async addTrack(track) {
          await (await dbPromise).add("tracks", track);
          refetch();
        },
        async deleteTrack(id) {
          await (await dbPromise).delete("tracks", id);
          refetch();
        },
        async updateTrack(id, track) {
          await (await dbPromise).put("tracks", track, id);
          refetch();
        },
      }}
    >
      {props.children}
    </DatabaseContext.Provider>
  );
};

export default DatabaseProvider;
