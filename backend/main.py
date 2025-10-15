from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from POSTaggerModel import getPartsOfSpeech

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class Submitted(BaseModel):
    sentence: str

@app.post('/pos')
async def getPOS(submission: Submitted) -> dict[str, list[str]]:
    if not submission:
        raise HTTPException(status_code=400,
                            detail="Input message cannot be empty")
    text: str = submission.sentence
    
    return {"response": getPartsOfSpeech(text) }