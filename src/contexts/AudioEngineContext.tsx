import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  useEffect,
} from "react";
//import { useTrackDataStore } from "./TrackDataStoreContext";

// コンテキストの型定義
type AudioContextType = {
  playTone: (frequency: number) => void;
  playPiano: (frequency: number) => void;
  initialize: () => Promise<void>;
  getAudioBufferFromFile: (file: File) => Promise<AudioBuffer>;
  play: (buffer: AudioBuffer, when: number, offset: number, trackNode: GainNode) => void;
  getContext: () => AudioContext | null;
  // その他必要な関数を追加
};

// webkitAudioContext定義追加
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const AudioContext = createContext<AudioContextType | null>(null);

const AudioEngineProvider = ({ children }: { children: ReactNode }) => {
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

    //const newTrackNode = ctx.createGain();
    //addTrack(newTrackNode);

    // TODO: デフォルトのトラック生成はプロバイダー内で行えないため、DawEditorのuseEffectで行う
  }, [getContext]);

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

  useEffect(() => {
    initialize();
  }, [initialize]);

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
    }),
    [initialize, playTone, playPiano, getAudioBufferFromFile, play, getContext]
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
