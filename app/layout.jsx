export const metadata = { title: 'MCI Panel', description: 'Painel Express' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{fontFamily:'ui-sans-serif,system-ui', margin:0}}>
        <header style={{padding:'12px 16px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
          <div><b>MCI</b> · Painel</div>
          <nav style={{display:'flex', gap:12}}>
            <a href="/" style={{textDecoration:'none'}}>Home</a>
            <a href="/recorder" style={{textDecoration:'none'}}>Gravar</a>
          </nav>
        </header>
        <main style={{padding:16}}>{children}</main>
      </body>
    </html>
  );
}
