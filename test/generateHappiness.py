import requests
import uuid
import random
from datetime import datetime, timedelta
import time
def generate_random_coordinates():
    latitude = round(random.uniform(33.396308, 34.551483), 8)  # 日本国内の緯度範囲
    longitude = round(random.uniform(136.93457, 138.986672), 8)  # 日本国内の経度範囲
    return longitude, latitude

def generate_timestamps(start_date, end_date):
    current_date = start_date
    while current_date <= end_date:
        yield current_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        current_date += timedelta(days=1)

# POSTリクエストを送信するメソッド
def send_post_request(timestamp):
    print("t",timestamp)
    id = str(uuid.uuid4())
    print(id)
    # リクエストヘッダー
    headers = {
        'Fiware-Service': 'Government',
        'Fiware-ServicePath': '/Happiness',
        'Content-Type': 'application/json'
    }

    # データ作成
    data = {
        "id": id,  # UUID生成
        "type": "happiness",
        "happiness1": {"type": "Number", "value": 1},
        "happiness2": {"type": "Number", "value": 1},
        "happiness3": {"type": "Number", "value": 1},
        "happiness4": {"type": "Number", "value": 1},
        "happiness5": {"type": "Number", "value": 1},
        "happiness6": {"type": "Number", "value": 1},
        "timestamp": {"type": "DateTime", "value": timestamp},
        "nickname": {"type": "Text", "value": "kazuki"},
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": list(generate_random_coordinates())  # ランダムな緯度経度生成
            },
            "metadata": {"place": {"type": "Text", "value": "北海道札幌市"}}
        },
        "age": {"type": "Text", "value": "20代"},
        "address": {"type": "Text", "value": "東京都渋谷区"}
    }

    # POSTリクエスト送信
    response = requests.post('http://localhost:1026/v2/entities', headers=headers, json=data)

    return response.status_code, response.json() if 'json' in response.headers.get('Content-Type', '') else response.text

# メイン関数
def main():
    start_date = datetime(2023, 4, 1)  # 開始日
    end_date = datetime(2024, 3, 1)    # 終了日

    # 指定した期間内で一日おきにtimestampを生成し、POSTリクエストを送信
    for timestamp in generate_timestamps(start_date, end_date):
        #send_post_request(timestamp)
        time.sleep(0.1)
        status_code, response_data = send_post_request(timestamp)
        print("Status Code:", status_code)

if __name__ == "__main__":
    main()
