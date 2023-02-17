#!/usr/bin/env bash

# This script needs :
# - node >= 16
# - pv (pipe viewer for progress bar)
# - some commons tools (wc, awk, shuf, fallocate, shred, mkfs.ext4, ...)

export WORKING_DIRECTORY=/media/tmp
export FS_FILE=$(pwd)/tmp_fs

export OPERATOR_1_FILE=$OPERATOR_1_DIRECTORY/data_operator_1.csv
export OPERATOR_2_FILE=$OPERATOR_2_DIRECTORY/data_operator_2.csv
export OPERATOR_3_FILE=$OPERATOR_3_DIRECTORY/data_operator_3.csv
export REGISTRY_FILE=$WORKING_DIRECTORY/data_registry.csv
export REGISTRY_FINAL_FILE=$REGISTRY_DIRECTORY/data_registry_final.csv

generate() {
    echo "[generate] start generating phone file"
    node phone.js
    echo "[generate] done"
}

shuffle_registry() {
    echo "[shuffle] start"
    SIZE=$(wc -l $REGISTRY_FILE | awk '{ print $1 }')
    split -l 1000000 --filter='shuf' $REGISTRY_FILE | pv -ptl -s$SIZE > $REGISTRY_FINAL_FILE && rm $REGISTRY_FILE
    echo "[shuffle] done"
}

mount_tmp() {
  echo "[prepare] Mounting tmpfs"
  fallocate -l 96G $FS_FILE
  mkfs.ext4 $FS_FILE
  sudo mkdir -p $WORKING_DIRECTORY
  sudo mount $FS_FILE $WORKING_DIRECTORY
  sudo chown -R $(whoami):users $WORKING_DIRECTORY
}

umount_tmp() {
  echo "[cleaning] Unmounting tmpfs"
  sudo umount $WORKING_DIRECTORY
  shred -vu -n1 $FS_FILE
}

checks() {
  OP1_WC=$(wc -l $OPERATOR_1_FILE)
  OP2_WC=$(wc -l $OPERATOR_2_FILE)
  OP3_WC=$(wc -l $OPERATOR_3_FILE)
  RPC_WC=$(wc -l $REGISTRY_FINAL_FILE)
  echo "Operator 1: $OP1_WC"
  echo "Operator 2: $OP2_WC"
  echo "Operator 3: $OP3_WC"
  echo "Registry  : $RPC_WC"
}

start() {
  mount_tmp && \
  generate && \
  shuffle_registry && \
  ls -l $WORKING_DIRECTORY && \
  umount_tmp && \
  checks
}

"$@"
