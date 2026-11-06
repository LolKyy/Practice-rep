# Сравнение озвучки с референсом: темп (слоги/с), паузы/мин, размах интонации (полутона), динамика.
# .venv/bin/python tools/voice-analyze.py a.wav b.wav   (16 кГц моно; нужна ~/models/sherpa-onnx-zipformer-ru-2024-09-18 из setup-скрипта, librosa)
import sys, numpy as np, librosa, sherpa_onnx, soundfile as sf, json
M="/root/models/sherpa-onnx-zipformer-ru-2024-09-18/"
rec=sherpa_onnx.OfflineRecognizer.from_transducer(encoder=M+"encoder.onnx",decoder=M+"decoder.onnx",joiner=M+"joiner.onnx",tokens=M+"tokens.txt",num_threads=4,decoding_method="greedy_search")
for f in sys.argv[1:]:
    y,sr=sf.read(f); dur=len(y)/sr
    # transcribe in 25s chunks
    words=0; text=[]; syl=0
    for a in range(0,len(y),15*sr):
        s=rec.create_stream(); s.accept_waveform(sr,y[a:a+15*sr].astype(np.float32)); rec.decode_stream(s); t=s.result.text; text.append(t)
    T=" ".join(text); words=len(T.split()); syl=sum(T.lower().count(v) for v in "аеёиоуыэюя")
    iv=librosa.effects.split(y,top_db=35,frame_length=1024,hop_length=256); speech=sum(b-a for a,b in iv)/sr
    gaps=[(iv[i+1][0]-iv[i][1])/sr for i in range(len(iv)-1)]; gaps=[g for g in gaps if g>0.12]
    f0,vf,_=librosa.pyin(y[:sr*90].astype(float),fmin=70,fmax=450,sr=sr,frame_length=1024,hop_length=320)
    f0=f0[~np.isnan(f0)]; st=12*np.log2(f0/np.median(f0))
    rms=librosa.feature.rms(y=y,frame_length=1024,hop_length=256)[0]; db=20*np.log10(rms[rms>1e-3]+1e-9)
    print(f"\n== {f}: {dur:.1f}s, speech {speech:.1f}s")
    print(f" words {words}, words/s(speech) {words/speech:.2f}, syll/s(speech) {syl/speech:.2f}")
    print(f" pauses>0.12s: {len(gaps)}, median {np.median(gaps):.2f}s, per min {len(gaps)/dur*60:.0f}")
    print(f" F0 median {np.median(f0):.0f}Hz, range p5-p95 {np.percentile(st,5):.1f}..{np.percentile(st,95):.1f} st, std {st.std():.2f} st")
    print(f" loudness dyn p10-p90 {np.percentile(db,90)-np.percentile(db,10):.1f} dB")
    print(" text:",T[:900])
