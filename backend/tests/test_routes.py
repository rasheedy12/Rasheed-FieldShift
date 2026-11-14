import unittest
from app.api.routes import (
    get_default_location,
    get_candidate_crops,
    get_rotation_scenarios,
    get_environmental_profile,
)


class TestApiRoutes(unittest.TestCase):
    def test_default_location(self):
        loc = get_default_location()
        self.assertEqual(loc["location_name"], "Azare, Bauchi State, Nigeria")
        self.assertEqual(loc["latitude"], 11.6765)
        self.assertEqual(loc["longitude"], 10.1911)
        self.assertEqual(loc["agroecological_zone"], "Sudan Savanna")

    def test_candidate_crops(self):
        data = get_candidate_crops()
        self.assertIn("crops", data)
        self.assertGreaterEqual(len(data["crops"]), 6)
        crop_ids = [c["id"] for c in data["crops"]]
        self.assertIn("millet", crop_ids)
        self.assertIn("cowpea", crop_ids)
        self.assertIn("sorghum", crop_ids)

    def test_rotation_scenarios(self):
        data = get_rotation_scenarios()
        self.assertIn("scenarios", data)
        self.assertEqual(len(data["scenarios"]), 3)
        # Ensure disclaimer exists
        self.assertIn("disclaimer", data)

    def test_environmental_profile_endpoint(self):
        data = get_environmental_profile(
            lat=11.6765,
            lon=10.1911,
            start_date="20240501",
            end_date="20241031",
            force_refresh=False,
        )
        self.assertIn("provenance", data)
        self.assertIn("summary", data)
        self.assertEqual(data["summary"]["total_days"], 184)


if __name__ == "__main__":
    unittest.main()
