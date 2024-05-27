#!/usr/bin/env python
# coding: utf-8

# # Parameters
#
#    Parameter name          Example Value                                            Description
# - `connection_string` : 'postgresql://postgres:postgres@localhost:5432/local'   -> Postgresql URL connection string
# - `aom_insee` :          '217500016'                                            -> Aom insee code representing geo perimeter to apply the algorithm
# - `end_date`:             '2023-04-30 00:00:01'                                 -> End date

# In[ ]:


import os
import numpy as np
import pandas as pd
import json
from sqlalchemy import create_engine, text
import networkx as nx
from sqlalchemy.dialects.postgresql import insert

try: connection_string
except NameError:
  connection_string = os.environ['PG_CONNECTION_STRING']

try: delay
except NameError:
  delay = os.environ['DELAY']

try: aom_insee
except NameError:
  aom_insee = os.environ['AOM_INSEE']



# In[ ]:

engine = create_engine(connection_string, connect_args={'sslmode':'require'})


# In[ ]:

query = f"""SELECT cc._id, cc.is_driver, ci.phone_trunc, cc.datetime, cc.duration, cc.operator_id, cc.seats,
ST_AsText(cc.start_position) as start_wkt, ST_AsText(cc.end_position) as end_wkt,
cc.operator_journey_id,
cc.distance,
ci.operator_user_id,
cc.end_position,
CASE WHEN pi.result >= 0 THEN pi.result ELSE 0 END as incentive,
cc.operator_trip_id,

cc2.is_driver as other_is_driver,
ci2.phone_trunc as other_phone_trunc
FROM CARPOOL.CARPOOLS cc
   join carpool.identities ci on cc.identity_id = ci._id
   join geo.perimeters gps on cc.start_geo_code = gps.arr and gps.year = 2022
   join geo.perimeters gpe on cc.end_geo_code = gpe.arr and gpe.year = 2022
   LEFT JOIN policy.incentives pi on pi.carpool_id = cc._id
   JOIN CARPOOL.CARPOOLS AS CC2 ON CC.OPERATOR_JOURNEY_ID = CC2.OPERATOR_JOURNEY_ID and CC.is_driver != cc2.is_driver
   JOIN CARPOOL.IDENTITIES AS CI2 on CC2.IDENTITY_ID = CI2._id
    WHERE CC.DATETIME >= DATE_TRUNC('month', NOW()) - INTERVAL '{delay} days'
    AND CC.DATETIME <= DATE_TRUNC('month', NOW()) - '1 day'::interval
    {f"and (gps.aom = '{aom_insee}' or gpe.aom = '{aom_insee}' or gps.reg = '{aom_insee}' or gpe.reg = '{aom_insee}') and gps.year = 2023 and gpe.year = 2023" if aom_insee else ""}
"""
with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# # Etape 1
# Conversion des des données.

# In[ ]:


df_carpool['datetime'] = pd.to_datetime(df_carpool['datetime'])
df_carpool['day'] = df_carpool['datetime'].dt.date
df_carpool['incentive'] = df_carpool['incentive']/100
df_carpool['duration'] = np.round(df_carpool['duration']/60)
df_carpool['distance'] = np.round(df_carpool['distance']/1000,1)


# # Etape 2
#
# Création de fonctions pour le calcul de changement de rôle par jours etc.

# In[ ]:


def intra_day_change_count(row):
    if len(row['roles']) <= 1:
        return 0
    count = sum((row['roles'][i] != row['roles'][i+1]) for i in range(len(row['roles']) - 1) if row['carpool_day_list'][i] == row['carpool_day_list'][i+1])
    return count

def total_change_count(row):
    if len(row['roles']) <= 1:
        return 0
    count = sum((row['roles'][i] != row['roles'][i+1]) for i in range(len(row['roles']) - 1))
    return count

def intra_day_change_percentage(row):
    unique_days = np.unique(row['carpool_day_list'])
    count = sum(1 for day in unique_days if any((row['roles'][i] != row['roles'][i+1]) for i in range(len(row['roles']) - 1) if row['carpool_day_list'][i] == day and row['carpool_day_list'][i+1] == day))
    percentage = np.round(count / len(unique_days) * 100, 2)
    return percentage


# # Etape 3
# Calcul des indicateurs par phone_trunc

# In[ ]:


