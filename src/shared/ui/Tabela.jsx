export default function Tabela({ colunas, dados, chaveLinha, vazio = 'Nenhum registro encontrado.' }) {
  return (
    <div className="overflow-x-auto rounded-card border border-borda">
      <table className="w-full text-left text-sm">
        <thead className="bg-suave text-texto-suave">
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave} className="whitespace-nowrap px-4 py-3 font-medium">
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="px-4 py-6 text-center text-texto-suave">
                {vazio}
              </td>
            </tr>
          ) : (
            dados.map((linha) => (
              <tr key={chaveLinha(linha)} className="border-t border-borda">
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className="whitespace-nowrap px-4 py-3 text-texto">
                    {coluna.render ? coluna.render(linha) : linha[coluna.chave]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
