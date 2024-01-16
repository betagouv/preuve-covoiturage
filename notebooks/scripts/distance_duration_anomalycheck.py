#!/usr/bin/env python
# coding: utf-8

# In[2]:


import os

# Input params
connection_string = os.environ['PG_CONNECTION_STRING']
delay = os.environ['DELAY']
frame = os.environ['FRAME']
update_carpool_status = os.getenv('UPDATE_CARPOOL_STATUS', False)
osrm_url = os.environ['OSRM_URL']


# In[3]:


import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""
SELECT cc._id, operator_id, cc.datetime, cc.duration, cc.distance, cc.identity_id, cc.operator_journey_id, start_geo_code, end_geo_code, 
cc.trip_id,
cc.is_driver,
cc.operator_class,
ci.operator_user_id,
CASE 
      WHEN ci.phone_trunc IS NULL THEN left(ci.phone, -2)
      ELSE ci.phone_trunc
      END AS phone_trunc,
ST_X(ST_AsText(cc.start_position)) start_x,
ST_Y(ST_AsText(cc.start_position)) start_y, 
ST_X(ST_AsText(cc.end_position)) end_x,
ST_Y(ST_AsText(cc.end_position)) end_y,
FROM CARPOOL.CARPOOLS CC
JOIN carpool.identities ci on cc.identity_id = ci._id
 join geo.perimeters gps on cc.start_geo_code = gps.arr and gps.year = 2023
 join geo.perimeters gpe on cc.end_geo_code = gpe.arr and gpe.year = 2023
JOIN policy.incentives pi on pi.carpool_id = cc._id
WHERE CC.DATETIME >= NOW() - '{delay} hours'::interval - '{frame} hours'::interval
	AND CC.DATETIME < NOW() - '{delay} hours'::interval and
      cc.is_driver = true 
"""

with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# In[6]:


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
  return x

df_carpool = df_carpool.apply(get_osrm_data, axis = 1)


# In[7]:


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

# In[8]:


less_than_300_meters_mask = (df_only_class_c_trip.distance < 300) | (df_only_class_c_trip.osrm_distance < 300)
less_than_1_minutes_mask = (df_only_class_c_trip.duration < 60) | (df_only_class_c_trip.osrm_duration < 60)
estimate_vs_computed_percent_more_duration_mask = (df_only_class_c_trip.osrm_duration > df_only_class_c_trip.duration * 2.5) | (df_only_class_c_trip.osrm_duration * 7 < df_only_class_c_trip.duration)
estimate_vs_computed_percent_more_distance_mask = (df_only_class_c_trip.osrm_distance > df_only_class_c_trip.distance * 2.5) | (df_only_class_c_trip.osrm_distance * 4 < df_only_class_c_trip.distance)

df_result = df_only_class_c_trip[less_than_300_meters_mask | less_than_1_minutes_mask | estimate_vs_computed_percent_more_duration_mask | estimate_vs_computed_percent_more_distance_mask]


# In[ ]:


df_labels = df_result[['_id']]
df_labels = df_labels.assign(label='distance_duration_anomaly')
df_labels.rename(columns={"_id": "carpool_id"})


# In[ ]:


import sqlalchemy as sa

if update_carpool_status is True:

    metadata = sa.MetaData(schema='carpool')
    metadata.reflect(bind=engine)

    table = metadata.tables['carpool.carpools']
    
    where_clause = table.c._id.in_(df_labels['carpool_id'].to_list())

    update_stmt = sa.update(table).where(where_clause).values(status='anomaly_error')

    with engine.connect() as conn:
        result = conn.execute(update_stmt)
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