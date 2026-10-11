#include <errno.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "energia.h"

static int numero_valido(const char *texto, double maximo, double *saida) {
    char *fim;
    errno = 0;
    double valor = strtod(texto, &fim);
    if (fim == texto || *fim != '\0' || errno == ERANGE || !isfinite(valor)) {
        return 0;
    }
    if (valor < 0 || valor > maximo) {
        return 0;
    }
    *saida = valor;
    return 1;
}

int main(int argc, char **argv) {
    double watts, horas;
    if (argc != 3) {
        fprintf(stderr, "Uso: energia-c WATTS HORAS (ponto para decimal)\n");
        return 1;
    }
    if (!numero_valido(argv[1], 1000, &watts) ||
        !numero_valido(argv[2], 24, &horas)) {
        fprintf(stderr, "Use watts de 0 a 1000 e horas de 0 a 24.\n");
        return 1;
    }
    printf("Energia estimada: %.2f Wh\n", energia_wh(watts, horas));
    return 0;
}
