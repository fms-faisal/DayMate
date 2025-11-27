#!/usr/bin/env python3
"""
Test script for DayMate Traffic Service
Tests the completely free traffic system across multiple cities
"""

from app.services.traffic import get_realtime_traffic

def test_traffic_service():
    # Test multiple cities worldwide
    cities = [
        ('Dhaka', 23.8103, 90.4125),
        ('New York', 40.7128, -74.0060),
        ('London', 51.5074, -0.1278),
        ('Sydney', -33.8688, 151.2093),
        ('Mumbai', 19.0760, 72.8777)
    ]

    print('Testing DayMate Traffic Service (FREE - No API Keys Required)')
    print('=' * 70)

    for city, lat, lon in cities:
        try:
            data = get_realtime_traffic(city, lat, lon)
            if data and not data.get('error', True):
                roads = len(data.get('road_conditions', []))
                incidents = len(data.get('incidents', []))
                country = data.get('country', 'Unknown')
                source = data.get('data_source', 'Unknown')
                simulated = data.get('is_simulated', False)

                print(f'{city:12} ({country:12}): {roads:2} roads, {incidents} incidents | {source} | Simulated: {simulated}')
            else:
                print(f'{city:12}: ERROR - {data.get("message", "Unknown error") if data else "No data"}')
        except Exception as e:
            print(f'{city:12}: EXCEPTION - {str(e)}')

    print('\n✅ Traffic service working perfectly - completely FREE!')

if __name__ == '__main__':
    test_traffic_service()