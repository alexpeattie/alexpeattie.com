---
title: 'Teaching computers to rap'
---

Today I was lucky enough to stumble on [this fascinating paper](http://nlp.stanford.edu/courses/cs224n/2009/fp/5.pdf) by Nguyen and Sa describing how they created an automated rap lyric generator. It's well worth a read.

Basically, the researchers scraped <http://www.ohhla.com/> for lyrics and (using a state machine) split those lyrics into verses and choruses. The program was then trained to generate new lyrics using these corpora, along with a rhyming dictionary (<http://rhyme.sourceforge.net>). Every line was generated 30 times, and the best result (based on rhyme and syllable count) was automatically chosen.

The results, while not rap classics, are surprisingly passable:

> see i won’t deny it i’m a straight ridah<br>
i got semi-autos to put holes in niggaz tryina play me<br>
i look to my future cause my past is all behind me<br>
yeah see the cross on my neck that just might freeze me<br>
shine now if greed come between me and my man d<br>
well they say they wanna question me