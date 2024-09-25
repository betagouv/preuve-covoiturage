#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os

# Input params checks
connection_string = os.environ['PG_CONNECTION_STRING']
delay = os.environ['DELAY']
frame = os.environ['FRAME']
update_carpool_status = os.environ['UPDATE_CARPOOL_STATUS'] == "true" or False


# In[2]:


import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""
SELECT
  _ID,
  OPERATOR_ID,
  START_DATETIME as datetime,
  EXTRACT(
    EPOCH
    FROM
      (END_DATETIME - START_DATETIME)
  )::INT AS DURATION,
  OPERATOR_JOURNEY_ID,
  OPERATOR_TRIP_ID,
  PASSENGER_IDENTITY_KEY as identity_key,
  PASSENGER_OPERATOR_USER_ID as operator_user_id,
   CASE
    WHEN PASSENGER_PHONE_TRUNC IS NULL THEN LEFT(PASSENGER_PHONE, -2)
    ELSE PASSENGER_PHONE_TRUNC
  END AS PHONE_TRUNC,
  START_POSITION,
  END_POSITION
  FROM
  CARPOOL_V2.CARPOOLS where 
    START_DATETIME >= NOW() - '{delay} hours'::INTERVAL - '{frame} hours'::INTERVAL
  AND START_DATETIME < NOW() - '{delay} hours'::INTERVAL
"""

with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# In[3]:


from helpers.apply_metods import add_overlap_columns


df_carpool['overlap_group'] = 100
df_carpool['overlap_duration'] = 0.00
df_carpool['overlap_duration_ratio'] = 1.00
grouped_tmp = df_carpool.groupby(['identity_key'],group_keys=False)

df_only_grouped_with_overlap_group_filled = grouped_tmp.apply(lambda df: add_overlap_columns(df)).reset_index(drop=True)


# In[4]:


overlap_duration_high_mask = df_only_grouped_with_overlap_group_filled['overlap_duration_ratio'] > 0.7

df_high_overlap = df_only_grouped_with_overlap_group_filled[overlap_duration_high_mask]


# In[5]:


grouped_tmp = df_high_overlap.groupby(['identity_key', 'overlap_group', 'operator_id'], group_keys=False)
df_final_result = grouped_tmp.filter(lambda x:  x['overlap_group'].count() > 1)


# In[6]:


grouped_tmp = df_final_result.groupby(['identity_key', 'overlap_group', 'operator_id'], group_keys=False)
df_row_to_keep = grouped_tmp.nth(0).reset_index(drop=False)

df_row_to_flag = df_final_result[~df_final_result._id.isin(df_row_to_keep['_id'])]

def add_conflicting_carpool_id(row): 
    # recherche de la row carpool flaguée à partir du carpool_id
    df_row_to_flag_mask = df_row_to_flag['_id'] == row['carpool_id']
    df_carpool_row_flaged = df_row_to_flag[df_row_to_flag_mask]
    conflicting_carpool_mask = (df_row_to_keep['identity_key'] == df_carpool_row_flaged['identity_key'].iloc[0]) & (df_row_to_keep['overlap_group'] == df_carpool_row_flaged['overlap_group'].iloc[0])
    row['conflicting_carpool_id'] = df_row_to_keep[conflicting_carpool_mask].iloc[0]._id
    row['conflicting_operator_journey_id'] = df_row_to_keep[conflicting_carpool_mask].iloc[0].operator_journey_id
    return row

df_labels = pd.DataFrame(df_row_to_flag[['_id', 'overlap_duration_ratio', 'operator_journey_id']])
df_labels.columns = ['carpool_id', 'overlap_duration_ratio', 'operator_journey_id']
df_labels = df_labels.assign(label='temporal_overlap_anomaly')
df_labels = df_labels.apply(lambda x: add_conflicting_carpool_id(x), axis=1)


# In[7]:


import sqlalchemy as sa
import warnings
warnings.filterwarnings("ignore")

if update_carpool_status is True:

    metadata = sa.MetaData(schema='carpool_v2')
    metadata.reflect(bind=engine)

    table = metadata.tables['carpool_v2.status']
    
    where_clause = table.c.carpool_id.in_(df_final_result['_id'].to_list())

    update_stmt = sa.update(table).where(where_clause).values(anomaly_status='failed')

    with engine.connect() as conn:
       result = conn.execute(update_stmt)
       print(f"{result.rowcount} carpools status updated to anomaly_status=failed")
       conn.commit()


# In[8]:


from sqlalchemy.dialects.postgresql import insert

def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['carpool_id', 'label'])
    conn.execute(on_duplicate_key_stmt)

df_labels.to_sql(
    name="labels",
    schema="anomaly",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict
)


# In[12]:


# update pending carpool to passed, no anomaly triggered on them
engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""
        SELECT c2s._id
        FROM carpool_v2.status c2s
        JOIN carpool_v2.carpools c2c
        ON c2c._id = c2s.carpool_id
        WHERE c2c.start_datetime < NOW() - '48 hours'::interval - '{delay} hours'::interval
        AND c2s.anomaly_status = 'pending'
"""

with engine.connect() as conn:
    df_still_pending_carpools = pd.read_sql_query(text(query), conn)


# In[14]:


import sqlalchemy as sa

if update_carpool_status is True:

    metadata = sa.MetaData(schema='carpool_v2')
    metadata.reflect(bind=engine)

    table = metadata.tables['carpool_v2.status']
    
    where_clause = table.c._id.in_(df_still_pending_carpools['_id'].to_list())

    update_stmt = sa.update(table).where(where_clause).values(anomaly_status='passed')

    with engine.connect() as conn:
        result = conn.execute(update_stmt)
        print(f"{result.rowcount} carpools status updated to anomaly_status=passed because they were not processable within 48 hours after start_datetime (carpool expired)")
        conn.commit()

