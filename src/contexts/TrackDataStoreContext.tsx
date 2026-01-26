import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// コンテキストの型定義
type TrackDataStoreContextType = {
  addTrack: () => void;
  deleteTrack: (id: string) => void;
  addNote: (
    trackId: string,
    posX: number,
    noteName: string,
    audioBuffer: AudioBuffer
  ) => Map<string, AudioTrack>;
  getTracksInfo: () => Map<string, AudioTrack>;
  getTrackFromIndex: (index: number) => AudioTrack;

  // その他必要な関数を追加
};

interface AudioNote {
  id: string;
  noteName: string;
  posX: number;
  audioBuffer?: AudioBuffer;
}

export interface AudioTrack {
  id: string;
  trackName: string;
  notes: Map<string, AudioNote>;
}

const defaultNotes = new Map<string, AudioNote>([
  [
    "defaultNode_1",
    {
      id: "defaultNode_1",
      noteName: "test1",
      posX: 50,
    },
  ],
  [
    "defaultNode_2",
    {
      id: "defaultNode_2",
      noteName: "test2",
      posX: 200,
    },
  ],
]);

const defaultTracks = new Map<string, AudioTrack>([
  [
    "default_id",
    {
      id: "default_id",
      trackName: "default_track",
      notes: defaultNotes,
    },
  ],
]);

const TrackDataStoreContext = createContext<TrackDataStoreContextType | null>(null);

const TrackDataStoreProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<Map<string, AudioTrack>>(defaultTracks);

  const addTrack = useCallback(() => {
    setTracks((prev) => {
      // 新しいID生成
      const newId = crypto.randomUUID();

      const newTrack: AudioTrack = {
        id: newId,
        // Mapには length がないので size を使用
        trackName: `track_${prev.size + 1}`,
        notes: new Map<string, AudioNote>(),
      };

      // Map のイミュータブルな更新パターン
      // 1. 新しい Map を作成 (prevの中身をコピー)
      const newTracks = new Map(prev);
      // 2. 新しい要素を set
      newTracks.set(newId, newTrack);

      return newTracks;
    });
  }, []);

  //const addNote = useCallback(() => {}, []);

  const deleteTrack = useCallback((id: string) => {
    setTracks((prev) => {
      // 1. 新しい Map を作成
      const newTracks = new Map(prev);
      // 2. 指定IDを delete
      newTracks.delete(id);

      return newTracks;
    });
  }, []);

  const addNote = useCallback(
    (trackId: string, posX: number, noteName: string, audioBuffer: AudioBuffer) => {
      setTracks((prev) => {
        const targetTrack = prev.get(trackId);
        if (!targetTrack) {
          console.warn(`Track not found: ${trackId}`);
          return prev;
        }

        const newNoteId = crypto.randomUUID();
        const newNote: AudioNote = {
          id: newNoteId,
          noteName: noteName,
          posX: posX,
          audioBuffer: audioBuffer,
        };

        const newTracks = new Map(prev);
        const updatedTrack = { ...targetTrack };

        const newNotes = new Map(targetTrack.notes);
        newNotes.set(newNoteId, newNote);

        updatedTrack.notes = newNotes;

        newTracks.set(trackId, updatedTrack);

        return newTracks;
      });

      return tracks;
    },
    [tracks]
  );

  const getTracksInfo = useCallback(() => {
    return tracks;
  }, [tracks]);

  const getTrackFromIndex = useCallback(
    (index: number) => {
      const tracksArray = Array.from(tracks.values());
      return tracksArray[index];
    },
    [tracks]
  );

  const contextValue = useMemo(
    () => ({
      addTrack,
      deleteTrack,
      addNote,
      getTracksInfo,
      getTrackFromIndex,
    }),
    [addTrack, deleteTrack, addNote, getTracksInfo, getTrackFromIndex]
  );

  return (
    <TrackDataStoreContext.Provider value={contextValue}>{children}</TrackDataStoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTrackDataStore = () => {
  const context = useContext(TrackDataStoreContext);
  if (!context) {
    throw new Error("useTrackDataStore must be used within an TrackDataStoreProvider");
  }
  return context;
};

export default TrackDataStoreProvider;
