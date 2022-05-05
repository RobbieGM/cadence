import { DBSchema, openDB } from "idb";
import { Component, createContext, createResource, Resource } from "solid-js";
import { Track } from "./types";

interface Schema extends DBSchema {
  tracks: { key: number; value: Track };
}

const dbPromise = openDB<Schema>("database", 1, {
  upgrade(db) {
    db.createObjectStore("tracks", { autoIncrement: true });
  },
});

async function getAllTracks() {
  return (await dbPromise).getAll("tracks");
}

interface DatabaseContextType {
  tracks: Resource<Track[] | undefined>;
  addTrack(track: Track): Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType>();

const DatabaseProvider: Component = (props) => {
  const [tracks, { mutate }] = createResource(getAllTracks);
  return (
    <DatabaseContext.Provider
      value={{
        tracks,
        async addTrack(track) {
          (await dbPromise).add("tracks", track);
          mutate((tracks) => {
            if (tracks == null) {
              // If one is added while they are still loading, just return the new one (unlikely scenario)
              return [track];
            }
            return [...tracks, track];
          });
        },
      }}
    >
      {props.children}
    </DatabaseContext.Provider>
  );
};

export default DatabaseProvider;
