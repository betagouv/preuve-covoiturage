import datetime
import unittest
import pandas as pd

from production.computes.carpool_overlaps import CarpoolOverlaps

class TestComputeCarpoolOverlaps(unittest.TestCase):

    def test_should_add_carpool_overlap_and_duration(self):
        # Arrange
        data = {
            '_id': [1, 2],
            'phone_trunc': ['+33665588', '+33665588'],
            'datetime': [datetime.datetime(2023, 5, 13, 15, 6) , datetime.datetime(2023, 5, 13, 15, 6) ],
            'duration': [1750, 1750],
            'overlap_group': 100,
            'overlap_duration': 0
        } 
        df = pd.DataFrame(data)

        # Act
        filtered_df = CarpoolOverlaps.add_overlap_columns(df)

        # Assert
        df['overlap_group'] = 0
        df['duration'] = [0, 1750]
        pd.testing.assert_frame_equal(filtered_df.reset_index(drop=True), df)