export const PAPEL_ROTULOS = {
  ADMIN: 'Administrador',
  PASTOR_ADMIN: 'Pastor geral',
  PASTOR: 'Pastor',
  PRESBITERO: 'Presbítero',
  LIDER_MOCIDADE: 'Líder da mocidade',
  LIDER_ADOLESCENTES: 'Líder dos adolescentes',
  LIDER_JOVENS: 'Líder dos jovens',
  DIRIGENTE_UNIAO: 'Dirigente da união',
  LIDERANCA_GRUPO_JOVEM: 'Liderança do grupo de jovens',
  DIRIGENTE_CAMPANHA: 'Dirigente de campanha',
  APOIO_ADOLESCENTES: 'Apoio',
  APOIO_JOVENS: 'Apoio',
  MAESTRO_ADOLESCENTES: 'Maestro',
  MAESTRO_JOVENS: 'Maestro',
  CORISTA_ADOLESCENTES: 'Corista',
  CORISTA_JOVENS: 'Corista',
};

export function rotuloPapel(roleComPrefixo) {
  const chave = roleComPrefixo.replace(/^ROLE_/, '');
  return PAPEL_ROTULOS[chave] ?? chave;
}

export function ehPapel(roleOuPermissao) {
  return roleOuPermissao.startsWith('ROLE_');
}
