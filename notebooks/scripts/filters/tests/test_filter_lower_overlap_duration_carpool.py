import unittest
import pandas as pd

from scripts.filters.carpool_filters import CarpoolFilters

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
        result = CarpoolFilters.filter_remove_lower_overlap_duration_carpool(df)

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
        result = CarpoolFilters.filter_remove_lower_overlap_duration_carpool(df)

        # Assert
        self.assertTrue(expected_output.equals(result))