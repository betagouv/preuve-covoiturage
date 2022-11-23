#!/usr/bin/env bash

# This script needs :
# - node >= 16
# - pigz (multithread gzip)
# - pv (pipe viewer for progress bar)
# - some commons tools (wc, awk, shuf, fallocate, shred, mkfs.ext4, ...)

export WORKING_DIRECTORY=/media/tmp
export FS_FILE=$(pwd)/tmp_fs

export OPERATOR_1_DIRECTORY=$(pwd)
export OPERATOR_1_FILE=$WORKING_DIRECTORY/data_operator_1.csv

export OPERATOR_2_DIRECTORY=$(pwd)
export OPERATOR_2_FILE=$WORKING_DIRECTORY/data_operator_2.csv

export OPERATOR_3_DIRECTORY=$(pwd)
export OPERATOR_3_FILE=$WORKING_DIRECTORY/data_operator_3.csv

export REGISTRY_DIRECTORY=$(pwd)
export REGISTRY_FILE=$WORKING_DIRECTORY/data_registry.csv
export REGISTRY_FINAL_FILE=$REGISTRY_DIRECTORY/data_registry_final.csv
export GZIP_CMD=pigz

generate() {
    echo "[generate] start generating phone file"
    node phone.js
    echo "[generate] done"
}

shuffle_registry() {
    echo "[shuffle] start"
    SIZE=$(wc -l $REGISTRY_FILE | awk '{ print $1 }')
    split -l 1000000 --filter='shuf' $REGISTRY_FILE | pv -ptl -s$SIZE | $GZIP_CMD > $REGISTRY_FINAL_FILE.gz && rm $REGISTRY_FILE
    echo "[shuffle] done"
}

share_operator() {
  echo "[share] start for operator 1"
  $GZIP_CMD $OPERATOR_1_FILE && mv $OPERATOR_1_FILE.gz $OPERATOR_1_DIRECTORY
  echo "[share] start for operator 2"
  $GZIP_CMD $OPERATOR_2_FILE && mv $OPERATOR_2_FILE.gz $OPERATOR_2_DIRECTORY
  echo "[share] start for operator 3"
  $GZIP_CMD $OPERATOR_3_FILE && mv $OPERATOR_3_FILE.gz $OPERATOR_3_DIRECTORY
  echo "[share] done"
}

mount_tmp() {
  echo "[prepare] Mounting tmpfs"
  fallocate -l 64G $FS_FILE
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

start() {
  mount_tmp && \
  generate && \
  share_operator && \
  shuffle_registry && \
  ls -l $WORKING_DIRECTORY && \
  umount_tmp
}

"$@"
