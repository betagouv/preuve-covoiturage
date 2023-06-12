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
        df_counted_other_phone = df.groupby(['other_phone_trunc']).count()
        df_kept_passenger_trunc = df_counted_other_phone[df_counted_other_phone._id > 1].reset_index()['other_phone_trunc']
        df_filtered = df[df['other_phone_trunc'].isin(df_kept_passenger_trunc)]
        return df_filtered