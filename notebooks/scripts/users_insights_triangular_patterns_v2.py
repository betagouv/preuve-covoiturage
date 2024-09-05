import datetime
import itertools
import json
import math
import os
from datetime import datetime
from functools import partial

import networkx as nx
import numpy as np
import pandas as pd
import pytz
from sqlalchemy import create_engine, text
from sqlalchemy.dialects.postgresql import insert


# Add flag for night trips
def is_night_time(time, start, end):
    if start <= end:
        return start <= time <= end
    else:
        return start <= time or time <= end


# Calculate percentage of boolean column
def calculate_percentages(df, column):
    counts = df[column].value_counts(normalize=True) * 100
    return counts


def intra_day_change_count(row):
    if len(row["roles"]) <= 1:
        return 0
    count = sum(
        (row["roles"][i] != row["roles"][i + 1])
        for i in range(len(row["roles"]) - 1)
        if row["carpool_day_list"][i] == row["carpool_day_list"][i + 1]
    )
    return count


def total_change_count(row):
    if len(row["roles"]) <= 1:
        return 0
    count = sum(
        (row["roles"][i] != row["roles"][i + 1]) for i in range(len(row["roles"]) - 1)
    )
    return count


def intra_day_change_percentage(row):
    unique_days = np.unique(row["carpool_day_list"])
    count = sum(
        1
        for day in unique_days
        if any(
            (row["roles"][i] != row["roles"][i + 1])
            for i in range(len(row["roles"]) - 1)
            if row["carpool_day_list"][i] == day
            and row["carpool_day_list"][i + 1] == day
        )
    )
    percentage = np.round(count / len(unique_days) * 100, 2)
    return percentage


def count_consecutive_changes(date_list, role_list):
    df = pd.DataFrame({"Date": date_list, "Role": role_list})
    consecutive_changes = []
    for date, group in df.groupby("Date"):
        consecutive_changes_count = 0
        previous_value = None

        for index, row in group.iterrows():
            current_value = row["Role"]

            if previous_value is not None and current_value != previous_value:
                consecutive_changes_count += 1

            previous_value = current_value

        consecutive_changes.append(consecutive_changes_count)

    return consecutive_changes


def check_presence(phone, level_set):
    return True if phone in level_set else False


def calculate_total_incentive(row, df_carpool):
    phone_truncs = row["phone_trunc"]
    total_incentive = df_carpool[
        df_carpool.phone_trunc.isin(phone_truncs)
    ].incentive.sum()
    return total_incentive


def is_changed(current, previous):
    if pd.isna(current) and pd.isna(previous):
        return False
    if pd.isna(current) or pd.isna(previous):
        return False
    return current != previous


