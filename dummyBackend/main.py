from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List

app = FastAPI()

class Location(BaseModel):
    type: str
    value: dict

class myAnswer(BaseModel):
    type: str
    value: int

class allAnswer(BaseModel):
    type: str
    value: float

class myHappinessData(BaseModel):
    id: UUID = Field(description="識別ID")
    type: str = Field(description="タイプ", pattern="^happiness[1-6]$")
    location: Location = Field(description="送信位置緯度経度")
    answer: myAnswer = Field(description="幸福度回答")
    time: datetime = Field(description="送信日時")

class allHappinessData(BaseModel):
    id: UUID = Field(description="識別ID")
    type: str = Field(description="タイプ", pattern="^happiness[1-6]$")
    location: Location = Field(description="送信位置緯度経度")
    answer: allAnswer = Field(description="幸福度回答")
    time: datetime = Field(description="送信日時")

# 仮データ
myHappiness = [
    myHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness1",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 1},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    ),
    myHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness2",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 1},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    ),
    myHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness3",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 1},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    ),
    myHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness4",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 1},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    ),
    myHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness5",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 1},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    ),
    myHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness6",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 1},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    )
]

allHappiness = [
    allHappinessData(
        id=UUID("123e4567-e89b-12d3-a456-426614174001"),
        type="happiness3",
        location={"type": "geo:json", "value": {"type": "Point", "coordinates": [35.717701, 139.744862]}},
        answer={"type": "number", "value": 0.7},
        time=datetime.strptime("2021-08-29T00:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")
    )
]

@app.get("/api/happiness/me", response_model=List[myHappinessData], summary="データの取得")
async def get_data(start: datetime = Query(None, description="取得開始日時"), end: datetime = Query(None, description="取得終了日時")):
    filtered_data = []
    for data in myHappiness:
        if start is not None and data.time < start:
            continue
        if end is not None and data.time > end:
            continue
        filtered_data.append(data)
    return filtered_data

@app.get("/api/happiness/all", response_model=List[allHappinessData], summary="データの取得")
async def get_data(start: datetime = Query(None, description="取得開始日時"), end: datetime = Query(None, description="取得終了日時")):
    filtered_data = []
    for data in allHappiness:
        if start is not None and data.time < start:
            continue
        if end is not None and data.time > end:
            continue
        filtered_data.append(data)
    return filtered_data


@app.post("/api/happiness", response_model=myHappinessData, summary="データの登録")
async def add_data(data: myHappinessData):
    myHappiness.append(data)
    return data
