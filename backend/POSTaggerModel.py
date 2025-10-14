from flair.data import Sentence
from flair.models import SequenceTagger

tagger = SequenceTagger.load("flair/pos-english-fast")

sentence = \
    Sentence("This is a sample sentence used to test how good this model is")

tagger.predict(sentence)

for token in sentence:
    label = token.get_labels()[0]
    print(label.value)
