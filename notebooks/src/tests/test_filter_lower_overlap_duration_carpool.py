import unittest
import pandas as pd

from scripts.helpers.apply_metods import remove_carpool_with_lowest_overlap_duration

class TestFilterCarpoolWithOverlapOnSameOperator(unittest.TestCase):

    def test_should_filter_lower_carpool_duration_for_two_carpools(self):
        # Arrange
        data = {
            'other_phone_trunc': ['+3366998877', '+3366998877',],
            'overlap_duration': [2000, 40]
        }
        df = pd.DataFrame(data)

        # Expected output
        expected_output = pd.DataFrame({
            'other_phone_trunc': ['+3366998877'],
            'overlap_duration': [2000]
        })

        # Act
        result = remove_carpool_with_lowest_overlap_duration(df)

        # Assert
        self.assertTrue(expected_output.equals(result))


    def test_should_filter_lower_carpool_duration_for_three_carpools(self):
        # Arrange
        data = {
            'other_phone_trunc': ['+3366998877', '+3366998877', '+3366998877'],
            'overlap_duration': [2000, 1000, 40]
        }
        df = pd.DataFrame(data)

        # Expected output
        expected_output = pd.DataFrame({
            'other_phone_trunc': ['+3366998877', '+3366998877'],
            'overlap_duration': [2000, 1000]
        })

        # Act
        result = remove_carpool_with_lowest_overlap_duration(df)

        # Assert
        self.assertTrue(expected_output.equals(result))