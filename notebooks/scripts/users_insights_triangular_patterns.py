#!/usr/bin/env python
# coding: utf-8

# # Création et Stockage des Tables d'Insights et Triangulaires pour Analyse de Fraude
# 

# ## 1. Setup
# # Parameters
# 
# 
#    Parameter name          Example Value                                            Description
# - `connection_string` : 'postgresql://postgres:postgres@localhost:5432/local'   -> Postgresql URL connection string
# - `aom_insee` :          '217500016'                                            -> Aom insee code representing geo perimeter to apply the algorithm
# - `start_date` :         '2023-02-28 23:59:59'                                  -> Start date
# - `end_date`:             '2023-04-30 00:00:01'                                 -> End date
# - `policy_id`             : 459                                                 -> Policy id filter on incentive

# In[ ]:


# Import necessary libraries
import itertools
import os
import sys
import math
import numpy as np
import networkx as nx
import pandas as pd
import datetime
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from sqlalchemy.dialects.postgresql import insert
import pytz
from datetime import datetime

module_path = os.path.abspath(os.path.join('..'))
load_dotenv()


connection_string = os.environ['PG_CONNECTION_STRING']
delay = os.environ['DELAY'] 
frame = os.environ['FRAME'] 

# Hardcoded for now
aom_insee = '217500016'


# ## 2. Helper Functions

# In[ ]:


# Convert to french timezone 

def convert_to_france_time(dt_obj):
    original_format = '%Y-%m-%d %H:%M:%S.%f %z'
    utc_tz = pytz.timezone('UTC')
    france_tz = pytz.timezone('Europe/Paris')
    dt_str = dt_obj.strftime(original_format)
    dt = datetime.strptime(dt_str, original_format).replace(tzinfo=utc_tz)
    return dt.astimezone(france_tz)

# Add flag for night trips
def is_night_time(time, start, end):
    if start <= end:
        return start <= time <= end
    else:
        return start <= time or time <= end
  
# Calculate percentage of boolean column
def calculate_percentages(df,column):
    counts = df[column].value_counts(normalize=True) * 100
    return counts

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

def count_consecutive_changes(date_list, role_list):
    df = pd.DataFrame({'Date': date_list, 'Role': role_list})
    consecutive_changes = []
    for date, group in df.groupby('Date'):
        consecutive_changes_count = 0
        previous_value = None

        for index, row in group.iterrows():
            current_value = row['Role']

            if previous_value is not None and current_value != previous_value:
                consecutive_changes_count += 1

            previous_value = current_value

        consecutive_changes.append(consecutive_changes_count)

    return consecutive_changes

def check_presence(phone, level_set):
    return True if phone in level_set else False

def calculate_total_incentive(row, df_carpool):
    phone_truncs = row['phone_trunc']
    total_incentive = df_carpool[df_carpool.phone_trunc.isin(phone_truncs)].incentive.sum()
    return total_incentive

def is_changed(current, previous):
      if pd.isna(current) and pd.isna(previous):
          return False
      if pd.isna(current) or pd.isna(previous):
          return False
      return current != previous


# ## 3. Main Function

# In[ ]:


