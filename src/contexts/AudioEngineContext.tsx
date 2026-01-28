import { AudioNote, AudioTrack } from "@/types/project";
import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
//import { useTrackDataStore } from "./TrackDataStoreContext";

// コンテキストの型定義
export interface AudioContextType {
  playTone: (frequency: number) => void;
  playPiano: (frequency: number) => void;
  initialize: () => Promise<void>;
  getAudioBufferFromFile: (file: File) => Promise<AudioBuffer>;
  play: (buffer: AudioBuffer, when: number, offset: number, trackNode: GainNode) => void;
  getContext: () => AudioContext | null;
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
}

/*const defaultNotes = new Map<string, AudioNote>([
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
]);*/

// webkitAudioContext定義追加
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const AudioContext = createContext<AudioContextType | null>(null);

const AudioEngineProvider = ({ children }: { children: ReactNode }) => {
  /*const [tracks, setTracks] = useState<Map<string, AudioTrack>>(() => {
    //Contextを作成 (SSR対策でwindowチェック)
    if (typeof window === "undefined") return new Map();

    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();

    // 最初のトラック用の Node を作成（この辺りはプロジェクト選択機能で解決予定）
    const initialId = crypto.randomUUID();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // 初期Mapを生成して返す
    return new Map([
      [
        initialId,
        {
          id: initialId,
          trackName: "Track 1",
          trackNode: gainNode, // 最初から Node が入る
          notes: new Map(),
        },
      ],
    ]);
  });*/
  const [tracks, setTracks] = useState<Map<string, AudioTrack>>(new Map());

  // ポイント1: AudioContextの実体は useRef で持つ (Stateにしない)
  // これにより、AudioContextの中身が変わってもReactの再描画は発生しない
  //const { addTrack } = useTrackDataStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // AudioContextを取得、または生成するヘルパー関数
  const getContext = useCallback(() => {
    // コンテキストが存在しない場合は新規作成
    if (!audioCtxRef.current) {
      // Next.jsなどのSSR対策でwindowチェックを入れるのが一般的
      if (typeof window !== "undefined") {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
    }

    return audioCtxRef.current;
  }, []);

  const addTrack = useCallback(() => {
    if (!audioCtxRef.current) return;
    const newTrackNode = audioCtxRef.current.createGain();
    //newTrackNode.connect(masterGainRef.current);
    setTracks((prev) => {
      const newId = crypto.randomUUID();
      const newTrack: AudioTrack = {
        id: newId,
        trackName: `track_${prev.size + 1}`,
        trackNode: newTrackNode,
        notes: new Map<string, AudioNote>(),
      };
      const newTracks = new Map(prev);
      newTracks.set(newId, newTrack);
      return newTracks;
    });
  }, []);

  const deleteTrack = useCallback((id: string) => {
    setTracks((prev) => {
      const newTracks = new Map(prev);
      newTracks.delete(id);
      return newTracks;
    });
  }, []);

  const addNote = useCallback(
    (trackId: string, posX: number, noteName: string, audioBuffer: AudioBuffer) => {
      setTracks((prev) => {
        const targetTrack = prev.get(trackId);
        if (!targetTrack) {
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

  const initialize = useCallback(async () => {
    const ctx = getContext();

    if (!ctx) return;

    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }

    // マスターノード作成、接続（初回のみ）
    if (!masterGainRef.current) {
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
    }

    addTrack();
  }, [getContext, addTrack]);

  const play = useCallback(
    async (buffer: AudioBuffer, when: number, offset: number, trackNode: GainNode) => {
      await initialize();
      const ctx = getContext();
      if (!ctx) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // トラックのノードに接続（使い捨てのため再生の度に接続し直す）
      source.connect(trackNode);

      // 再生終了時に参照を外すクリーンアップ
      /*source.onended = () => {
        source = null;
      };*/

      source.start(when, offset);
    },
    [initialize, getContext]
  );

  // 音を鳴らす関数の例
  const playTone = useCallback(
    (frequency: number) => {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
      osc.stop(ctx.currentTime + 1);
    },
    [getContext]
  );

  const playPiano = useCallback(
    (frequency: number) => {
      const ctx = getContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // 1. 波形を「トライアングル（三角波）」にする
      // sine(丸い音)より倍音が含まれ、ピアノやフルートに近い音になります
      osc.type = "triangle";
      osc.frequency.value = frequency;

      osc.connect(gain);
      gain.connect(ctx.destination);

      // 2. ピアノ特有の「減衰」を作る（エンベロープ）
      // アタック: 鍵盤を叩いた瞬間（0秒〜0.02秒）で急激に音量を上げる
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.02); // 音量は0.5くらいに抑える

      // ディケイ: 叩いた後は、弦の振動が自然に消えるように長く減衰させる
      // 1.5秒かけて音が消えていく
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc.start(t);
      // 音が消えきるタイミングで停止
      osc.stop(t + 1.5);
    },
    [getContext]
  );

  const getAudioBufferFromFile = useCallback(
    async (file: File): Promise<AudioBuffer> => {
      const context = getContext();
      if (!context) {
        throw new Error("AudioBuffer デコード失敗");
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      return audioBuffer;
    },
    [getContext]
  );

  /*useEffect(async () => {
    await initialize();
  }, [initialize]);*/

  // ポイント3: 公開する値を useMemo で固定する
  // 依存配列が空（または固定）なので、このオブジェクトの参照は永続的に変わらない
  const contextValue = useMemo(
    () => ({
      initialize,
      playTone,
      playPiano,
      getAudioBufferFromFile,
      play,
      getContext,
      addTrack,
      deleteTrack,
      addNote,
      getTracksInfo,
      getTrackFromIndex,
    }),
    [
      initialize,
      playTone,
      playPiano,
      getAudioBufferFromFile,
      play,
      getContext,
      addTrack,
      deleteTrack,
      addNote,
      getTracksInfo,
      getTrackFromIndex,
    ]
  );

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export default AudioEngineProvider;
