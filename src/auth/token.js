let token = null;
let aoExpirarSessao = () => {};

export function definirToken(novoToken) {
  token = novoToken;
}

export function obterToken() {
  return token;
}

export function definirAoExpirarSessao(callback) {
  aoExpirarSessao = callback;
}

export function notificarSessaoExpirada() {
  aoExpirarSessao();
}
