import { io } from "@tensorflow/tfjs";
import { DBSchema, openDB } from "idb";
import {
  createContext,
  createResource,
  ParentComponent,
  Resource,
} from "solid-js";
import { Model } from "../chord-generation";
import { Track, TrackWithId } from "../types";

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
  const tracks: TrackWithId[] = [];
  while (cursor) {
    tracks.push({ ...cursor.value, id: cursor.key });
    // eslint-disable-next-line no-await-in-loop
    cursor = await cursor.continue();
  }
  return tracks;
}

async function getModelNames() {
  return Object.keys(await io.listModels()).map((name) =>
    name.substring("indexeddb://".length)
  );
}

async function deleteModel(name: string) {
  return io.removeModel(`indexeddb://${name}`);
}

interface DatabaseContextType {
  tracks: Resource<TrackWithId[] | undefined>;
  addTrack(track: Track): Promise<void>;
  deleteTrack(id: number): Promise<void>;
  updateTrack(id: number, track: Track): Promise<void>;
  modelNames: Resource<string[] | undefined>;
  getModel(name: string): Model;
  saveModel(model: Model, name: string): Promise<void>;
  deleteModel(name: string): void;
}

export const DatabaseContext = createContext<DatabaseContextType>();

const DatabaseProvider: ParentComponent = (props) => {
  const [tracks, { refetch }] = createResource(getAllTracks);
  const [modelNames, { refetch: refetchModelNames }] =
    createResource(getModelNames);
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
        modelNames,
        getModel(name) {
          return new Model(name);
        },
        async saveModel(model, name) {
          await model.save(name);
          refetchModelNames();
        },
        async deleteModel(name) {
          await deleteModel(name);
          refetchModelNames();
        },
      }}
    >
      {props.children}
    </DatabaseContext.Provider>
  );
};

export default DatabaseProvider;
