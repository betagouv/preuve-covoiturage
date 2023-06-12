import pandas as pd

class CarpoolOverlaps:

    @staticmethod
    def add_overlap_columns(df):
        for i in range(len(df)):
            if df.loc[df.index[i], 'overlap_group'] == 100 :
                for j in range(i+1, len(df)):
                    overlap_duration = CarpoolOverlaps.has_overalp(df.iloc[i], df.iloc[j])
                    if overlap_duration > 20:
                        df.loc[df.index[j], 'overlap_group'] = i
                        df.loc[df.index[j], 'overlap_duration'] = overlap_duration
                df.loc[df.index[i], 'overlap_group'] = i
        return df
        
    
    @staticmethod
    def has_overalp(row1, row2):
        start1 = pd.to_datetime(row1['datetime'])
        duration1 = pd.to_timedelta(row1['duration'], unit='s')
        
        start2 = row2['datetime']
        duration2 = pd.to_timedelta(row2['duration'], unit='s')

        end1 = start1 + duration1
        end2 = start2 + duration2

        overlap_start = max(start1, start2)
        overlap_end = min(end1, end2)
        return max(0, (overlap_end - overlap_start).total_seconds())