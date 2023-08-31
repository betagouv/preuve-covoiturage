
import pandas as pd

class CarpoolFilters:

    @staticmethod
    def filter_remove_lower_overlap_duration_carpool(df):
        if not len(df) > 1:
            return df
        else:
            min_overlap_value = df['overlap_duration'].min()
            min_value_mask = df['overlap_duration'] == min_overlap_value
            carpool_to_remove = df[min_value_mask]
            df = df.drop(carpool_to_remove.index)
            return df

    @staticmethod 
    def filter_remove_carpool_with_same_passenger_no_overlap(df):
        df_counted_other_identity_key = df.groupby(['other_identity_key']).count()
        df_kept_passenger_key = df_counted_other_identity_key[df_counted_other_identity_key._id > 1].reset_index()['other_identity_key']
        df_filtered = df[df['other_identity_key'].isin(df_kept_passenger_key)]
        return df_filtered