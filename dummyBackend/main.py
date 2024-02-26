from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List
import json
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('happiness-me.response_sample.json') as file:
	myHappiness = json.load(file)
with open('happiness-all.response_sample.json') as file:
	ourHappiness = json.load(file)

@app.get("/api/happiness/me", summary="データの取得")
async def get_data(start: datetime = Query(None, description="取得開始日時"), end: datetime = Query(None, description="取得終了日時")):
    filtered_data = []
    for data in myHappiness:
        if start is not None and data.time < start:
            continue
        if end is not None and data.time > end:
            continue
        filtered_data.append(data)
    return filtered_data

@app.get("/api/happiness/all", summary="データの取得")
async def get_data(start: datetime = Query(None, description="取得開始日時"), end: datetime = Query(None, description="取得終了日時")):
    filtered_data = {
        "map_data": [],
        "graph_data": []
    }
    for data in ourHappiness["map_data"]:
        if start is not None and data.time < start:
            continue
        if end is not None and data.time > end:
            continue
        filtered_data["map_data"].append(data)
    for data in ourHappiness["graph_data"]:
        filtered_data["graph_data"].append(data)
    return filtered_data

@app.post("/api/happiness", summary="データの登録")
async def add_data():
    myHappiness.append(data)
    return data
