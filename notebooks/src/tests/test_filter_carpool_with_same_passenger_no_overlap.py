import unittest
import pandas as pd

from helpers.apply_metods import remove_carpool_with_same_passenger_and_no_overlap


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
        filtered_df = remove_carpool_with_same_passenger_and_no_overlap(df)

        # Assert
        pd.testing.assert_frame_equal(filtered_df.reset_index(drop=True), expected_df)