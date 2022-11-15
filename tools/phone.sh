#!/usr/bin/env bash
export OPERATOR_1_FILE=op1.csv
export OPERATOR_2_FILE=op2.csv
export OPERATOR_3_FILE=op3.csv
export REGISTRY_FINAL_FILE=registry.csv
export REGISTRY_FILE=registry.tmp.csv

generate() {
    echo "[generate] start generating phone file"
    node phone.js
    echo "[generate] done"
}

shuffle() {
    echo "[shuffle] start"
    split -l 1000000 --filter='shuf' $REGISTRY_FILE > $REGISTRY_FINAL_FILE
    echo "[shuffle] done"
}

start() {
  generate
  shuffle
}

start
