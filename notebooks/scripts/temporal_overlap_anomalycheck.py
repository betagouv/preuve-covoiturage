#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os

# Input params checks
connection_string = os.environ['PG_CONNECTION_STRING']
delay = os.environ['DELAY']
frame = os.environ['FRAME']
update_carpool_status = os.environ['UPDATE_CARPOOL_STATUS'] == "true" or False


import pandas as pd
from sqlalchemy import create_engine, text
from helpers.apply_metods import add_overlap_columns 

engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""
SELECT cc._id, operator_id, cc.datetime, cc.duration, cc.identity_id, cc.operator_journey_id, start_geo_code, end_geo_code, 
cc.trip_id,
cc.is_driver,
ci.identity_key,
ci.operator_user_id,
CASE 
      WHEN ci.phone_trunc IS NULL THEN left(ci.phone, -2)
      ELSE ci.phone_trunc
      END AS phone_trunc,
cc.start_position, 
cc.end_position
FROM CARPOOL.CARPOOLS CC
JOIN carpool.identities ci on cc.identity_id = ci._id
    WHERE CC.DATETIME >= NOW() - '{delay} hours'::interval - '{frame} hours'::interval
	AND CC.DATETIME < NOW() - '{delay} hours'::interval and
      cc.is_driver = false 
"""

with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# In[4]:


df_carpool['overlap_group'] = 100
df_carpool['overlap_duration'] = 0
df_carpool['overlap_duration_ratio'] = 1
grouped_tmp = df_carpool.groupby(['identity_key'],group_keys=False)

df_only_grouped_with_overlap_group_filled = grouped_tmp.apply(lambda df: add_overlap_columns(df, True)).reset_index(drop=True)


# In[5]:


overlap_duration_high_mask = df_only_grouped_with_overlap_group_filled['overlap_duration_ratio'] > 0.7

df_high_overlap = df_only_grouped_with_overlap_group_filled[overlap_duration_high_mask]


# In[6]:


grouped_tmp = df_high_overlap.groupby(['identity_key', 'overlap_group', 'operator_id'], group_keys=False)
df_final_result = grouped_tmp.filter(lambda x:  x['overlap_group'].count() > 1)


# In[37]:


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

df_labels = pd.DataFrame(df_row_to_flag[['_id', 'overlap_duration_ratio']])
df_labels.columns = ['carpool_id', 'overlap_duration_ratio']
df_labels = df_labels.assign(label='temporal_overlap_anomaly')
df_labels = df_labels.apply(lambda x: add_conflicting_carpool_id(x), axis=1)


# In[ ]:


import sqlalchemy as sa


if update_carpool_status is True:
    metadata = sa.MetaData(schema='carpool')
    metadata.reflect(bind=engine)

    table = metadata.tables['carpool.carpools']
    
    print(f"Updating {len(df_labels['carpool_id'])} carpools with anomaly_error")

    where_clause = table.c._id.in_(df_labels['carpool_id'].to_list())

    update_stmt = sa.update(table).where(where_clause).values(status='anomaly_error')

    with engine.connect() as conn:
        result = conn.execute(update_stmt)
        conn.commit()


# In[41]:


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

