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
import sqlalchemy as sa
from sqlalchemy import create_engine, text

from helpers.apply_metods import add_overlap_columns, remove_carpool_with_same_passenger_and_no_overlap, remove_carpool_with_lowest_overlap_duration


# Input params checks
try: update_carpool_status
except NameError:
  update_carpool_status = os.environ['UPDATE_CARPOOL_STATUS'] == "true" or False

try: connection_string
except NameError:
  connection_string = os.environ['PG_CONNECTION_STRING']

try: delay
except NameError:
  delay = os.environ['DELAY']

try: frame
except NameError:
  frame = os.environ['FRAME'] 



# In[ ]:

engine = create_engine(connection_string, connect_args={'sslmode':'require'})

query = f"""SELECT cc._id, cc.is_driver, ci.phone_trunc, ci.identity_key, cc.datetime, cc.duration, cc.operator_id, 
ST_AsText(cc.start_position) as start_wkt, ST_AsText(cc.end_position) as end_wkt, 
cc.operator_journey_id,
cc.distance,
ci.operator_user_id,
cc.end_position,
cc.operator_trip_id,
 
cc2.is_driver as other_is_driver,
ci2.phone_trunc as other_phone_trunc,
ci2.identity_key as other_identity_key
FROM CARPOOL.CARPOOLS cc
   join carpool.identities ci on cc.identity_id = ci._id
   JOIN CARPOOL.CARPOOLS AS CC2 ON CC.OPERATOR_JOURNEY_ID = CC2.OPERATOR_JOURNEY_ID and CC.is_driver != cc2.is_driver
   JOIN CARPOOL.IDENTITIES AS CI2 on CC2.IDENTITY_ID = CI2._id
    WHERE CC.DATETIME >= NOW() - '{delay} hours'::interval - '{frame} hours'::interval
	AND CC.DATETIME < NOW() - '{delay} hours'::interval
    AND cc.operator_id != 11
"""

with engine.connect() as conn:
    df_carpool = pd.read_sql_query(text(query), conn)


# # Etape 1 
# 
# Suppression des trajets dont l'`identity_key` n'apprait pas sur plusieurs opérateur différents.
# Permet de faire un tri simple avant d'ajouter les clées de regroupements 

# In[ ]:


grouped_tmp = df_carpool.groupby(['identity_key'])
phone_trunc_grouped_filtered = grouped_tmp.filter(lambda x: len(pd.unique(x['operator_id'])) > 1)


# # Etape 2
# 
# Ajout d'une colonne `overlap_group` permettant d'identifier les chevauchements temporels des trajets pour une `identity_key`

# In[ ]:


df_only_grouped_with_overlap_group_filled = phone_trunc_grouped_filtered.assign(overlap_group=100)
df_only_grouped_with_overlap_group_filled = df_only_grouped_with_overlap_group_filled.assign(overlap_duration=0)

grouped_tmp = df_only_grouped_with_overlap_group_filled.groupby(['identity_key'],group_keys=False)

df_only_grouped_with_overlap_group_filled = grouped_tmp.apply(lambda df: add_overlap_columns(df)).reset_index(drop=True)


# # Etape 3
# 
# Suppression des `identity_key` qui ne respectent pas les conditions : 
# 1. plusieurs trajets sur une un même période temporelle (plusieurs trajets sur un même overlap_group)
# 2. plusieurs opérateurs différents

# In[ ]:


grouped_tmp = df_only_grouped_with_overlap_group_filled.groupby(['identity_key', 'overlap_group'],group_keys=False)
df_more_than_one_occ = grouped_tmp.filter(lambda x:  len(pd.unique(x['operator_id'])) > 1 and x['overlap_group'].count() > 1)


# # Etape 4
# 
# On supprime les trajets dont le passager apparait plusieurs fois dans un groupe mais qui n'ont pas de chevauchement temporel.
# (i.e on supprime les passagers qui ont covoituré plusieurs fois avec le même conducteur à des moments différents de la journée)
# 
# Pour comprendre pourquoi ils ne sont pas supprimés sur l'étape 1 : 
# - On a une ligne par personne par trajet
# - La ligne passager pour l' `identity_key` est effacée mais pas la ligne driver correspondante, c'est ce qui est fait ici
# 

# In[ ]:


grouped_tmp = df_more_than_one_occ.groupby(['identity_key', 'overlap_group'], group_keys=False)

df_more_than_one_occ_enhanced = grouped_tmp.apply(lambda x: remove_carpool_with_same_passenger_and_no_overlap(x)).reset_index(drop=True)


