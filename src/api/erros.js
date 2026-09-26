export function extrairMensagemErro(erro) {
  return erro?.detalhe ?? 'Não foi possível completar a operação.';
}

export function extrairErrosDeCampo(erro) {
  return erro?.campos ?? [];
}
