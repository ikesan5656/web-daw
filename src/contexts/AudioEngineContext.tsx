import { createContext, useContext, useRef, useCallback, useMemo, type ReactNode} from 'react';

// コンテキストの型定義
type AudioContextType = {
  playTone: (frequency: number) => void;
  playPiano: (frequency: number) => void;
  initialize: () => Promise<void>;
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
  const audioCtxRef = useRef<AudioContext | null>(null);

  // AudioContextを取得、または生成するヘルパー関数
  const getContext = useCallback(() => {
    if (!audioCtxRef.current) {
      // Next.jsなどのSSR対策でwindowチェックを入れるのが一般的
      if (typeof window !== 'undefined') {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
    }
    return audioCtxRef.current;
  }, []);

  // ポイント2: ユーザー操作でAudioContextをResume/Startさせる関数
  const initialize = useCallback(async () => {
    const ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }, [getContext]);

  // 音を鳴らす関数の例
  const playTone = useCallback((frequency: number) => {
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
  }, [getContext]);

  const playPiano = useCallback((frequency: number) => {
    const ctx = getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 1. 波形を「トライアングル（三角波）」にする
    // sine(丸い音)より倍音が含まれ、ピアノやフルートに近い音になります
    osc.type = 'triangle'; 
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
  }, [getContext]);

  // ポイント3: 公開する値を useMemo で固定する
  // 依存配列が空（または固定）なので、このオブジェクトの参照は永続的に変わらない
  const contextValue = useMemo(() => ({
    initialize,
    playTone,
    playPiano
  }), [initialize, playTone, playPiano]);

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioEngineProvider;