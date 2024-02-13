#!/usr/bin/env python
# coding: utf-8

# # Parameters
# - `connection_string` : 'postgresql://postgres:postgres@localhost:5432/local'   -> Postgresql URL connection string
# - `delay` :                48                                                   -> end_date is 48 hours from today
# - `frame`:                 6                                                    -> start_date is 48 + 6 hours from today
# - `update_carpool_status`: 'True'                                               -> If carpools should be updated or not

# In[ ]:


import os
import pandas as pd
from sqlalchemy import create_engine, text

# Input params checks
update_carpool_status = False
connection_string = os.environ['PG_CONNECTION_STRING']
delay = os.environ['DELAY']
frame = os.environ['FRAME']  


# In[ ]:


frame = 10
delay = 1000


# In[ ]:


engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""SELECT CC._ID,
       CC.IS_DRIVER,
       CI.PHONE_TRUNC,
       CI.IDENTITY_KEY,
       CC.DATETIME,
       CC.DURATION,
       CC.OPERATOR_ID,
       CC.OPERATOR_JOURNEY_ID,
       CC.DISTANCE,
       CI.OPERATOR_USER_ID,
       CC.OPERATOR_TRIP_ID,
       CC.START_POSITION,
       CC.END_POSITION,
        ST_ASTEXT(CC.START_POSITION) AS START_WKT,
       ST_ASTEXT(CC.END_POSITION) AS END_WKT,
       ST_X(cc.start_position::geometry) as start_lon, 
       ST_Y(cc.start_position::geometry) as start_lat, 
       ST_X(cc.end_position::geometry) as end_lon, 
       ST_Y(cc.end_position::geometry) as end_lat, 
       GMAP_URL(CC.START_POSITION, CC.END_POSITION),
       GPS.ARR as start_arr,
       GPE.ARR as end_arr,
       PI.amount
  FROM CARPOOL.CARPOOLS CC
   LEFT JOIN POLICY.INCENTIVES PI
    ON PI.CARPOOL_ID = CC._ID
   AND PI.POLICY_ID = 459
  JOIN CARPOOL.IDENTITIES CI
    ON CC.IDENTITY_ID = CI._ID
   LEFT JOIN GEO.PERIMETERS GPS
   ON CC.START_GEO_CODE = GPS.ARR
   AND GPS.YEAR = 2023
   AND GPS.AOM = '287500078'
   LEFT JOIN GEO.PERIMETERS GPE
    ON CC.END_GEO_CODE = GPE.ARR
   AND GPE.YEAR = 2023
   AND GPE.AOM = '287500078'
 WHERE CC.OPERATOR_ID != 11 and CC.datetime > '2023-12-19 06:00:00' and CC.datetime < '2023-12-19 09:30:00' and CC.is_driver = true
 LIMIT 100000
"""

with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# # Chevauchements spacio temporelle
# 
# 0. Isolation que pour les trajets incités sur IDFM dans un premier temps pour nous faciliter le travail de recherche
# 1. Faire un premier regroupement spacial pour pouvoir calculer les chevauchements temporels sur des sous-essembles
# 2. Calculer les chevauchements tomporelles
# 2. Faire un nouveau regroupement spacial sur la position de départs : Tous les trajets avec un point de départ dans un rayon de 5km. (Idem à faire pour le point d'arrivée. (Exclusion de certain trajet partiel avec cette méthode))
# 
# 
# 
# A Tester : 
# 
# - Regrouper par tranche d'heure pour des opérateurs différents. Tous les trajets entre 8h30 et 9h00 par exemple

# In[ ]:


import sys

root_module_path = os.path.abspath(os.path.join('../'))


if root_module_path not in sys.path:
    sys.path.append(root_module_path)

# search every modules directories under ./scripts for papermill execution
if '/notebooks/scripts' not in sys.path:
    sys.path.append('/notebooks/scripts')

from helpers.apply_metods import add_overlap_columns


df_carpool['overlap_group'] = 100
df_carpool['overlap_duration'] = 0
df_carpool['overlap_duration_ratio'] = 1
df_grouped_tmp = df_carpool.groupby(['start_arr'], group_keys=False)

df_grouped_by_start_with_overlap = df_grouped_tmp.apply(lambda df: add_overlap_columns(df, True)).reset_index(drop=True)
# df_carpool.groupby(['end_arr'])


# In[ ]:


decent_overlap_filter = df_grouped_by_start_with_overlap.overlap_duration_ratio > 0.5
df_decent_overlap_filtered = df_grouped_by_start_with_overlap[decent_overlap_filter]


# In[ ]:


df_decent_overlap_wihtout_same_trip_id = df_decent_overlap_filtered.groupby(['start_arr', 'overlap_group']).filter(lambda x: len(pd.unique(x['operator_trip_id'])) > 1)


# In[ ]:


import geopandas

df_carpools_copy = df_decent_overlap_wihtout_same_trip_id.copy(deep = True)
df_carpools_copy['start_wkt'] = geopandas.GeoSeries.from_wkt(df_carpools_copy['start_wkt'])
gdf = geopandas.GeoDataFrame(df_carpools_copy, geometry='start_wkt', crs="EPSG:4326")
gdf.to_crs(epsg=2154, inplace=True)


# In[ ]:


gdf_nearest = geopandas.sjoin_nearest(gdf, gdf, 'left', max_distance=150000, distance_col="geo_distances", exclusive=True)
# gdf_nearest_filtered = gdf_nearest.groupby(['_id_left']).filter(lambda x:len(x) > 1)
df_nearest  = pd.DataFrame(gdf_nearest)


# In[ ]:


df_nearest.groupby(['_id_left']).filter(lambda x:len(x) == 1)[['_id_left', '_id_right', 'geo_distances']]
df_nearest[['_id_left', '_id_right', 'geo_distances']]


# In[ ]:


import folium
from folium.plugins import MarkerCluster

carte = folium.Map(location=[48.8566, 2.3522], zoom_start=10)  # Coordonnées de Paris

# Ajouter les marqueurs pour chaque point dans le GeoDataFrame
marker_cluster = MarkerCluster().add_to(carte)

for index, row in df_nearest.iterrows():
    # Créer un popup personnalisé avec des informations détaillées
    popup_content_right = f"""
    RIGHT
    <strong>Carpool ID:</strong> {row._id_right}<br>
    <strong>Operator:</strong> {row.operator_id_right}<br>
    <strong>Operator journey id:</strong> {row.operator_journey_id_right}<br>
    <strong>Geo distance</strong> {row.geo_distances}<br>
    <strong>(Pined) Coordinates</strong> {row.start_lat_right}, {row.start_lon_right} <br>
    <strong>Phone trunc:</strong> {row.phone_trunc_right}<br>
    <strong>Identity key</strong> {row.identity_key_right}<br>
    <strong>Overlap Group:</strong> {row.overlap_group_right}<br>
    <strong>Overlap Duration Ratio:</strong> {row.overlap_duration_ratio_right}<br>
    <strong>Start Datetime</strong> {row.datetime_right}<br>
    <strong>Earned</strong> {row.amount_right}<br>

    
    ---------------------------------------------<br>
        LEFT
    <strong>Carpool ID:</strong> {row._id_left}<br>
    <strong>Operator:</strong> {row.operator_id_left}<br>
    <strong>Operator journey id:</strong> {row.operator_journey_id_left}<br>
    <strong>Geo distance</strong> {row.geo_distances}<br>
    <strong>Coordinates</strong> {row.start_lat_left}, {row.start_lon_left} <br>
    <strong>Phone trunc:</strong> {row.phone_trunc_left}<br>
    <strong>Identity key</strong> {row.identity_key_left}<br>
    <strong>Overlap Group:</strong> {row.overlap_group_left}<br>
    <strong>Overlap Duration Ratio:</strong> {row.overlap_duration_ratio_left}<br>
    <strong>Start Datetime</strong> {row.datetime_left}<br>
    <strong>Earned</strong> {row.amount_left}<br>
    """


    # folium.Marker([row.start_lat_left, row.start_lon_left], popup=folium.Popup(html=popup_content_left, max_width=150)).add_to(marker_cluster)
    folium.Marker([row.start_lat_right, row.start_lon_right], popup=folium.Popup(html=popup_content_right, max_width=400)).add_to(marker_cluster)

# Enregistrer la carte au format HTML
carte.save('carte_points_ile_de_france.html')


# In[ ]:


# Bon exemple : 
example_mask = (df_grouped_by_start_with_overlap.start_arr = '94037') & (df_grouped_by_start_with_overlap.overlap_group = 3)