def create_insights_and_triangular_df(delay, frame, aom_insee, engine):
    query = f"""
select
	cc._id,
	cc.is_driver,
	ci.phone_trunc,
	cc.datetime,
	cc.duration,
	cc.operator_id,
	cc.seats,
	ST_AsText(cc.start_position) as start_wkt,
	ST_AsText(cc.end_position) as end_wkt,
	cc.operator_journey_id,
	cc.distance,
	ci.operator_user_id,
	cc.end_position,
	case
		when pi.amount >= 0 then pi.amount
		else 0
	end as incentive,
	cc.operator_trip_id,
	cc2.is_driver as other_is_driver,
	ci2.phone_trunc as other_phone_trunc
from
	CARPOOL.CARPOOLS cc
join carpool.identities ci on
	cc.identity_id = ci._id
join geo.perimeters gps on
	cc.start_geo_code = gps.arr
	and gps.year = 2022
join geo.perimeters gpe on
	cc.end_geo_code = gpe.arr
	and gpe.year = 2022
left join policy.incentives pi on
	pi.carpool_id = cc._id
join CARPOOL.CARPOOLS as CC2 on
	CC.OPERATOR_JOURNEY_ID = CC2.OPERATOR_JOURNEY_ID
	and CC.is_driver != cc2.is_driver
join CARPOOL.IDENTITIES as CI2 on
	CC2.IDENTITY_ID = CI2._id
where
	CC.DATETIME >= NOW() - '{delay} days'::interval - '{frame} days'::interval
	and CC.DATETIME < NOW() - '{delay} days'::interval
  {f"and (gps.aom = '{aom_insee}' or gpe.aom = '{aom_insee}' or gps.reg = '{aom_insee}' or gpe.reg = '{aom_insee}') and gps.year = 2022 and gpe.year = 2022" if aom_insee else ""}
"""

    with engine.connect() as conn:
        df_carpool = pd.read_sql_query(text(query), conn)

    df_carpool = df_carpool.sort_values("datetime")
    # convert to french timezone
    df_carpool["datetime_france"] = df_carpool["datetime"].dt.tz_convert("Europe/Paris")

    df_carpool["day_month_year"] = df_carpool["datetime_france"].dt.strftime("%Y-%m-%d")

    # add boolean flags for night trips
    df_carpool["night_21_to_6"] = (df_carpool["datetime_france"].dt.hour >= 21) | (
        df_carpool["datetime_france"].dt.hour <= 6
    )
    df_carpool["night_21_to_5"] = (df_carpool["datetime_france"].dt.hour >= 21) | (
        df_carpool["datetime_france"].dt.hour <= 5
    )

    df_carpool["night_22_to_5"] = (df_carpool["datetime_france"].dt.hour >= 22) | (
        df_carpool["datetime_france"].dt.hour <= 5
    )

    # Convert and create some features
    df_carpool["day"] = df_carpool["datetime_france"].dt.date
    df_carpool["incentive"] = df_carpool["incentive"] / 100
    df_carpool["duration"] = (df_carpool["duration"] / 60).round()
    df_carpool["distance"] = (df_carpool["distance"] / 1000).round()

    # Update the correct number of seats used per journey id
    df_seats_by_journey_id = df_carpool.groupby(
        "operator_journey_id", as_index=False
    ).agg(total_seats=("seats", "sum"))

    df_carpool = df_carpool.merge(
        df_seats_by_journey_id, how="left", on="operator_journey_id"
    )

    # Creation of insights for each operator user id
    phone_trunc_insights_df = df_carpool.groupby(
        "operator_user_id", as_index=False
    ).agg(
        num_trips=("operator_journey_id", "count"),
        phone_trunc=("phone_trunc", "unique"),
        datetime_first_trip=("datetime_france", "min"),
        datetime_last_trip=("datetime_france", "max"),
        trip_datetimes=("datetime_france", list),
        trip_dates_str=("day", list),
        average_duration=("duration", "mean"),
        average_distance=("distance", "mean"),
        total_incentives=("incentive", "sum"),
        percentage_trip_as_driver=("is_driver", "mean"),
        is_driver_list=("is_driver", list),
        role_change=("is_driver", lambda x: x.nunique() > 1),
        carpool_days=("day", "nunique"),
        operator_journey_id_list=("operator_journey_id", list),
        operators_list=("operator_id", list),
        num_unique_operators=("operator_id", "nunique"),
        average_seats=("total_seats", "mean"),
        count_night_time_21_6=("night_21_to_5", "count"),
        has_night_time_21_6=("night_21_to_5", "any"),
        percentage_night_time_21_6=("night_21_to_5", "mean"),
        count_night_time_21_5=("night_21_to_5", "count"),
        has_night_time_21_5=("night_21_to_5", "any"),
        percentage_night_time_21_5=("night_21_to_5", "mean"),
        count_night_time_22_5=("night_21_to_5", "count"),
        has_has_night_time_22_5=("night_21_to_5", "any"),
        percentage_night_tim_22_5=("night_21_to_5", "mean"),
    )

    phone_trunc_insights_df = phone_trunc_insights_df.merge(
        (
            df_carpool.groupby(
                ["operator_user_id", pd.Grouper(key="datetime", freq="1d")],
            )["is_driver"].nunique()
            > 1
        )
        .groupby("operator_user_id")
        .sum()
        .rename("count_days_with_intraday_role_changes"),
        left_on="operator_user_id",
        right_index=True,
        how="left",
    )

    phone_trunc_insights_df = phone_trunc_insights_df.merge(
        df_carpool.groupby("operator_user_id").agg(
            total_consecutive_role_changes=("is_driver", lambda x: x.diff().sum())
        ),
        left_on="operator_user_id",
        right_index=True,
        how="left",
    )

    phone_trunc_insights_df["average_duration"] = np.round(
        phone_trunc_insights_df["average_duration"].round()
    )
    phone_trunc_insights_df["average_distance"] = np.round(
        phone_trunc_insights_df["average_distance"].round()
    )

    phone_trunc_insights_df["toal_days_wetween_first_and_last_trip"] = (
        phone_trunc_insights_df["datetime_last_trip"]
        - phone_trunc_insights_df["datetime_first_trip"]
    ).dt.days

    phone_trunc_insights_df["average_trip_count_per_day"] = (
        phone_trunc_insights_df["num_trips"] / phone_trunc_insights_df["carpool_days"]
    )

    phone_trunc_insights_df["percentage_trip_as_driver"] = phone_trunc_insights_df[
        "percentage_trip_as_driver"
    ].round(2)

    phone_trunc_insights_df["percentage_days_with_intraday_role_changes"] = (
        phone_trunc_insights_df["count_days_with_intraday_role_changes"]
        / phone_trunc_insights_df["carpool_days"]
    )
    phone_trunc_insights_df["percentage_total_consecutive_change"] = (
        phone_trunc_insights_df["total_consecutive_role_changes"]
        / phone_trunc_insights_df["carpool_days"]
    )

    phone_trunc_insights_df["phone_trunc"] = phone_trunc_insights_df[
        "phone_trunc"
    ].str.join(",")

    phone_trunc_insights_df["occupancy_rate_exceeded"] = (
        phone_trunc_insights_df["average_seats"]
        > phone_trunc_insights_df["average_seats"].mean()
    )

    # Triangular Table Creation
    phone_numbers = phone_trunc_insights_df["phone_trunc"].to_list()
    potential_fraud_carpool_df = df_carpool[
        df_carpool["phone_trunc"].isin(phone_numbers)
    ]
    potential_fraud_carpool_with_insights_df = potential_fraud_carpool_df.merge(
        phone_trunc_insights_df, how="left", on="phone_trunc"
    )

    potential_fraud_carpool_with_insights_df_level_1 = (
        potential_fraud_carpool_with_insights_df[
            potential_fraud_carpool_with_insights_df[
                "percentage_total_consecutive_change"
            ]
            >= 2
        ]
    )

    # For level 1
    filtered_df_grouped_level_1 = (
        potential_fraud_carpool_with_insights_df_level_1.groupby(
            ["operator_journey_id"], as_index=False
        ).agg(
            phone_trunc_list=("phone_trunc", list),
            percentage_days_with_intraday_role_changes_list=(
                "percentage_days_with_intraday_role_changes",
                list,
            ),
            count_days_with_intraday_role_changes_list=(
                "count_days_with_intraday_role_changes",
                list,
            ),
            role_change_list=("role_change", list),
            percentage_total_consecutive_change_list=(
                "percentage_total_consecutive_change",
                list,
            ),
        )
    )

    filtered_df_grouped_level_1 = filtered_df_grouped_level_1[
        filtered_df_grouped_level_1["role_change"].apply(lambda x: x != [False, False])
    ]

    potential_fraud_carpool_with_insights_df_level_2 = (
        potential_fraud_carpool_with_insights_df[
            potential_fraud_carpool_with_insights_df[
                "percentage_total_consecutive_change"
            ]
            >= 1
        ]
    )

    # For level 2
    filtered_df_grouped_level_2 = (
        potential_fraud_carpool_with_insights_df_level_2.groupby(
            ["operator_journey_id"]
        ).agg(
            phone_trunc_list=("phone_trunc", list),
            percentage_days_with_intraday_role_changes_list=(
                "percentage_days_with_intraday_role_changes",
                list,
            ),
            count_days_with_intraday_role_changes_list=(
                "count_days_with_intraday_role_changes",
                list,
            ),
            role_change_list=("role_change", list),
            percentage_total_consecutive_change_list=(
                "percentage_total_consecutive_change",
                list,
            ),
        )
    )

    filtered_df_grouped_level_2 = filtered_df_grouped_level_1[
        filtered_df_grouped_level_2["role_change"].apply(lambda x: x != [False, False])
    ]

    journey_to_phones = (
        potential_fraud_carpool_with_insights_df_level_2.groupby("operator_journey_id")[
            "phone_trunc"
        ]
        .apply(list)
        .to_dict()
    )

    # algorithme de création de groupe frauduleux
    G = nx.Graph()
    journey_to_phones = (
        potential_fraud_carpool_with_insights_df_level_1.groupby("operator_journey_id")[
            "phone_trunc"
        ]
        .apply(list)
        .to_dict()
    )

    for journey, phones in journey_to_phones.items():
        # Ensure all phone numbers are unique in the list to avoid self-loops
        unique_phones = set(phones)
        # Create edges between all pairs of phone_truncs for this journey
        for phone1 in unique_phones:
            for phone2 in unique_phones:
                if phone1 != phone2:
                    if G.has_edge(phone1, phone2):
                        G[phone1][phone2]["shared_journeys"].add(journey)
                    else:
                        G.add_edge(phone1, phone2, shared_journeys={journey})

    connected_components = nx.connected_components(G)

    group_data = []

    for idx, component in enumerate(connected_components):
        group_graph = G.subgraph(component)
        degree_centrality = nx.degree_centrality(group_graph)
        betweenness_centrality = nx.betweenness_centrality(group_graph)
        group_phones = pd.Series(list(component))
        group_journeys = df_carpool[df_carpool["phone_trunc"].isin(group_phones)]
        group_journeys = group_journeys.drop_duplicates("operator_journey_id").copy()
        group_journeys = potential_fraud_carpool_with_insights_df[
            potential_fraud_carpool_with_insights_df["phone_trunc"].isin(group_phones)
        ].copy()
        group_duration = np.round(group_journeys["duration"].mean())
        group_operator_id = group_journeys["operator_journey_id"].copy()
        group_journeys["date"] = group_journeys["datetime"].dt.date.copy()
        total_change_percentage = np.unique(
            group_journeys["total_change_percentage"].to_list()
        )

        group_data.append(
            {
                "groupe": idx + 1,
                "phone_trunc": list(group_phones),
                "num_participants": len(group_phones),
                "num_trips": len(group_journeys.operator_journey_id.unique()),
                "operator_list": list(group_journeys.operator_id.unique()),
                "num_operators": len(group_journeys.operator_id.unique()),
                "average_duration": group_duration,
                "departure_date": group_journeys["datetime"].min(),
                "end_date": group_journeys["datetime"].max(),
                "average_daily_trips": np.round(
                    group_journeys.drop_duplicates("operator_journey_id")["datetime"]
                    .dt.date.value_counts()
                    .sort_index()
                    .mean()
                ),
                "total_change_percentage": list(total_change_percentage),
                "total_incentives": np.sum(
                    group_journeys.drop_duplicates("operator_journey_id")["incentive"]
                ),
                "central_participants": degree_centrality,
                "intermediate_participants": betweenness_centrality,
                "journey_id_list": list(group_operator_id),
            }
        )
    groups_df_level_1 = pd.DataFrame(group_data)

    groups_df_level_1["operator_list"] = groups_df_level_1["operator_list"].apply(
        lambda x: list(map(int, x))
    )
    groups_df_level_1["total_change_percentage"] = groups_df_level_1[
        "total_change_percentage"
    ].apply(lambda x: list(map(float, x)))
    groups_df_level_1["central_participants"] = groups_df_level_1[
        "central_participants"
    ].apply(json.dumps)
    groups_df_level_1["intermediate_participants"] = groups_df_level_1[
        "intermediate_participants"
    ].apply(json.dumps)
    groups_df_level_1["central_participants"] = pd.Series(
        groups_df_level_1["central_participants"]
    )
    groups_df_level_1["intermediate_participants"] = pd.Series(
        groups_df_level_1["intermediate_participants"]
    )

    # Level 2
    G = nx.Graph()
    journey_to_phones = (
        potential_fraud_carpool_with_insights_df_level_2.groupby("operator_journey_id")[
            "phone_trunc"
        ]
        .apply(list)
        .to_dict()
    )

    for journey, phones in journey_to_phones.items():
        unique_phones = set(phones)
        for phone1 in unique_phones:
            for phone2 in unique_phones:
                if phone1 != phone2:
                    if G.has_edge(phone1, phone2):
                        G[phone1][phone2]["shared_journeys"].add(journey)
                    else:
                        G.add_edge(phone1, phone2, shared_journeys={journey})

    connected_components = nx.connected_components(G)

    group_data = []

    for idx, component in enumerate(connected_components):
        group_graph = G.subgraph(component)
        degree_centrality = nx.degree_centrality(group_graph)
        betweenness_centrality = nx.betweenness_centrality(group_graph)
        group_phones = pd.Series(list(component))
        group_journeys = df_carpool[df_carpool["phone_trunc"].isin(group_phones)]
        group_journeys = group_journeys.drop_duplicates("operator_journey_id").copy()
        group_journeys = potential_fraud_carpool_with_insights_df[
            potential_fraud_carpool_with_insights_df["phone_trunc"].isin(group_phones)
        ].copy()
        group_duration = np.round(group_journeys["duration"].mean())
        group_operator_id = group_journeys["operator_journey_id"].copy()
        group_journeys["date"] = group_journeys["datetime"].dt.date.copy()
        total_change_percentage = np.unique(
            group_journeys["total_change_percentage"].to_list()
        )

        group_data.append(
            {
                "groupe": idx + 1,
                "phone_trunc": list(group_phones),
                "num_participants": len(group_phones),
                "num_trips": len(group_journeys.operator_journey_id.unique()),
                "operator_list": list(group_journeys.operator_id.unique()),
                "num_operators": len(group_journeys.operator_id.unique()),
                "average_duration": group_duration,
                "departure_date": group_journeys["datetime"].min(),
                "end_date": group_journeys["datetime"].max(),
                "average_daily_trips": np.round(
                    group_journeys.drop_duplicates("operator_journey_id")["datetime"]
                    .dt.date.value_counts()
                    .sort_index()
                    .mean()
                ),
                "total_change_percentage": list(total_change_percentage),
                "total_incentives": np.sum(
                    group_journeys.drop_duplicates("operator_journey_id")["incentive"]
                ),
                "central_participants": degree_centrality,
                "intermediate_participants": betweenness_centrality,
                "journey_id_list": list(group_operator_id),
            }
        )
    groups_df_level_2 = pd.DataFrame(group_data)

    groups_df_level_1["level"] = 1
    groups_df_level_2["level"] = 2

    groups_df_combined = pd.concat(
        [groups_df_level_1, groups_df_level_2], ignore_index=True
    )

    groups_df_level_2["operator_list"] = groups_df_level_2["operator_list"].apply(
        lambda x: list(map(int, x))
    )
    groups_df_level_2["total_change_percentage"] = groups_df_level_2[
        "total_change_percentage"
    ].apply(lambda x: list(map(float, x)))
    groups_df_level_2["central_participants"] = groups_df_level_2[
        "central_participants"
    ].apply(json.dumps)
    groups_df_level_2["intermediate_participants"] = groups_df_level_2[
        "intermediate_participants"
    ].apply(json.dumps)
    groups_df_level_2["central_participants"] = pd.Series(
        groups_df_level_2["central_participants"]
    )
    groups_df_level_2["intermediate_participants"] = pd.Series(
        groups_df_level_2["intermediate_participants"]
    )

    # Add insights to the phone_trunc_insights_df
    phones_level_1 = set(
        phone for sublist in groups_df_level_1["phone_trunc"] for phone in sublist
    )
    phones_level_2 = set(
        phone for sublist in groups_df_level_2["phone_trunc"] for phone in sublist
    )
    phone_trunc_insights_df["triangular_level_1"] = phone_trunc_insights_df[
        "phone_trunc"
    ].apply(lambda x: check_presence(x, phones_level_1))
    phone_trunc_insights_df["triangular_level_2"] = phone_trunc_insights_df[
        "phone_trunc"
    ].apply(lambda x: check_presence(x, phones_level_2))

    journey_ids_level_1 = (
        potential_fraud_carpool_with_insights_df_level_1.operator_journey_id.unique()
    )
    journey_ids_level_2 = (
        potential_fraud_carpool_with_insights_df_level_2.operator_journey_id.unique()
    )
    phones_in_flagged_journeys_level_1 = df_carpool[
        df_carpool["operator_journey_id"].isin(journey_ids_level_1)
    ]["phone_trunc"].unique()
    phones_in_flagged_journeys_level_2 = df_carpool[
        df_carpool["operator_journey_id"].isin(journey_ids_level_2)
    ]["phone_trunc"].unique()
    phone_trunc_insights_df["traveled_with_level_1"] = phone_trunc_insights_df[
        "phone_trunc"
    ].isin(phones_in_flagged_journeys_level_1)
    phone_trunc_insights_df["traveled_with_level_2"] = phone_trunc_insights_df[
        "phone_trunc"
    ].isin(phones_in_flagged_journeys_level_2)

    phone_trunc_insights_df.drop_duplicates(subset="phone_trunc", inplace=True)

    # Merge triangulars to avoid redundancy
    groups_df_combined["phone_trunc_set"] = groups_df_combined["phone_trunc"].apply(set)
    groups_df_combined = groups_df_combined[
        [
            "phone_trunc",
            "num_participants",
            "num_trips",
            "operator_list",
            "num_operators",
            "average_duration",
            "departure_date",
            "end_date",
            "average_daily_trips",
            "total_change_percentage",
            "total_incentives",
            "journey_id_list",
            "level",
            "phone_trunc_set",
        ]
    ].copy()

    G = nx.Graph()
    for (idx1, row1), (idx2, row2) in itertools.combinations(
        groups_df_combined.iterrows(), 2
    ):
        if (
            row1["phone_trunc_set"] & row2["phone_trunc_set"]
        ):  # If intersection is not empty
            G.add_edge(idx1, idx2)
    components = list(nx.connected_components(G))
    merged_rows = []

    for component in components:
        component_indices = list(component)
        rows = groups_df_combined.loc[component_indices]
        merged_row = {
            "phone_trunc": list(
                set(itertools.chain.from_iterable(rows["phone_trunc"]))
            ),
            "num_participants": None,
            "total_incentives": rows["total_incentives"].sum(),
            "num_trips": rows["num_trips"].sum(),
            "operator_list": list(
                set(itertools.chain.from_iterable(rows["operator_list"]))
            ),
            "num_operators": None,
            "average_duration": rows["average_duration"].mean(),
            "departure_date": rows["departure_date"].min(),
            "end_date": rows["end_date"].max(),
            "average_daily_trips": rows["average_daily_trips"].mean(),
            "level": 1 if any(rows["level"] == 1) else 2,
        }

        merged_row["num_participants"] = len(merged_row["phone_trunc"])
        merged_row["num_operators"] = len(merged_row["operator_list"])

        merged_rows.append(merged_row)

    merged_df = pd.DataFrame(merged_rows)
    all_indices = set(groups_df_combined.index)
    merged_indices = set(itertools.chain.from_iterable(components))
    unmerged_indices = all_indices - merged_indices
    unmerged_indices_list = list(unmerged_indices)
    unmerged_df = groups_df_combined.loc[unmerged_indices_list]
    final_triangular_df = pd.concat(
        [merged_df, unmerged_df[merged_df.columns]], ignore_index=True
    )
    final_triangular_df["total_incentives"] = final_triangular_df.apply(
        calculate_total_incentive, df_carpool=df_carpool, axis=1
    )

    # Identity phone_trunc changes
    operator_user_ids = df_carpool.operator_user_id.unique().tolist()
    formatted_ids = ", ".join(f"'{id}'" for id in operator_user_ids)
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

    df_identities["updated_at"] = pd.to_datetime(df_identities["updated_at"])
    df_identities.sort_values(by=["operator_user_id", "updated_at"], inplace=True)
    df_identities["year_month"] = df_identities["updated_at"].dt.to_period("M")
    df_identities["prev_phone_trunc"] = df_identities.groupby("operator_user_id")[
        "phone_trunc"
    ].shift(1)
    df_identities["prev_identity_key"] = df_identities.groupby("operator_user_id")[
        "identity_key"
    ].shift(1)
    df_identities["phone_trunc_changed"] = df_identities.apply(
        lambda row: is_changed(row["phone_trunc"], row["prev_phone_trunc"]), axis=1
    )
    df_identities["identity_key_changed"] = df_identities.apply(
        lambda row: is_changed(row["identity_key"], row["prev_identity_key"]), axis=1
    )
    df_identities["change_detected"] = (
        df_identities["phone_trunc_changed"] | df_identities["identity_key_changed"]
    )
    user_phone_change_history_df = (
        df_identities.groupby("year_month")["identity_key_changed"].sum().reset_index()
    )
    user_phone_change_history_df.columns = ["year_month", "total_changes"]

    # Add to phone_trunc_insights_df the number of changes per operator_user_id
    phone_trunc_insights_df = phone_trunc_insights_df.merge(
        df_identities.groupby("operator_user_id")["phone_trunc_changed"]
        .sum()
        .reset_index(),
        how="left",
    ).copy()

    return (
        df_carpool,
        phone_trunc_insights_df,
        final_triangular_df,
        user_phone_change_history_df,
    )


