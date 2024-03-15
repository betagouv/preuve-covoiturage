#!/usr/bin/env python3

import sys
import pandas as pd
import numpy as np

# must be run from the root folder of the APDF files
# find . -name "*.xlsx" | while read line; do ./checker.py $line; done >> run_$(date +%s).txt

# Read the piped input as command line arguments
args = sys.stdin.read().splitlines()
sys.argv.extend(args)

if len(sys.argv) < 2:
  print("No filename provided.")
  sys.exit()

for filename in filter(lambda x: x.endswith("xlsx"), sys.argv[1:]):
  # print(f'Checking {filename}...')

  # Split the filename into parts
  parts = filename.split("/")[-1].split("-")
  year = parts[1]
  month = parts[2]
  campaign = parts[3]
  operator = parts[4]
  file_cnt = int(parts[5])
  file_sub = int(parts[6])
  file_sum = float(parts[7]) / 100

  # Read the file and get the 2nd sheet into a DataFrame
  try:
    df = pd.read_excel(filename, sheet_name=1, usecols="R", names=['amount'], header=0, dtype=np.float64)
    all_sum = round(df['amount'].sum(), 2)
    all_count = df['amount'].count()
    sub_count = df.loc[df['amount'] > 0, 'amount'].count()

    # Checks
    check_1: bool = all_sum == file_sum
    check_2: bool = all_count == file_cnt
    check_3: bool = sub_count == file_sub

    # All checks must pass
    check_f = check_1 and check_2 and check_3

    # Create a table with the desired data
    fields = ','.join(map(str, [year, month, campaign, operator, check_1, check_2, check_3, all_count, sub_count, all_sum, file_cnt, file_sub, file_sum]))
    if check_f:
      print(f'OK,{fields}', flush=True)
    else:
      print(f'KO,{fields}', flush=True)
      # print(f'''
      # File: {filename}
      # Check 1: {check_1}
      # Check 2: {check_2}
      # Check 3: {check_3}
      # Sum: {all_sum}€ - {file_sum}€ = {all_sum - file_sum}€
      # Count: {all_count} - {file_cnt} = {all_count - file_cnt} trajets dans le fichier
      # Subsidised: {sub_count} - {file_sub} = {sub_count - file_sub} trajets dans le fichier
      # ''')
  except Exception as e:
    fields = ','.join([year, month, campaign, operator])
    print(e, flush=True)
    print(f'ERROR,{fields},,,,,,,,,', flush=True)
