export default function Home() {
  return (
    <div>
      <h1>✅ MCI Panel — Express</h1>
      <p>Starter do painel. Vá até <a href="/recorder">/recorder</a> para gravar.</p>
      <ul>
        <li>API saúde: <code>/api/health</code></li>
        <li>Chunk upload: <code>POST /api/chunk</code></li>
        <li>Finalizar: <code>POST /api/finish</code></li>
      </ul>
      <p><b>DATA_PATH:</b> {process.env.DATA_PATH || '/app/data/clinic'}</p>
    </div>
  );
}