def create_insights_and_triangular_df(delay, frame, aom_insee,engine):
  
  query = f"""SELECT cc._id, cc.is_driver, ci.phone_trunc, cc.datetime, cc.duration, cc.operator_id, cc.seats,
  ST_AsText(cc.start_position) as start_wkt, ST_AsText(cc.end_position) as end_wkt, 
  cc.operator_journey_id,
  cc.distance,
  ci.operator_user_id,
  cc.end_position,
  CASE WHEN pi.amount >= 0 THEN pi.amount ELSE 0 END as incentive,
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
      WHERE CC.DATETIME >= NOW() - '{delay} days'::interval - '{frame} days'::interval
	  AND CC.DATETIME < NOW() - '{delay} days'::interval
      {f"and (gps.aom = '{aom_insee}' or gpe.aom = '{aom_insee}' or gps.reg = '{aom_insee}' or gpe.reg = '{aom_insee}') and gps.year = 2022 and gpe.year = 2022" if aom_insee else ""}
  """

  with engine.connect() as conn:
      df_carpool = pd.read_sql_query(text(query), conn)

  
  # convert to french datetime
  df_carpool['datetime_france'] = df_carpool['datetime'].apply(convert_to_france_time)

  df_carpool['day_month_year'] = df_carpool['datetime_france'].apply(lambda x: x.strftime('%Y-%m-%d'))

  # add boolean flags for night trips
  df_carpool['night_21_to_6'] = df_carpool['datetime_france'].apply(lambda x: is_night_time(x.time(), pd.Timestamp('21:00').time(), pd.Timestamp('06:00').time()))
  df_carpool['night_21_to_5'] = df_carpool['datetime_france'].apply(lambda x: is_night_time(x.time(), pd.Timestamp('21:00').time(), pd.Timestamp('05:00').time()))
  df_carpool['night_22_to_5'] = df_carpool['datetime_france'].apply(lambda x: is_night_time(x.time(), pd.Timestamp('22:00').time(), pd.Timestamp('05:00').time()))

  # Convert and create some features
  df_carpool['day'] = df_carpool['datetime_france'].dt.date
  df_carpool['incentive'] = df_carpool['incentive']/100
  df_carpool['duration'] = np.round(df_carpool['duration']/60)
  df_carpool['distance'] = np.round(df_carpool['distance']/1000,1)

  # Update the correct number of seats used per journey id
  _temp = pd.DataFrame(df_carpool.groupby('operator_journey_id').seats.sum()).reset_index()

  _temp.columns = ['operator_journey_id','seats']
  df_carpool.drop('seats',axis=1,inplace=True)
  df_carpool = df_carpool.merge(_temp,how='left',on='operator_journey_id').copy()

  # Creation of insights for each operator user id
  phone_trunc_insights_df = df_carpool.groupby('operator_user_id').agg({
    'phone_trunc': ['unique'],
    'datetime_france': ['min', 'max', list],
    'day_month_year' : [list],
    'duration':  ['mean', 'count'],
    'distance': 'mean',
    'incentive': 'sum',
    'is_driver': ['mean',list],
    'day': ['nunique'],
    'operator_journey_id': [list],
    'operator_id': [list],
    'seats' : ['mean'],
    'night_21_to_6' : ['sum', lambda x: any(x), lambda x: x.mean()] ,
    'night_21_to_5' : ['sum', lambda x: any(x), lambda x: x.mean()],
    'night_22_to_5' : ['sum', lambda x: any(x), lambda x: x.mean()]})
  phone_trunc_insights_df.reset_index(inplace=True)
  phone_trunc_insights_df.columns = ['operator_user_id',
                                    'phone_trunc',
                                    'departure_date',
                                    'end_date',
                                    'carpool_datetime_list',
                                    'carpool_day_list',
                                    'average_duration',
                                    'num_trips',
                                    'average_distance',
                                    'total_incentives',
                                    'driver_trip_percentage',
                                    'roles',
                                    'carpool_days',
                                    'trip_id_list',
                                    'operator_list',
                                    'average_seats',
                                    'night_time_count_21_6',
                                    'has_night_time_21_6',
                                    'night_time_percentage_21_6',
                                    'night_time_count_21_5',
                                    'has_night_time_21_5',
                                    'night_time_percentage_21_5',
                                    'night_time_count_22_5',
                                    'has_night_time_22_5',
                                    'night_time_percentage_22_5']

  phone_trunc_insights_df['average_duration'] = np.round(phone_trunc_insights_df['average_duration'])
  phone_trunc_insights_df['average_distance'] = np.round(phone_trunc_insights_df['average_distance'])

  phone_trunc_insights_df['carpool_day_list'] = pd.Series(phone_trunc_insights_df['carpool_day_list'])
  phone_trunc_insights_df['trip_id_list'] = pd.Series(phone_trunc_insights_df['trip_id_list'])
  phone_trunc_insights_df['operator_list'] = pd.Series(phone_trunc_insights_df['operator_list'])



  phone_trunc_insights_df['num_days'] = (phone_trunc_insights_df['end_date'] - phone_trunc_insights_df['departure_date']).dt.days
  phone_trunc_insights_df['average_trip_count'] = phone_trunc_insights_df.apply(
      lambda row: np.round(row['num_trips'] / row['carpool_days'] if row['carpool_days'] > 0 else 0,1),
      axis=1)
  phone_trunc_insights_df['driver_trip_percentage'] = np.round(phone_trunc_insights_df['driver_trip_percentage'] * 100,2)


  phone_trunc_insights_df['num_operators'] = phone_trunc_insights_df['operator_list'].apply(lambda row: len(np.unique(row)))
  phone_trunc_insights_df['role_change'] = phone_trunc_insights_df['roles'].apply(lambda x: len(np.unique(x)) > 1)
  phone_trunc_insights_df['intraday_change_count'] = phone_trunc_insights_df.apply(lambda row: math.ceil(np.mean(count_consecutive_changes(row['carpool_day_list'], row['roles']))), axis=1)
  phone_trunc_insights_df['total_change_count'] = phone_trunc_insights_df.apply(total_change_count, axis=1)
  phone_trunc_insights_df['intraday_change_percentage'] = phone_trunc_insights_df.apply(intra_day_change_percentage, axis=1)
  phone_trunc_insights_df['total_change_percentage'] = phone_trunc_insights_df.apply(lambda row: np.round(row['total_change_count'] / len(row['carpool_day_list']) * 100, 2), axis=1)
  phone_trunc_insights_df = phone_trunc_insights_df[['phone_trunc','operator_user_id', 'departure_date', 'end_date', 'num_days', 'average_duration',
                                                    'average_distance', 'total_incentives','average_trip_count' ,'num_operators',
                                                    'driver_trip_percentage',
                                                    'role_change', 'intraday_change_count',
                                                    'total_change_count', 'intraday_change_percentage',
                                                    'total_change_percentage', 'carpool_days',
                                                    'carpool_day_list', 'trip_id_list', 'operator_list','average_seats',
                                                    'night_time_count_21_6','has_night_time_21_6','night_time_percentage_21_6',
                                                    'night_time_count_21_5','has_night_time_21_5','night_time_percentage_21_5',
                                                    'night_time_count_22_5','has_night_time_22_5','night_time_percentage_22_5']]
  phone_trunc_insights_df['operator_list'] = phone_trunc_insights_df['operator_list'].tolist()
  phone_trunc_insights_df['phone_trunc'] = phone_trunc_insights_df['phone_trunc'].astype(str)
  phone_trunc_insights_df['phone_trunc'] = phone_trunc_insights_df['phone_trunc'].str.replace('[', '', regex=False).str.replace(']', '', regex=False)
  phone_trunc_insights_df['phone_trunc'] = phone_trunc_insights_df['phone_trunc'].str.replace("'", "")
  phone_trunc_insights_df['night_time_percentage_21_5'] = np.round(100*phone_trunc_insights_df.night_time_percentage_21_5,2)
  phone_trunc_insights_df['night_time_percentage_21_6'] = np.round(100*phone_trunc_insights_df.night_time_percentage_21_6,2)
  phone_trunc_insights_df['night_time_percentage_22_5'] = np.round(100*phone_trunc_insights_df.night_time_percentage_22_5,2)
  mean_seats = phone_trunc_insights_df.average_seats.mean()
  phone_trunc_insights_df['occupancy_rate_exceeded'] = phone_trunc_insights_df.average_seats > mean_seats

  # Triangular Table Creation
  phone_numbers = phone_trunc_insights_df.phone_trunc.to_list()
  potential_fraud_carpool_df = df_carpool[df_carpool['phone_trunc'].isin(phone_numbers)].copy()
  potential_fraud_carpool_with_insights_df = potential_fraud_carpool_df.merge(phone_trunc_insights_df,how='left',on='phone_trunc')

  potential_fraud_carpool_with_insights_df_level_1 = potential_fraud_carpool_with_insights_df[potential_fraud_carpool_with_insights_df.total_change_count / potential_fraud_carpool_with_insights_df.carpool_days >= 2].copy()
  potential_fraud_carpool_with_insights_df_level_2 = potential_fraud_carpool_with_insights_df[potential_fraud_carpool_with_insights_df.total_change_count / potential_fraud_carpool_with_insights_df.carpool_days >= 1].copy()
  # For level 1 
  filtered_df_grouped_level_1 = potential_fraud_carpool_with_insights_df_level_1.groupby(['operator_journey_id']).agg({'phone_trunc' : list,
                                                                                                      'intraday_change_percentage': list,
                                                                                                      'intraday_change_count' : list,
                                                                                                      'role_change' : list,
                                                                                                      'total_change_percentage' : list})
  filtered_df_grouped_level_1.reset_index(inplace=True)
  filtered_df_grouped_level_1.columns  = ['operator_journey_id', 'phone_trunc','intraday_change_percentage','intraday_change_count', 'role_change', 'total_change_percentage']
  filtered_df_grouped_level_1 = filtered_df_grouped_level_1[filtered_df_grouped_level_1['role_change'].apply(lambda x: x != [False, False])].copy()


  # For level 2
  filtered_df_grouped_level_2 = potential_fraud_carpool_with_insights_df_level_2.groupby(['operator_journey_id']).agg({'phone_trunc' : list,
                                                                                                      'intraday_change_percentage': list,
                                                                                                      'intraday_change_count' : list,
                                                                                                      'role_change' : list,
                                                                                                      'total_change_percentage' : list})
  filtered_df_grouped_level_2.reset_index(inplace=True)
  filtered_df_grouped_level_2.columns  = ['operator_journey_id', 'phone_trunc','intraday_change_percentage','intraday_change_count', 'role_change', 'total_change_percentage']
  filtered_df_grouped_level_2 = filtered_df_grouped_level_1[filtered_df_grouped_level_2['role_change'].apply(lambda x: x != [False, False])].copy()

  journey_to_phones = potential_fraud_carpool_with_insights_df_level_2.groupby('operator_journey_id')['phone_trunc'].apply(list).to_dict()

  # algorithme de création de groupe frauduleux 
  G = nx.Graph()
  journey_to_phones = potential_fraud_carpool_with_insights_df_level_1.groupby('operator_journey_id')['phone_trunc'].apply(list).to_dict()


  for journey, phones in journey_to_phones.items():
      # Ensure all phone numbers are unique in the list to avoid self-loops
      unique_phones = set(phones)
      # Create edges between all pairs of phone_truncs for this journey
      for phone1 in unique_phones:
          for phone2 in unique_phones:
              if phone1 != phone2:
                  if G.has_edge(phone1, phone2):
                      G[phone1][phone2]['shared_journeys'].add(journey)
                  else:
                      G.add_edge(phone1, phone2, shared_journeys={journey})


  connected_components = nx.connected_components(G)

  group_data = []

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
      total_change_percentage = np.unique(group_journeys['total_change_percentage'].to_list())
    
      group_data.append({
          'groupe': idx+1,
          'phone_trunc': list(group_phones),
          'num_participants': len(group_phones),
          'num_trips': len(group_journeys.operator_journey_id.unique()),
          'operator_list' : list(group_journeys.operator_id.unique()),
          'num_operators' : len(group_journeys.operator_id.unique()),
          'average_duration': group_duration,
          'departure_date': group_journeys['datetime'].min(),
          'end_date': group_journeys['datetime'].max(),
          'average_daily_trips' : np.round(group_journeys.drop_duplicates('operator_journey_id')['datetime'].dt.date.value_counts().sort_index().mean()),
          'total_change_percentage' : list(total_change_percentage),
          'total_incentives' : np.sum(group_journeys.drop_duplicates('operator_journey_id')['incentive']),
          'central_participants' : degree_centrality,
          'intermediate_participants' : betweenness_centrality,
          'journey_id_list' : list(group_operator_id),
      })
  groups_df_level_1 = pd.DataFrame(group_data)

  groups_df_level_1['operator_list'] = groups_df_level_1['operator_list'].apply(lambda x: list(map(int, x)))
  groups_df_level_1['total_change_percentage'] = groups_df_level_1['total_change_percentage'].apply(lambda x: list(map(float, x)))
  groups_df_level_1['central_participants'] = groups_df_level_1['central_participants'].apply(json.dumps)
  groups_df_level_1['intermediate_participants'] = groups_df_level_1['intermediate_participants'].apply(json.dumps)
  groups_df_level_1['central_participants'] = pd.Series(groups_df_level_1['central_participants'])
  groups_df_level_1['intermediate_participants'] = pd.Series(groups_df_level_1['intermediate_participants'])


  # Level 2
  G = nx.Graph()
  journey_to_phones = potential_fraud_carpool_with_insights_df_level_2.groupby('operator_journey_id')['phone_trunc'].apply(list).to_dict()

  for journey, phones in journey_to_phones.items():
      unique_phones = set(phones)
      for phone1 in unique_phones:
          for phone2 in unique_phones:
              if phone1 != phone2:
                  if G.has_edge(phone1, phone2):
                      G[phone1][phone2]['shared_journeys'].add(journey)
                  else:
                      G.add_edge(phone1, phone2, shared_journeys={journey})


  connected_components = nx.connected_components(G)

  group_data = []

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
      total_change_percentage = np.unique(group_journeys['total_change_percentage'].to_list())
      
      group_data.append({
          'groupe': idx+1,
          'phone_trunc': list(group_phones),
          'num_participants': len(group_phones),
          'num_trips': len(group_journeys.operator_journey_id.unique()),
          'operator_list' : list(group_journeys.operator_id.unique()),
          'num_operators' : len(group_journeys.operator_id.unique()),
          'average_duration': group_duration,
          'departure_date': group_journeys['datetime'].min(),
          'end_date': group_journeys['datetime'].max(),
          'average_daily_trips' : np.round(group_journeys.drop_duplicates('operator_journey_id')['datetime'].dt.date.value_counts().sort_index().mean()),
          'total_change_percentage' : list(total_change_percentage),
          'total_incentives' : np.sum(group_journeys.drop_duplicates('operator_journey_id')['incentive']),
          'central_participants' : degree_centrality,
          'intermediate_participants' : betweenness_centrality,
          'journey_id_list' : list(group_operator_id),
      })
  groups_df_level_2 = pd.DataFrame(group_data)

  groups_df_level_1['level'] = 1
  groups_df_level_2['level'] = 2

  groups_df_combined = pd.concat([groups_df_level_1, groups_df_level_2], ignore_index=True)

  groups_df_level_2['operator_list'] = groups_df_level_2['operator_list'].apply(lambda x: list(map(int, x)))
  groups_df_level_2['total_change_percentage'] = groups_df_level_2['total_change_percentage'].apply(lambda x: list(map(float, x)))
  groups_df_level_2['central_participants'] = groups_df_level_2['central_participants'].apply(json.dumps)
  groups_df_level_2['intermediate_participants'] = groups_df_level_2['intermediate_participants'].apply(json.dumps)
  groups_df_level_2['central_participants'] = pd.Series(groups_df_level_2['central_participants'])
  groups_df_level_2['intermediate_participants'] = pd.Series(groups_df_level_2['intermediate_participants'])

  # Add insights to the phone_trunc_insights_df
  phones_level_1 = set(phone for sublist in groups_df_level_1['phone_trunc'] for phone in sublist)
  phones_level_2 = set(phone for sublist in groups_df_level_2['phone_trunc'] for phone in sublist)
  phone_trunc_insights_df['triangular_level_1'] = phone_trunc_insights_df['phone_trunc'].apply(lambda x: check_presence(x, phones_level_1))
  phone_trunc_insights_df['triangular_level_2'] = phone_trunc_insights_df['phone_trunc'].apply(lambda x: check_presence(x, phones_level_2))


  journey_ids_level_1 = potential_fraud_carpool_with_insights_df_level_1.operator_journey_id.unique()
  journey_ids_level_2 = potential_fraud_carpool_with_insights_df_level_2.operator_journey_id.unique()
  phones_in_flagged_journeys_level_1 = df_carpool[df_carpool['operator_journey_id'].isin(journey_ids_level_1)]['phone_trunc'].unique()
  phones_in_flagged_journeys_level_2 = df_carpool[df_carpool['operator_journey_id'].isin(journey_ids_level_2)]['phone_trunc'].unique()
  phone_trunc_insights_df['traveled_with_level_1'] = phone_trunc_insights_df['phone_trunc'].isin(phones_in_flagged_journeys_level_1)
  phone_trunc_insights_df['traveled_with_level_2'] = phone_trunc_insights_df['phone_trunc'].isin(phones_in_flagged_journeys_level_2)

  phone_trunc_insights_df.drop_duplicates(subset='phone_trunc',inplace=True)

  # Merge triangulars to avoid redundancy
  groups_df_combined['phone_trunc_set'] = groups_df_combined['phone_trunc'].apply(set)
  groups_df_combined = groups_df_combined[['phone_trunc', 'num_participants', 'num_trips',
        'operator_list', 'num_operators', 'average_duration', 'departure_date',
        'end_date', 'average_daily_trips', 'total_change_percentage',
        'total_incentives','journey_id_list', 'level','phone_trunc_set']].copy()
  

  G = nx.Graph()
  for (idx1, row1), (idx2, row2) in itertools.combinations(groups_df_combined.iterrows(), 2):
      if row1['phone_trunc_set'] & row2['phone_trunc_set']:  # If intersection is not empty
          G.add_edge(idx1, idx2)
  components = list(nx.connected_components(G))
  merged_rows = []

  for component in components:
      component_indices = list(component)
      rows = groups_df_combined.loc[component_indices]
      merged_row = {
          'phone_trunc': list(set(itertools.chain.from_iterable(rows['phone_trunc']))),
          'num_participants': None,
          'total_incentives' : rows['total_incentives'].sum(),
          'num_trips': rows['num_trips'].sum(),
          'operator_list': list(set(itertools.chain.from_iterable(rows['operator_list']))),
          'num_operators': None,  
          'average_duration': rows['average_duration'].mean(),
          'departure_date': rows['departure_date'].min(),
          'end_date': rows['end_date'].max(),
          'average_daily_trips': rows['average_daily_trips'].mean(),
          'level': 1 if any(rows['level'] == 1) else 2 
      }

      merged_row['num_participants'] = len(merged_row['phone_trunc'])
      merged_row['num_operators'] = len(merged_row['operator_list'])

      merged_rows.append(merged_row)

  merged_df = pd.DataFrame(merged_rows)
  all_indices = set(groups_df_combined.index)
  merged_indices = set(itertools.chain.from_iterable(components))
  unmerged_indices = all_indices - merged_indices
  unmerged_indices_list = list(unmerged_indices)
  unmerged_df = groups_df_combined.loc[unmerged_indices_list]
  final_triangular_df = pd.concat([merged_df, unmerged_df[merged_df.columns]], ignore_index=True)
  final_triangular_df['total_incentives'] = final_triangular_df.apply(calculate_total_incentive, df_carpool=df_carpool, axis=1)

  # Identity phone_trunc changes
  operator_user_ids = df_carpool.operator_user_id.unique().tolist()
  formatted_ids = ', '.join(f"'{id}'" for id in operator_user_ids)
  query = f"""
  SELECT 
      operator_user_id, 
      phone_trunc,
      identity_key, 
      created_at, 
      updated_at
  FROM 
      carpool.identities
  WHERE 
      operator_user_id IN ({formatted_ids}) AND updated_at < NOW() - '{delay} days'::interval;
  """

  with engine.connect() as conn:
    df_identities = pd.read_sql_query(text(query), conn)

  df_identities['updated_at'] = pd.to_datetime(df_identities['updated_at'])
  df_identities.sort_values(by=['operator_user_id', 'updated_at'], inplace=True)
  df_identities['year_month'] = df_identities['updated_at'].dt.to_period('M')
  df_identities['prev_phone_trunc'] = df_identities.groupby('operator_user_id')['phone_trunc'].shift(1)
  df_identities['prev_identity_key'] = df_identities.groupby('operator_user_id')['identity_key'].shift(1)
  df_identities['phone_trunc_changed'] = df_identities.apply(lambda row: is_changed(row['phone_trunc'], row['prev_phone_trunc']), axis=1)
  df_identities['identity_key_changed'] = df_identities.apply(lambda row: is_changed(row['identity_key'], row['prev_identity_key']), axis=1)
  df_identities['change_detected'] = df_identities['phone_trunc_changed'] | df_identities['identity_key_changed']
  user_phone_change_history_df = df_identities.groupby('year_month')['identity_key_changed'].sum().reset_index()
  user_phone_change_history_df.columns = ['year_month', 'total_changes']

  # Add to phone_trunc_insights_df the number of changes per operator_user_id
  phone_trunc_insights_df = phone_trunc_insights_df.merge(df_identities.groupby('operator_user_id')['phone_trunc_changed'].sum().reset_index(),how='left').copy()
  
  return df_carpool,phone_trunc_insights_df,final_triangular_df,user_phone_change_history_df


