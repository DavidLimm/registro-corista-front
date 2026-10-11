let ouvintes = [];
let toasts = [];
let proximoId = 1;

function notificar() {
  ouvintes.forEach((ouvinte) => ouvinte(toasts));
}

function remover(id) {
  toasts = toasts.filter((item) => item.id !== id);
  notificar();
}

function adicionar(tipo, mensagem) {
  const id = proximoId++;
  toasts = [...toasts, { id, tipo, mensagem }];
  notificar();
  setTimeout(() => remover(id), 5000);
}

export function inscrever(ouvinte) {
  ouvintes.push(ouvinte);
  ouvinte(toasts);
  return () => {
    ouvintes = ouvintes.filter((item) => item !== ouvinte);
  };
}

export function removerToast(id) {
  remover(id);
}

export const toast = {
  sucesso: (mensagem) => adicionar('sucesso', mensagem),
  erro: (mensagem) => adicionar('erro', mensagem),
  aviso: (mensagem) => adicionar('aviso', mensagem),
};
