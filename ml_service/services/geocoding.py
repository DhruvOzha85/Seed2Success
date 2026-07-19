import json
import math
from typing import Tuple
from core.config import settings

class Geocoder:
    def __init__(self):
        with open(settings.DISTRICT_COORDS_PATH, 'r') as f:
            self.districts = json.load(f)
            
    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dLon / 2) * math.sin(dLon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def get_nearest_district(self, lat: float, lon: float) -> Tuple[str, str]:
        min_dist = float('inf')
        best_state = ""
        best_dist = ""
        
        for st, dists in self.districts.items():
            for dist, coords in dists.items():
                d = self._haversine(lat, lon, coords['lat'], coords['lon'])
                if d < min_dist:
                    min_dist = d
                    best_state = st
                    best_dist = dist
                    
        return best_state.upper(), best_dist.upper()

geocoder = Geocoder()
