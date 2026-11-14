import unittest
from app.services.nasa_power import NasaPowerService, NASA_POWER_FILL_VALUE


class TestNasaPowerService(unittest.TestCase):
    def setUp(self):
        self.service = NasaPowerService()

    def test_missing_values_never_converted_to_zero(self):
        """
        Verify that -999.0 fill values are preserved as None / incomplete,
        and NEVER silently converted to 0.0.
        """
        raw_mock = {
            "header": {"api": {"version": "v2.10.3"}},
            "geometry": {"coordinates": [10.1911, 11.6765, 422.0]},
            "parameters": {
                "T2M": {"units": "C", "longname": "Temperature at 2 Meters"},
                "PRECTOTCORR": {"units": "mm/day", "longname": "Precipitation Corrected"},
                "GWETROOT": {"units": "1", "longname": "Root Zone Soil Wetness"},
            },
            "properties": {
                "parameter": {
                    "T2M": {"20240601": 28.5, "20240602": -999.0},
                    "PRECTOTCORR": {"20240601": 15.2, "20240602": -999.0},
                    "GWETROOT": {"20240601": 0.45, "20240602": -999.0},
                }
            },
        }

        processed = self.service._process_raw_power_data(
            raw_data=raw_mock,
            lat=11.6765,
            lon=10.1911,
            retrieval_source="test_mock",
        )

        records = processed["daily_records"]
        self.assertEqual(len(records), 2)

        # Day 1: Valid
        self.assertEqual(records[0]["precipitation_mm"], 15.2)
        self.assertEqual(records[0]["temperature_2m_c"], 28.5)
        self.assertEqual(records[0]["root_zone_wetness_fraction"], 0.45)
        self.assertTrue(records[0]["is_complete"])

        # Day 2: Missing (-999.0) must be None, NOT 0.0
        self.assertIsNone(records[1]["precipitation_mm"])
        self.assertIsNone(records[1]["temperature_2m_c"])
        self.assertIsNone(records[1]["root_zone_wetness_fraction"])
        self.assertFalse(records[1]["is_complete"])

        # Completeness should reflect 50%
        self.assertEqual(processed["summary"]["data_completeness_pct"], 50.0)

    def test_dry_spell_calculation(self):
        """
        Verify consecutive dry day logic (days with < 1.0mm rainfall).
        """
        raw_mock = {
            "header": {"api": {"version": "v2.10.3"}},
            "geometry": {"coordinates": [10.1911, 11.6765, 422.0]},
            "parameters": {},
            "properties": {
                "parameter": {
                    "T2M": {"20240601": 30.0, "20240602": 30.0, "20240603": 30.0, "20240604": 30.0},
                    "PRECTOTCORR": {"20240601": 12.0, "20240602": 0.2, "20240603": 0.0, "20240604": 5.0},
                    "GWETROOT": {"20240601": 0.4, "20240602": 0.35, "20240603": 0.3, "20240604": 0.45},
                }
            },
        }

        processed = self.service._process_raw_power_data(
            raw_data=raw_mock,
            lat=11.6765,
            lon=10.1911,
            retrieval_source="test_mock",
        )

        # Days 2 and 3 (< 1.0mm) constitute 2 consecutive dry days
        self.assertEqual(processed["summary"]["max_consecutive_dry_days"], 2)
        self.assertEqual(processed["summary"]["rainy_days_count"], 2)  # Day 1 and Day 4

    def test_offline_fixture_fallback(self):
        """
        Verify that offline fixture correctly loads Azare 2024 season.
        """
        res = self.service.fetch_daily_agrometeorology(
            lat=11.6765,
            lon=10.1911,
            start_date="20240501",
            end_date="20241031",
            force_refresh=False,
        )
        self.assertIn("summary", res)
        self.assertIn("provenance", res)
        self.assertEqual(res["summary"]["total_days"], 184)
        self.assertGreater(res["summary"]["total_precipitation_mm"], 500)


if __name__ == "__main__":
    unittest.main()