# In[ ]:

engine = create_engine(connection_string, connect_args={'sslmode':'require'})


df_carpool,phone_trunc_insights_df,final_triangular_df,user_phone_change_history_df = create_insights_and_triangular_df(delay, frame, aom_insee,engine)


# ## 5.Storage

# In[ ]:


## Store the phone_trunc_insights_df to the db

def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['phone_trunc', 'departure_date', 'end_date'])
    conn.execute(on_duplicate_key_stmt)
    
phone_trunc_insights_df.to_sql(
    name="phone_insights_detailed",
    schema="fraudcheck",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict)


# In[ ]:

from datetime import date


def cast_period_to_date(x):
    return date(x.year_month.year, x.year_month.month, 1)

user_phone_change_history_df['year_month'] = user_phone_change_history_df.apply(cast_period_to_date, axis=1)

## Store the final_triangular_df to the db

def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['phone_trunc', 'departure_date', 'end_date'])
    conn.execute(on_duplicate_key_stmt)
    
final_triangular_df.to_sql(
    name="triangular_patterns", 
    schema="fraudcheck",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict
)


# In[ ]:


# Store user_phone_change_history_df to the db 
def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['year_month'])
    conn.execute(on_duplicate_key_stmt)
    
user_phone_change_history_df.to_sql(
    name="user_phone_change_history", 
    schema="fraudcheck",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict
)


# # END