# ## Etape 5
# 
# On supprime les chevauchement sur un même opérateur pour des passagers identiques pour palier au mauvais calibrage de l'algo sur le calcul des groupes de chevauchement.
# En effet, il se peut qu'un trajet de type aller-retour soit pris dans la fraude sur un chevauchement de quelques secondes

# In[ ]:


grouped_tmp = df_more_than_one_occ_enhanced.groupby(['identity_key', 'overlap_group', 'operator_id', 'other_identity_key'])

df_without_overlap_on_same_operator = grouped_tmp.apply(lambda x: remove_carpool_with_lowest_overlap_duration(x)).reset_index(drop=True)


# In[ ]:


grouped_tmp = df_without_overlap_on_same_operator.groupby(['identity_key', 'overlap_group'])
df_more_than_one_occ_2 = grouped_tmp.filter(lambda x:  len(pd.unique(x['operator_id'])) > 1 and x['overlap_group'].count() > 1)


# # Step 6
# 
# On supprime les conducteurs qui covoiturent avec plusieurs passagers sur des applications différentes.

# In[ ]:


driver_mask = df_more_than_one_occ_2.is_driver == True 

grouped_tmp = df_more_than_one_occ_2[driver_mask].groupby(['identity_key', 'overlap_group'], group_keys=False)

df_with_authorized_multiop_driver = grouped_tmp.filter(lambda x: (\
    len(pd.unique(x['other_identity_key'])) == len(x) and \
    len(pd.unique(x['operator_id'])) == len(x) and \
    len(pd.unique(x['other_identity_key'])) > 1 and \
    len(pd.unique(x['operator_id'])) > 1))

df_no_driver_different_operators = df_more_than_one_occ_2.loc[~df_more_than_one_occ_2._id.isin(df_with_authorized_multiop_driver._id.unique())]


# # Step 7
# 
# On ne garde enfin que les trajets respectant les conditions suivantes: 
# - 1 `identity_key`
# - sur 2 opérateurs différents 
# - sur des bornes temporelles qui se chevauchent
# 
# Une assertion est faite par la suite pour s'assurer qu'aucun trajet n'est supprimé si tous les trajets ne respectent pas la condition

# In[ ]:


grouped_tmp = df_no_driver_different_operators.groupby(['identity_key', 'other_identity_key', 'overlap_group'])

aggregated_journey_id_by_overlap = grouped_tmp.agg(unique_operator_count=('operator_id', 'nunique'), journey_id_list=('operator_journey_id', list), carpool_id_list=('_id', list)).reset_index()

single_trip_mask = aggregated_journey_id_by_overlap['unique_operator_count'] == 1

carpool_id_list = aggregated_journey_id_by_overlap[single_trip_mask]['carpool_id_list']

carpool_id_list_flat = [item for sublist in carpool_id_list for item in sublist]

df_final_result = df_no_driver_different_operators.loc[~df_no_driver_different_operators._id.isin(carpool_id_list_flat)]


# In[ ]:


grouped_tmp = df_final_result.groupby(['identity_key', 'other_identity_key', 'overlap_group'])

control_matrix = grouped_tmp.agg(unique_operator_count=('operator_id', 'nunique'), journey_id_list=('operator_journey_id', list)).reset_index()

assert (control_matrix['unique_operator_count'] > 1).all()


# # Step 8
# 
# Mise à jour des carpools retenus en status `fraudcheck_error`

# In[ ]:



if update_carpool_status is True:

    metadata = sa.MetaData(schema='carpool')
    metadata.reflect(bind=engine)

    table = metadata.tables['carpool.carpools']
    
    print(f"Updating {len(df_final_result['carpool_id'])} carpools with fraudcheck_error")

    where_clause = table.c._id.in_(df_final_result['_id'].to_list())

    update_stmt = sa.update(table).where(where_clause).values(status='fraudcheck_error')

    with engine.connect() as conn:
        result = conn.execute(update_stmt)
        conn.commit()


# # Step 9
# 
# Ajout des labels dans une table

# In[ ]:


df_labels = pd.DataFrame(df_final_result['_id'])
df_labels.columns = ['carpool_id']
df_labels = df_labels.assign(label='interoperator_fraud')


# In[ ]:


from sqlalchemy.dialects.postgresql import insert

def insert_or_do_nothing_on_conflict(table, conn, keys, data_iter):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(index_elements=['carpool_id', 'label'])
    conn.execute(on_duplicate_key_stmt)

df_labels.to_sql(
    name="labels",
    schema="fraudcheck",
    con=engine,
    if_exists="append",
    index=False,
    method=insert_or_do_nothing_on_conflict
)

