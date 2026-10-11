import { z } from 'zod';

export const schemaAgrupamento = z
  .object({
    tipo: z.enum(['CAMPO_MISSIONARIO', 'FILIAL', 'SETOR', 'AREA']),
    nome: z.string().max(150).optional().or(z.literal('')),
    numero: z.union([z.string(), z.number()]).optional().or(z.literal('')),
    pais: z.string().max(100).optional().or(z.literal('')),
  })
  .superRefine((valores, ctx) => {
    const { tipo, nome, numero, pais } = valores;

    if ((tipo === 'CAMPO_MISSIONARIO' || tipo === 'FILIAL' || tipo === 'SETOR') && !nome) {
      ctx.addIssue({ code: 'custom', path: ['nome'], message: 'Obrigatório para este tipo de agrupamento.' });
    }

    if (tipo === 'CAMPO_MISSIONARIO' && !pais) {
      ctx.addIssue({ code: 'custom', path: ['pais'], message: 'Obrigatório para campo missionário.' });
    }

    if (tipo === 'SETOR' || tipo === 'AREA') {
      if (!numero) {
        ctx.addIssue({ code: 'custom', path: ['numero'], message: 'Obrigatório para este tipo de agrupamento.' });
      } else if (Number(numero) <= 0) {
        ctx.addIssue({ code: 'custom', path: ['numero'], message: 'Deve ser maior que zero.' });
      }
    }
  });

export function construirPayloadAgrupamento({ tipo, nome, numero, pais }) {
  const payload = { tipo };
  if (tipo === 'CAMPO_MISSIONARIO') {
    payload.nome = nome;
    payload.pais = pais;
  } else if (tipo === 'FILIAL') {
    payload.nome = nome;
  } else if (tipo === 'SETOR') {
    payload.nome = nome;
    payload.numero = Number(numero);
  } else if (tipo === 'AREA') {
    payload.numero = Number(numero);
  }
  return payload;
}
