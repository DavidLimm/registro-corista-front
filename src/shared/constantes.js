export const TIPO_AGRUPAMENTO = {
  CAMPO_MISSIONARIO: 'Campo Missionário',
  FILIAL: 'Filial',
  SETOR: 'Setor',
  AREA: 'Área',
};

export const STATUS_PESSOA = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  AFASTADO: 'Afastado',
  INATIVO: 'Inativo',
};

export const FAIXA_ETARIA = {
  ADOLESCENTE: 'Adolescente',
  JOVEM: 'Jovem',
};

export const LISTA_CLASSIFICACAO = {
  ADOLESCENTE: 'Adolescente',
  JOVEM: 'Jovem',
};

export const TIPO_VOZ = {
  BAIXO: 'Baixo',
  CONTRALTO: 'Contralto',
  SOPRANO: 'Soprano',
  TENOR: 'Tenor',
};

export const TAMANHO_CAMISA = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

export const STATUS_SOLICITACAO = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  NEGADA: 'Negada',
};

export const STATUS_ROLE = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
};

export function rotuloAgrupamento(agrupamento) {
  switch (agrupamento.tipo) {
    case 'AREA':
      return `Área ${agrupamento.numero}`;
    case 'SETOR':
      return `Setor ${agrupamento.numero} – ${agrupamento.nome}`;
    case 'FILIAL':
      return `Filial ${agrupamento.nome}`;
    case 'CAMPO_MISSIONARIO':
      return `${agrupamento.nome} (${agrupamento.pais})`;
    default:
      return agrupamento.nome ?? agrupamento.id;
  }
}
