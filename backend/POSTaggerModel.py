from flair.data import Sentence
from flair.models import SequenceTagger
from utils.PartOfSpeechConstants import PartsOfSpeech

tagger = SequenceTagger.load("flair/pos-english-fast")

def getPartsOfSpeech(sent: str) -> list[str]:
    sentence = Sentence(sent)
    tagger.predict(sentence)

    posList: list[str] =[]

    for token in sentence:
        label: str = token.get_labels()[0].value
        if label == 'PRP$':
            posList.append(PartsOfSpeech.PRPQ)
        elif label == 'WP$':
            posList.append(PartsOfSpeech.WPQ)
        else:
            posList.append(PartsOfSpeech[label])
        
    return posList
