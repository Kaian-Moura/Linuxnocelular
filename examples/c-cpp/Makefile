.RECIPEPREFIX := >
CC = cc
CXX = c++
CFLAGS = -std=c17 -Wall -Wextra -Wpedantic
CXXFLAGS = -std=c++17 -Wall -Wextra -Wpedantic

.PHONY: all testar
all: build/energia-c build/energia-cpp

build:
>mkdir -p build

build/energia.o: src/energia.c src/energia.h | build
>$(CC) $(CFLAGS) -c src/energia.c -o build/energia.o

build/energia-c: src/main.c src/energia.h build/energia.o | build
>$(CC) $(CFLAGS) src/main.c build/energia.o -o build/energia-c

build/energia-cpp: src/main.cpp src/energia.h build/energia.o | build
>$(CXX) $(CXXFLAGS) src/main.cpp build/energia.o -o build/energia-cpp

build/teste-energia: tests/teste_energia.c src/energia.h build/energia.o | build
>$(CC) $(CFLAGS) -Isrc tests/teste_energia.c build/energia.o -o build/teste-energia

testar: build/teste-energia
>./build/teste-energia
