'use client'
import { useEffect, useRef, useState } from 'react'

export default function RecorderPage() {
  const [recording, setRecording] = useState(false)
  const [partial, setPartial] = useState('')
  const [patientId, setPatientId] = useState('med-42__Maria_132.456.789-10')
  const [consultationId, setConsultationId] = useState(() => new Date().toISOString().replaceAll(':','-'))
  const mediaRecorderRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => stopRecording()
  }, [])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    mediaRecorderRef.current = mr

    mr.ondataavailable = async (e) => {
      if (e.data && e.data.size > 0) {
        const form = new FormData()
        form.append('patientId', patientId)
        form.append('consultationId', consultationId)
        form.append('chunk', e.data, `chunk-${Date.now()}.webm`)
        const res = await fetch('/api/chunk', { method: 'POST', body: form })
        const data = await res.json().catch(()=>({}))
        if (data.partial) setPartial(prev => (prev ? prev + "\n" : "") + data.partial)
      }
    }

    mr.start()
    intervalRef.current = setInterval(() => {
      if (mr.state === 'recording') mr.requestData()
    }, 3000)
    setRecording(true)
  }

  const stopRecording = async () => {
    const mr = mediaRecorderRef.current
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (mr && mr.state !== 'inactive') {
      mr.stop()
      mr.stream.getTracks().forEach(t => t.stop())
    }
    setRecording(false)

    await fetch('/api/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, consultationId, title: 'Anamnese' })
    })
  }

  return (
    <div style={{maxWidth:720}}>
      <h1>Gravação de Anamnese</h1>
      <label>Paciente (pasta base):</label>
      <input value={patientId} onChange={e=>setPatientId(e.target.value)} style={{display:'block', marginBottom:8, width:'100%'}} />
      <label>Consulta ID (pasta da consulta):</label>
      <input value={consultationId} onChange={e=>setConsultationId(e.target.value)} style={{display:'block', marginBottom:8, width:'100%'}} />
      {!recording ? (
        <button onClick={startRecording} style={{padding:'8px 14px'}}>▶️ Iniciar</button>
      ) : (
        <button onClick={stopRecording} style={{padding:'8px 14px'}}>⏹️ Parar</button>
      )}
      <h3>Transcrição parcial</h3>
      <pre style={{whiteSpace:'pre-wrap', background:'#f7f7f7', padding:12, border:'1px solid #eee'}}>{partial}</pre>
    </div>
  )
}
