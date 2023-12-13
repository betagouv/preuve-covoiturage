import pandas as pd

def add_overlap_columns(df, with_ratio=False):
    """Return an alterned dataframe with computed columns for group and duration"""
    for i in range(len(df)):
        if df.loc[df.index[i], 'overlap_group'] == 100 :
            for j in range(i+1, len(df)):
                # Compare first element of dataframe to every other lines of the groupe
                overlap_duration = overalp_duration(df.iloc[i], df.iloc[j])
                if overlap_duration > 20:
                    # Compute three columns
                    df.loc[df.index[j], 'overlap_group'] = i
                    df.loc[df.index[j], 'overlap_duration'] = overlap_duration
                    if with_ratio is True:
                        df.loc[df.index[j], 'overlap_duration_ratio'] =  overlap_duration / df.iloc[j]['duration']
            df.loc[df.index[i], 'overlap_group'] = i
    return df


def overalp_duration(df_row1, df_row2):
    """Return a scalar overlap duration between two dataframe"""
    start1 = pd.to_datetime(df_row1['datetime'])
    duration1 = pd.to_timedelta(df_row1['duration'], unit='s')
    
    start2 = df_row2['datetime']
    duration2 = pd.to_timedelta(df_row2['duration'], unit='s')

    end1 = start1 + duration1
    end2 = start2 + duration2

    overlap_start = max(start1, start2)
    overlap_end = min(end1, end2)
    return max(0, (overlap_end - overlap_start).total_seconds())


def remove_carpool_with_lowest_overlap_duration(df):
    """Return an altered dataframe with removed carpool with the lowest overlap duration from input dataframe"""
    if not len(df) > 1:
        return df
    else:
        min_overlap_value = df['overlap_duration'].min()
        min_value_mask = df['overlap_duration'] == min_overlap_value
        carpool_to_remove = df[min_value_mask]
        df_altered = df.drop(carpool_to_remove.index)
        return df_altered

def remove_carpool_with_same_passenger_and_no_overlap(df):
    """Return an altered dataframe with removed carpool with same passenger identity"""
    df_counted_other_identity_key = df.groupby(['other_identity_key']).count()
    df_kept_passenger_key = df_counted_other_identity_key[df_counted_other_identity_key._id > 1].reset_index()['other_identity_key']
    df_altered = df[df['other_identity_key'].isin(df_kept_passenger_key)]
    return df_altered