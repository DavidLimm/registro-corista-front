export function aplicarErros(erro, marcarCampo, mostrarAviso) {
  if (erro.campos?.length) {
    erro.campos.forEach((item) => marcarCampo(item.campo, item.mensagem));
  } else {
    mostrarAviso(erro.detalhe);
  }
}
