#include <stdio.h>
#include "energia.h"

static int perto(double observado, double esperado) {
    double diferenca = observado - esperado;
    return diferenca > -0.000001 && diferenca < 0.000001;
}

int main(void) {
    if (!perto(energia_wh(10.0, 2.0), 20.0) ||
        !perto(energia_wh(5.0, 2.5), 12.5) ||
        !perto(energia_wh(0.0, 12.0), 0.0)) {
        fprintf(stderr, "Falha: energia não corresponde ao valor esperado.\n");
        return 1;
    }
    puts("Três casos de energia passaram.");
    return 0;
}
