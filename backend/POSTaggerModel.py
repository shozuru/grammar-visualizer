from flair.data import Sentence
from flair.models import SequenceTagger

tagger = SequenceTagger.load("flair/pos-english-fast")

def getPartsOfSpeech(sent: str) -> list[str]:
    sentence = Sentence(sent)
    tagger.predict(sentence)

    posList: list[str] =[]

    for token in sentence:
        posList.append(token.get_labels()[0].value)
        
    return posList
