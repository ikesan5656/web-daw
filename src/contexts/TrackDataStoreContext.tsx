import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// コンテキストの型定義
type TrackDataStoreContextType = {
  addTrack: () => void;
  deleteTrack: (id: string) => void;
  getTracksInfo: () => AudioTrack[];
  // その他必要な関数を追加
};

interface AudioNote {
  id: string;
}

export interface AudioTrack {
  id: string;
  trackName: string;
  nodes: AudioNote[];
}

const defaultTrack: AudioTrack = {
  id: "default_id",
  trackName: "default_track",
  nodes: [],
};

const TrackDataStoreContext = createContext<TrackDataStoreContextType | null>(null);

const TrackDataStoreProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>([defaultTrack]);

  const addTrack = useCallback(() => {
    setTracks((prev) => {
      const newTrack: AudioTrack = {
        id: crypto.randomUUID(),
        trackName: `track_${prev.length + 1}`,
        nodes: [],
      };
      return [...prev, newTrack];
    });
  }, []);

  const deleteTrack = useCallback((id: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== id));
  }, []);

  const getTracksInfo = useCallback(() => {
    return tracks;
  }, [tracks]);

  const contextValue = useMemo(
    () => ({
      addTrack,
      deleteTrack,
      getTracksInfo,
    }),
    [addTrack, deleteTrack, getTracksInfo]
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
