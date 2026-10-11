# Execute com: bash relatorio.sh "minhas notas.txt"
ajuda() {
    printf '%s\n' 'Uso: bash relatorio.sh ARQUIVO_DE_TEXTO'
    printf '%s\n' 'Conta linhas e anotações sem modificar a entrada.'
}

if [[ $# -eq 1 && $1 == --help ]]; then
    ajuda
    exit 0
fi

if [[ $# -ne 1 ]]; then
    ajuda >&2
    exit 2
fi

relatorio_entrada=$1
if [[ ! -f "$relatorio_entrada" || ! -r "$relatorio_entrada" || -L "$relatorio_entrada" ]]; then
    printf '%s\n' 'Erro: escolha um arquivo regular legível, sem link simbólico.' >&2
    exit 1
fi

relatorio_linhas=0
relatorio_anotacoes=0
if ! {
    while IFS= read -r relatorio_linha || [[ -n "$relatorio_linha" ]]; do
        relatorio_linhas=$((relatorio_linhas + 1))
        if [[ "$relatorio_linha" =~ [^[:space:]] ]]; then
            relatorio_anotacoes=$((relatorio_anotacoes + 1))
        fi
    done
} < "$relatorio_entrada"; then
    printf '%s\n' 'Erro: não foi possível ler a entrada.' >&2
    exit 1
fi

printf 'Arquivo: %s\n' "$relatorio_entrada"
printf 'Linhas: %d\n' "$relatorio_linhas"
printf 'Anotações: %d\n' "$relatorio_anotacoes"
exit 0
