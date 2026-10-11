# Segurança e procedimentos de risco

Não publique credenciais, chaves privadas, imagens pessoais nem dumps integrais de partições. Não execute um comando perigoso para confirmar uma falha da documentação.

Se uma instrução pode apagar dados ou inutilizar um modelo, registre o trecho, a condição ausente e uma fonte técnica, sem dados sensíveis. Abra issue pública apenas quando o relato não expuser vulnerabilidade explorável nem segredo.

Depois de publicar este repositório no GitHub, o mantenedor deve habilitar **Private vulnerability reporting** e anunciar esse canal. Se disponível, use Security → Report a vulnerability para relatos sensíveis. Esta entrega local não inventa um e-mail de segurança nem presume um canal privado habilitado.

O assistente é estático e não executa comandos. Dependências de build e componentes devem ser revisados periodicamente. O suporte e a segurança de kernels/firmware dos aparelhos são responsabilidade de cada port e combinação documentada, não uma garantia do build deste site.

## Dependência de build com alerta aberto

A auditoria de 10/10/2026, preservada em `reports/npm-audit.json`, aponta o aviso [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) em `braces`, uma dependência transitiva das ferramentas. Na consulta, não havia versão corrigida publicada. Os 30 registros de severidade alta incluem a propagação desse mesmo aviso pela árvore; não representam 30 falhas independentes. Não declaramos a instalação livre de vulnerabilidades.

O alerta trata de exaustão da pilha ao processar padrões profundamente aninhados. Revise contribuições antes de construir código/MDX não confiável e mantenha o servidor de desenvolvimento restrito ao loopback. O artefato publicado é estático; isso não elimina a necessidade de auditar também os arquivos JavaScript distribuídos. A recomendação automática de downgrade do npm não foi aplicada às cegas. Quando houver correção upstream, atualize o lockfile e repita build, links, busca e testes de navegador.
