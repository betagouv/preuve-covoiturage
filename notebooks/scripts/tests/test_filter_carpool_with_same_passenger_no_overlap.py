import unittest
import pandas as pd

from notebooks.filters.carpool_filters import CarpoolFilters

class TestFilterCarpoolWithOverlapOnSameOperator(unittest.TestCase):

    def test_should_filter_when_one_other_is_single_in_overlap_group(self):
        # Arrange
        data = {
            '_id': [1, 2, 3, 4],
            'other_identity_key': ['+33665588', '+33665587', '+33665588', '+33665586']
        }
        df = pd.DataFrame(data)

        expected_data = {
            '_id': [1, 3],
            'other_identity_key': ['+33665588', '+33665588']
        }
        expected_df = pd.DataFrame(expected_data)

        # Act
        filtered_df = CarpoolFilters.filter_remove_carpool_with_same_passenger_no_overlap(df)

        # Assert
        pd.testing.assert_frame_equal(filtered_df.reset_index(drop=True), expected_df)