phone_trunc_insights_df = df_carpool.groupby('phone_trunc').agg({
    'datetime': ['min', 'max'],
    'duration':  ['mean', 'count'],
    'distance': 'mean',
    'incentive': 'sum',
    'is_driver': ['mean',list],
    'day': ['nunique', list],
    'operator_journey_id': [list],
    'operator_id': ['unique']
})

phone_trunc_insights_df.columns = ['departure_date',
                                   'end_date',
                                   'average_duration',
                                   'num_trips',
                                   'average_distance',
                                   'total_incentives',
                                   'driver_trip_percentage',
                                   'roles',
                                   'carpool_days',
                                   'carpool_day_list',
                                   'trip_id_list',
                                   'operator_list']
phone_trunc_insights_df['carpool_day_list'] = pd.Series(phone_trunc_insights_df['carpool_day_list'])
phone_trunc_insights_df['trip_id_list'] = pd.Series(phone_trunc_insights_df['trip_id_list'])
phone_trunc_insights_df['operator_list'] = pd.Series(phone_trunc_insights_df['operator_list'])
phone_trunc_insights_df.reset_index(inplace=True)

phone_trunc_insights_df['num_days'] = (phone_trunc_insights_df['end_date'].dt.date - phone_trunc_insights_df['departure_date'].dt.date).dt.days
phone_trunc_insights_df['average_trip_count'] = phone_trunc_insights_df.apply(
    lambda row: row['num_trips'] / row['carpool_days'] if row['carpool_days'] > 0 else 0,
    axis=1
)
phone_trunc_insights_df['driver_trip_percentage'] = np.round(phone_trunc_insights_df['driver_trip_percentage'] * 100,2)


phone_trunc_insights_df['num_operators'] = phone_trunc_insights_df['operator_list'].apply(lambda row: len(np.unique(row)))
phone_trunc_insights_df['role_change'] = phone_trunc_insights_df['roles'].apply(lambda x: len(np.unique(x)) > 1)



phone_trunc_insights_df['intraday_change_count'] = phone_trunc_insights_df.apply(intra_day_change_count, axis=1)
phone_trunc_insights_df['total_change_count'] = phone_trunc_insights_df.apply(total_change_count, axis=1)


phone_trunc_insights_df['intraday_change_percentage'] = phone_trunc_insights_df.apply(intra_day_change_percentage, axis=1)

phone_trunc_insights_df['total_change_percentage'] = phone_trunc_insights_df.apply(lambda row: np.round(row['total_change_count'] / len(row['operator_list']) * 100, 2), axis=1)
phone_trunc_insights_df = phone_trunc_insights_df[['phone_trunc', 'departure_date', 'end_date', 'num_days', 'average_duration',
                                                   'average_distance', 'total_incentives','average_trip_count' ,'num_operators',
                                                   'driver_trip_percentage',
                                                   'role_change', 'intraday_change_count',
                                                   'total_change_count', 'intraday_change_percentage',
                                                   'total_change_percentage', 'carpool_days',
                                                   'carpool_day_list', 'trip_id_list', 'operator_list']]

phone_trunc_insights_df['operator_list'] = phone_trunc_insights_df['operator_list'].tolist()


# # Etape 4
#
# Ajout dans la bd des insights par phone trunc?

# In[ ]:


def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['phone_trunc', 'departure_date', 'end_date'])
    conn.execute(on_duplicate_key_stmt)

phone_trunc_insights_df.to_sql(
    name="phone_insights",
    schema="fraudcheck",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict
)


# # Etape 5
# Appliquer la détection de fraude triangulaire sur les données calculées phone_trunc_insights_df.

# In[ ]:


# création de la liste des phone_trunc
phone_numbers = phone_trunc_insights_df.phone_trunc.to_list()

# filtrer les trajets potentiellement frauduleux
potential_fraud_carpool_df = df_carpool[df_carpool['phone_trunc'].isin(phone_numbers)].copy()


# In[ ]:


# Ajout des insight des phone trunc à chaque trajet
potential_fraud_carpool_with_insights_df = potential_fraud_carpool_df.merge(phone_trunc_insights_df,how='left',on='phone_trunc')


# In[ ]:


# grouper les information par trajets
filtered_df_grouped = potential_fraud_carpool_with_insights_df.groupby(['operator_journey_id']).agg({'phone_trunc' : list,
                                                                                                     'intraday_change_percentage': list,
                                                                                                     'intraday_change_count' : list,
                                                                                                     'role_change' : list,
                                                                                                     'total_change_percentage' : list})
filtered_df_grouped.reset_index(inplace=True)


# In[ ]:


# retirer les trajets ou les paricipany n'ont jamais cha,gé de rôles
filtered_df_grouped = filtered_df_grouped[filtered_df_grouped['role_change'].apply(lambda x: x != [False, False])].copy()


# In[ ]:


# algorithme de création de groupe frauduleux

G = nx.Graph()

# Add edges between connected phone trunc
for _, row in filtered_df_grouped.iterrows():
    phone_list = row['phone_trunc']
    for i in range(len(phone_list) - 1):
        for j in range(i + 1, len(phone_list)):
            if G.has_edge(phone_list[i], phone_list[j]):
                G[phone_list[i]][phone_list[j]]['interactions'] += 1
            else:
                G.add_edge(phone_list[i], phone_list[j], interactions=1)

# Find connected components in the graph
#connected_components = [component for component in nx.connected_components(G) if len(component) > 2]
connected_components = nx.connected_components(G)

# Create DataFrame with groups
group_data = []
group_degree_centrality = []
group_betweenness_centrality = []

for idx, component in enumerate(connected_components):
    group_graph = G.subgraph(component)
    degree_centrality = nx.degree_centrality(group_graph)
    betweenness_centrality = nx.betweenness_centrality(group_graph)
    group_phones = pd.Series(list(component))
    group_journeys = df_carpool[df_carpool['phone_trunc'].isin(group_phones)]
    group_journeys = group_journeys.drop_duplicates('operator_journey_id').copy()
    group_journeys = potential_fraud_carpool_with_insights_df[potential_fraud_carpool_with_insights_df['phone_trunc'].isin(group_phones)].copy()
    group_duration = np.round(group_journeys['duration'].mean())
    group_operator_id = group_journeys['operator_journey_id'].copy()
    group_journeys['date'] = group_journeys['datetime'].dt.date.copy()
    grouped = group_journeys.groupby('phone_trunc').size().reset_index(name='count')
    total_change_percentage = np.unique(group_journeys['total_change_percentage'].to_list())

    group_data.append({
        'groupe': idx+1,
        'phone_trunc': group_phones,
        'num_participants': len(group_phones),
        'num_trips': len(group_journeys.operator_journey_id.unique()),
        'operator_list' : group_journeys.operator_id.unique(),
        'num_operators' : len(group_journeys.operator_id.unique()),
        'average_duration': group_duration,
        'departure_date': group_journeys['datetime'].min().date(),
        'end_date': group_journeys['datetime'].max().date(),
        'average_daily_trips' : np.round(group_journeys.drop_duplicates('operator_journey_id')['datetime'].dt.date.value_counts().sort_index().mean()),
        #'daily_mean_trips' : grouped.loc[grouped['count'].idxmax(),'count']/len(group_journeys.groupby('date')),
        'total_change_percentage' : total_change_percentage,
        'total_incentives' : np.sum(group_journeys.drop_duplicates('operator_journey_id')['incentive']*100),
        'central_participants' : degree_centrality,
        'intermediate_participants' : betweenness_centrality,
        'journey_id_list' : group_operator_id,

    })
groups_df = pd.DataFrame(group_data)

groups_df['operator_list'] = groups_df['operator_list'].apply(lambda x: list(map(int, x)))
groups_df['total_change_percentage'] = groups_df['total_change_percentage'].apply(lambda x: list(map(float, x)))
groups_df['central_participants'] = groups_df['central_participants'].apply(json.dumps)
groups_df['intermediate_participants'] = groups_df['intermediate_participants'].apply(json.dumps)
groups_df['central_participants'] = pd.Series(groups_df['central_participants'])
groups_df['intermediate_participants'] = pd.Series(groups_df['intermediate_participants'])


# # Etape 6
#
# Ajout dans la bd les groupes

# In[ ]:


def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['id', 'groupe', 'phone_trunc'])
    conn.execute(on_duplicate_key_stmt)

groups_df.to_sql(
    name="potential_triangular_patterns",
    schema="fraudcheck",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict
)

