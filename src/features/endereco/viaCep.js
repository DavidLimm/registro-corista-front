export async function buscarCep(cep) {
  const digitos = cep.replace(/\D/g, '');
  if (digitos.length !== 8) return null;
  const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  const dados = await resposta.json();
  if (dados.erro) return null;
  return { logradouro: dados.logradouro, bairro: dados.bairro, cidade: dados.localidade, uf: dados.uf, cep: dados.cep };
}
