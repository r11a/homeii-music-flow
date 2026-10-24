// HA Assist's documented STT-only binary PCM protocol. Never runs intent/TTS.
export function pcmFrame(handler, samples) {
  const bytes = new Uint8Array(1 + samples.length * 2);
  bytes[0] = handler;
  const view = new DataView(bytes.buffer);
  samples.forEach((value, index) => view.setInt16(1 + index * 2, Math.round(Math.max(-1, Math.min(1, value)) * (value < 0 ? 32768 : 32767)), true));
  return bytes;
}

export async function dictateWithAssist(card, input) {
  const connection = card._hass?.connection;
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!globalThis.navigator?.mediaDevices?.getUserMedia || !AudioContext || !connection?.subscribeMessage || !connection?.socket) {
    throw new Error(card._m("Assist dictation requires HTTPS and microphone support.", "הכתבה ב־Assist דורשת HTTPS ותמיכה במיקרופון."));
  }
  let stream, context, source, processor, unsubscribe, timer, guard;
  let handler, ended = false, audioEnded = false, success = false;
  const finishAudio = () => {
    if (audioEnded) return;
    audioEnded = true;
    stream?.getTracks().forEach(track => track.stop());
    try { processor?.disconnect(); source?.disconnect(); } catch (_) { /* already closed */ }
    if (handler != null && connection.socket.readyState === 1) connection.socket.send(new Uint8Array([handler]));
  };
  const cleanup = () => {
    if (ended) return;
    ended = true; finishAudio(); clearTimeout(timer); clearInterval(guard);
    try { unsubscribe?.(); } catch (_) { /* disconnected */ }
    context?.close().catch(() => {});
    if (card._voiceRecognition === control) card._voiceRecognition = null;
  };
  const control = { abort:cleanup, stop:finishAudio };
  card._voiceRecognition?.abort?.();
  card._voiceRecognition = control;
  try {
    context = new AudioContext();
    await context.resume();
    stream = await globalThis.navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true},video:false});
    if (ended || !input?.isConnected) { stream.getTracks().forEach(track=>track.stop()); cleanup(); return; }
    source = context.createMediaStreamSource(stream);
    processor = context.createScriptProcessor(2048, 1, 1);
    processor.onaudioprocess = event => {
      if (ended || audioEnded || handler == null) return;
      if (connection.socket.readyState !== 1) { cleanup(); card._toastError(card._m("Assist connection was lost.","החיבור ל־Assist נותק.")); return; }
      connection.socket.send(pcmFrame(handler,event.inputBuffer.getChannelData(0)));
    };
    unsubscribe = await connection.subscribeMessage(event => {
      if (ended) return;
      if (event.type === "run-start") {
        const id=event.data?.runner_data?.stt_binary_handler_id;
        if (!Number.isInteger(id) || id<0 || id>255) { cleanup(); card._toastError(card._m("Assist did not provide an audio input.","Assist לא סיפק ערוץ להקלטה.")); return; }
        handler=id;
        source.connect(processor); processor.connect(context.destination);
        card._toast(card._m("Listening through Assist — tap the microphone to finish.","מקשיב דרך Assist — לחץ שוב על המיקרופון לסיום."));
        timer=setTimeout(finishAudio,15000);
      } else if (event.type === "stt-end") {
        const text=String(event.data?.stt_output?.text || "").trim();
        if (text && input.isConnected) { input.value=text; card._state.mobileAnnouncementText=text; success=true; }
        cleanup();
        if (!success) card._toastError(card._i18n("ui.no_speech_was_captured"));
      } else if (event.type === "error") {
        cleanup(); card._toastError(card._m("Assist transcription failed. Check your configured speech-to-text pipeline.","התמלול ב־Assist נכשל. בדוק את מסלול הזיהוי הקולי שהוגדר."));
      } else if (event.type === "run-end") {
        finishAudio();
        // HA may send timeout/error immediately after run-end.
        clearTimeout(timer);timer=setTimeout(()=>{cleanup();if(!success)card._toastError(card._i18n("ui.no_speech_was_captured"));},100);
      }
    }, {type:"assist_pipeline/run",start_stage:"stt",end_stage:"stt",input:{sample_rate:context.sampleRate},timeout:30,...(card._config?.announcement_assist_pipeline?{pipeline:card._config.announcement_assist_pipeline}:{})});
    if (ended) { unsubscribe?.(); return; }
    let elapsed=0;
    guard=setInterval(()=>{
      elapsed+=250;
      if (!input.isConnected) cleanup();
      else if (elapsed>=35000) { cleanup();card._toastError(card._m("Assist transcription timed out.","זמן ההמתנה לתמלול הסתיים.")); }
    },250);
  } catch (error) { cleanup(); throw error; }
}
