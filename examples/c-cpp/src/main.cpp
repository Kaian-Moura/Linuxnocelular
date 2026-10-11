#include <iomanip>
#include <iostream>
#include <vector>
#include "energia.h"

int main() {
    const double watts = 10.0;
    const std::vector<double> duracoes = {1.0, 2.0, 3.0};
    std::cout << std::fixed << std::setprecision(2);
    for (double horas : duracoes) {
        std::cout << horas << " h a " << watts << " W: "
                  << energia_wh(watts, horas) << " Wh\n";
    }
    return 0;
}
