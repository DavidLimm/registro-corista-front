import { z } from 'zod';

const CEP_REGEX = /^\d{5}-?\d{3}$/;

const schemaEndereco = z
  .object({
    logradouro: z.string().max(150).optional().or(z.literal('')),
    numero: z.string().max(10).optional().or(z.literal('')),
    complemento: z.string().max(100).optional().or(z.literal('')),
    bairro: z.string().max(100).optional().or(z.literal('')),
    cidade: z.string().max(100).optional().or(z.literal('')),
    uf: z.string().max(2).optional().or(z.literal('')),
    cep: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((valor) => !valor || CEP_REGEX.test(valor), 'CEP inválido.'),
  })
  .superRefine((valores, ctx) => {
    const preenchido = Object.values(valores).some((valor) => valor);
    if (!preenchido) return;
    if (!valores.logradouro) ctx.addIssue({ code: 'custom', path: ['logradouro'], message: 'Obrigatório.' });
    if (!valores.bairro) ctx.addIssue({ code: 'custom', path: ['bairro'], message: 'Obrigatório.' });
    if (!valores.cidade) ctx.addIssue({ code: 'custom', path: ['cidade'], message: 'Obrigatório.' });
    if (!valores.uf || valores.uf.length !== 2) {
      ctx.addIssue({ code: 'custom', path: ['uf'], message: 'Use a sigla com 2 letras.' });
    }
  });

export const schemaCongregacao = z.object({
  subdivisaoId: z.string().min(1, 'Selecione a subdivisão.'),
  nome: z.string().min(1, 'Obrigatório.').max(150),
  endereco: schemaEndereco.optional(),
});

export function construirPayloadCongregacao(valores) {
  const enderecoPreenchido = valores.endereco && Object.values(valores.endereco).some((valor) => valor);
  return {
    subdivisaoId: valores.subdivisaoId,
    nome: valores.nome,
    ...(enderecoPreenchido
      ? {
          endereco: {
            logradouro: valores.endereco.logradouro,
            numero: valores.endereco.numero || undefined,
            complemento: valores.endereco.complemento || undefined,
            bairro: valores.endereco.bairro,
            cidade: valores.endereco.cidade,
            uf: valores.endereco.uf.toUpperCase(),
            cep: valores.endereco.cep || undefined,
          },
        }
      : {}),
  };
}