# Store user_phone_change_history_df to the db
def insert_or_do_nothing_on_conflict(
    table, conn, keys, data_iter, index_elements: list[str]
):
    insert_stmt = insert(table.table).values(list(data_iter))
    on_duplicate_key_stmt = insert_stmt.on_conflict_do_nothing(
        index_elements=index_elements
    )
    conn.execute(on_duplicate_key_stmt)


if __name__ == "__main__":
    connection_string = os.environ["PG_CONNECTION_STRING"]
    delay = os.environ["DELAY"]  # Délai de fin
    frame = os.environ["FRAME"]  # Délai de début

    # Hardcoded for now
    aom_insee = "217500016"

    engine = create_engine(connection_string, connect_args={"sslmode": "require"})

    (
        df_carpool,
        phone_trunc_insights_df,
        final_triangular_df,
        user_phone_change_history_df,
    ) = create_insights_and_triangular_df(delay, frame, aom_insee, engine)

    # ## 5.Storage

    ## Store the phone_trunc_insights_df to the db

    # phone_trunc_insights_df.to_sql(
    #     name="phone_insights_detailed",
    #     schema="fraudcheck",
    #     con=engine,
    #     if_exists="append",
    #     index=False,
    #     method=partial(
    #         insert_or_do_nothing_on_conflict,
    #         index_elements=["phone_trunc", "departure_date", "end_date"],
    #     ),
    # )

    # final_triangular_df["operator_list"] = final_triangular_df["operator_list"].apply(
    #     lambda x: list(map(int, x))
    # )

    # ## Store the final_triangular_df to the db

    # final_triangular_df.to_sql(
    #     name="triangular_patterns",
    #     schema="fraudcheck",
    #     con=engine,
    #     if_exists="append",
    #     index=False,
    #     method=partial(
    #         insert_or_do_nothing_on_conflict,
    #         index_elements=["phone_trunc", "departure_date", "end_date"],
    #     ),
    # )

    # user_phone_change_history_df["year_month"] = user_phone_change_history_df[
    #     "year_month"
    # ].apply(lambda x: x.to_timestamp())

    # user_phone_change_history_df.to_sql(
    #     name="user_phone_change_history",
    #     schema="fraudcheck",
    #     con=engine,
    #     if_exists="append",
    #     index=False,
    #     method=partial(
    #         insert_or_do_nothing_on_conflict,
    #         index_elements=["year_month"],
    #     ),
    # )
