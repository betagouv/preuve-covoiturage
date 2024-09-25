#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import os

# Input params
connection_string = os.environ['PG_CONNECTION_STRING']
delay = os.environ['DELAY']
frame = os.environ['FRAME']
update_carpool_status = os.environ['UPDATE_CARPOOL_STATUS'] == "true" or False
osrm_url = os.environ['OSRM_URL']


# In[ ]:


import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""
SELECT
  cc._ID,
  cc.OPERATOR_ID,
  cc.START_DATETIME as datetime,
  EXTRACT(
    EPOCH
    FROM
      (cc.END_DATETIME - cc.START_DATETIME)
  )::INT AS DURATION,
  cc.OPERATOR_JOURNEY_ID,
  cc.OPERATOR_TRIP_ID,
  cc.operator_class,
  cc.distance,
  cc.DRIVER_IDENTITY_KEY as identity_key,
  cc.DRIVER_OPERATOR_USER_ID as operator_user_id,
   CASE
    WHEN cc.DRIVER_PHONE_TRUNC IS NULL THEN LEFT(cc.DRIVER_PHONE, -2)
    ELSE cc.DRIVER_PHONE_TRUNC
  END AS PHONE_TRUNC,

  ST_X(ST_AsText(cc.start_position)) start_x,
  ST_Y(ST_AsText(cc.start_position)) start_y,
  ST_X(ST_AsText(cc.end_position)) end_x,
  ST_Y(ST_AsText(cc.end_position)) end_y,

--  cc.START_POSITION,
--  cc.END_POSITION,
  
  cg.start_geo_code,
  cg.end_geo_code
  FROM
  CARPOOL_V2.CARPOOLS cc
  JOIN carpool_v2.geo cg on cg.carpool_id = cc._id
  
  where 
    cc.START_DATETIME >= NOW() - '{delay} hours'::INTERVAL - '{frame} hours'::INTERVAL
  AND cc.START_DATETIME < NOW() - '{delay} hours'::INTERVAL
"""

with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# In[ ]:


import requests
import logging

def get_osrm_data(x):
  try:
    response =  requests.get(f"{osrm_url}/route/v1/car/{x.start_x},{x.start_y};{x.end_x},{x.end_y}")
    body = response.json()
    x['osrm_duration'] = body['routes'][0]['duration']
    x['osrm_distance'] = body['routes'][0]['distance']
  except requests.RequestException as e:
    logging.warn('Error on osrm call ' + e)
    # Handle exception, e.g., log error and continue, or re-raise with additional context
    pass
  except KeyError as ke:
    pass
  return x

df_carpool = df_carpool.apply(get_osrm_data, axis = 1)
# df_carpool = df_carpool.assign(duration_delta=lambda x: x.duration * 100 / x.osrm_duration)
# df_carpool = df_carpool.assign(distance_delta=lambda x: x.distance * 100 / x.osrm_distance)


# In[ ]:


operator_class_c_mask = df_carpool.operator_class == 'C'
df_only_class_c_trip = df_carpool[operator_class_c_mask]


# Sur les trajets de class C
# 
# https://doc.covoiturage.beta.gouv.fr/nos-services/le-registre-de-preuve-de-covoiturage/quest-ce-que-cest/classes-de-preuve-and-identite/classes-a-b-c
# 
# # Relever les trajets : 
# - Qui ont une distance estimée par osrm ou transmises inférieure à 300m. 
#     * Le trajet est beaucoup trop court en termes de distance
# - Qui ont une durée estimée par osrm ou transmises inférieures à 1 minute.
#     * Le trajet est beaucoup trop court en termes de durée
# - Qui ont une durée estimée par osrm supérieure à 2.5 fois le temps transmis. Exemple: temps estimé 25 minutes pour temps transmis 10 minutes
#     * Le temps de trajet est trop faible par rapport au plus court chemin determiné par OSRM, le trajet est considéré comme physiquement impossible
# - Qui ont une distance estimée par osrm supérieure à 2.5 fois la distance transmise. Exemple: distance 10 km sur une distance estimée 25 km
#     * La distance du trajet est trop faible par rapport au plus court chemin determiné par OSRM, le trajet est considéré comme physiquement impossible
# - Qui ont une distance transmise supérieur à 4 fois la distance estimée osrm. Exemple: 10 km estimé pour 40 km transmis
#     * La distance transmise est très largement supérieure à l'estimation. Le seuil est élevé pour prendre en compte d'éventuels détours par rapport au plus court chemin
# - Qui ont une durée transmise supérieure à 7 fois la durée estimée. Exemple : 1h estimé vs 7h transmis
#     * La durée transmise est très largement supérieure par rapport à l'estimation. Le seuil est élevé pour prendre en compte d'éventuels embouteillage

# In[ ]:


less_than_300_meters_mask = (df_only_class_c_trip.distance < 300) | (df_only_class_c_trip.osrm_distance < 300)
less_than_1_minutes_mask = (df_only_class_c_trip.duration < 60) | (df_only_class_c_trip.osrm_duration < 60)
estimate_vs_computed_percent_more_duration_mask = (df_only_class_c_trip.osrm_duration > df_only_class_c_trip.duration * 2.5) | (df_only_class_c_trip.osrm_duration * 7 < df_only_class_c_trip.duration)
estimate_vs_computed_percent_more_distance_mask = (df_only_class_c_trip.osrm_distance > df_only_class_c_trip.distance * 2.5) | (df_only_class_c_trip.osrm_distance * 4 < df_only_class_c_trip.distance)

df_result = df_only_class_c_trip[less_than_300_meters_mask | less_than_1_minutes_mask | estimate_vs_computed_percent_more_duration_mask | estimate_vs_computed_percent_more_distance_mask]


# In[ ]:


df_labels = df_result[['_id', 'operator_journey_id']]
df_labels = df_labels.assign(label='distance_duration_anomaly')
df_labels = df_labels.rename(columns={"_id": "carpool_id"})


# In[ ]:


import sqlalchemy as sa
import warnings
warnings.filterwarnings("ignore")

if update_carpool_status is True:

    metadata = sa.MetaData(schema='carpool_v2')
    metadata.reflect(bind=engine)

    table = metadata.tables['carpool_v2.status']
    
    where_clause = table.c.carpool_id.in_(df_result['_id'].to_list())

    update_stmt = sa.update(table).where(where_clause).values(anomaly_status='failed')

    with engine.connect() as conn:
       result = conn.execute(update_stmt)
       print(f"{result.rowcount} carpools status updated to anomaly_status=failed")
       conn.commit()


# In[ ]:


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


# In[ ]:


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


# In[ ]:


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


# In[ ]:


# df_result_light = df_result[['_id','operator_id','gmap_url', 'distance', 'duration', 'osrm_distance', 'osrm_duration', 'distance_delta', 'duration_delta']]
# df_result_light['duration'] = df_result_light['duration']/60
# df_result_light['osrm_duration'] = df_result_light['osrm_duration']/60 
# df_result_light['duration_delta'] = df_result_light['duration_delta']/60 


# Regarder le restes des trajets pour voir si il n'y a pas d'autre anomalie possible

# In[ ]:


# df_row_check = df_only_class_c_trip[~df_only_class_c_trip._id.isin(df_result['_id'])]

# df_row_check = df_row_check[['_id','operator_id','gmap_url', 'distance', 'duration', 'osrm_distance', 'osrm_duration', 'distance_delta', 'duration_delta']]
# df_row_check['duration'] = df_row_check['duration']/60
# df_row_check['osrm_duration'] = df_row_check['osrm_duration']/60 
# df_row_check['duration_delta'] = df_row_check['duration_delta']/60 

