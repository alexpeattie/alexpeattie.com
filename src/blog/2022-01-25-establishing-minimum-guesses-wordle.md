---
title: Establishing the minimum number of guesses needed to (always) win Wordle
image: /assets/images/meta/posts/establishing-minimum-guesses-wordle.png
---

<p><img src="/assets/images/posts/establishing-minimum-guesses-wordle/wordle-example.png" alt="An example Wordle grid" width="400"></p>

A few weeks ago, I became interested in whether there was a strategy to always "win" Wordle (i.e. to find the secret word in 6 guesses or fewer). This is exactly the problem that Laurent Poirrier examines in his [excellent writeup](https://www.poirrier.ca/notes/wordle/) on applying mathematical optimization techniques to Wordle:

> Is there a strategy that guarantees to find any one of the 12972 possible words[^wordcount] within the 6 allowed guesses? Without resorting to luck, that is.

Laurent proved the answer is yes! With careful thought, some clever optimization techniques and over a thousand hours of CPU time, he found a [decision tree](https://en.wikipedia.org/wiki/Decision_tree) of depth 5 -- yielding a strategy to solve Wordle puzzles in $\leq$ 6 guesses. (Before reading the rest of this article, I'd recommend going through Laurent's post -- it's quite accessible even if you don't have a background in optimization).

He observes at the end of his article that an open question remains:

> Unfortunately, depth 4 seems to be beyond the reach of my computational resources. It is thus still unknown whether all Wordle puzzles can be solved in 5 guesses.[^laurent]

It's tricky to apply Laurent's original strategy to tackling this question -- he estimates it would cost about $80,000 of EC2 spend (!) to establish the presence/absence of a depth 4 decision tree. Luckily, there's a cheaper way to solve the mystery. Below I outline why all Wordle puzzles cannot be solved in 5 guesses or fewer -- thereby establishing 6 as the minimum number of guesses needed to guarantee a win.

:::admonition[TL;DR]{kind="success"}
There are 19 words ending in -ills which differ by only one letter. For a strategy that guarantees a win in 5 guesses to exist, we'll need to be able to guess 4 words which contain 18 of the 19 starting letters of the -ills words -- but no such 4 words exist (provable using exhaustive search or a SAT solver).
:::

### Introducing "ill Wordle" 🤒

Let's start by introducing a Wordle variant we'll call "ill Wordle". It's just like regular Wordle, with one key difference. In regular Wordle we're faced with thousands of possibilities for the "secret" word, but in ill Wordle it can be one of only 19 possibilities -- the 19 five-letter words ending in -ills:

```
bills, cills, dills, fills, gills, hills, jills, kills, lills, mills,
nills, pills, rills, sills, tills, vills, wills, yills, zills
```

**Observation 1:** ill Wordle represents a subset of the problem space of regular Wordle. If we can't guarantee a win in ill Wordle in $\leq$ 5 guesses, the same is true for regular Wordle. In regular Wordle there are just more possibilities to disambiguate between, necessitating a decision tree of equal or greater depth.

Although ill Wordle is "easier" from an optimization standpoint, it's a surprisingly difficult for human players -- have a go below[^vvordle]:

<div data-controller='wordle'></div>

### Winning ill Wordle in 6 moves

:::admonition[Note]{kind="note"}
A quick note on the terminology I'm using, since "answer" can be ambiguous when discussing Wordle, I'll stick to the terms "secret word" or "secret" when referring to the word we're aiming to guess.
:::

Let's think about why ill Wordle is tough. The possible secrets only vary by a single letter (the letter in the first position). Consider the set $\mathit{L}$ of these first letters of the 19 possible secrets: $\mathit{L} = \{b, c, d, f, g, h, j, k, l, m, n, p, r, s, t, v, w, y, z\}$. A single guess can contain up to 5 letters from this set, and will eliminate up to 5 of the 19 possible secrets. For example, if I guess "nymph" and get the response <span class='wordle-answer'>⬜️⬜️⬜️⬜️⬜️</span>, I can eliminate nills, yills, mills, pills and hills.

If I'm shooting for victory in 6 turns, I need to choose my first 5 guesses carefully. If those guesses don't contain at least 18 the 19 letters in $\mathit{L}$ then I face having to take my last guess with multiple possibilities still in play:

<video autoplay loop muted playsinline>
  <source src="/assets/images/posts/establishing-minimum-guesses-wordle/ill-example-1.mp4" type="video/mp4">
</video>

**Observation 2a:** To guarantee a win in 6 guesses, we need to equivalently guarantee that we can eliminate 18 of the 19 letters in $\textit{L}$ in 5 guesses.

Note that the order of the guesses doesn't really matter -- we're principally interested in how many letters we've eliminated by our penultimate guess.

Can we find 5 guesses which contain 18 of the letters in $\mathit{L}$? The problem is actually quite subtle[^nphard] (and worth going into in another post) but the short answer is that plenty of solutions exist. One solution would be: khoja, caved, fritz, blawn, gymps. We can get another by running Laurent's solver against ill Wordle:

<video autoplay loop muted playsinline>
  <source src="/assets/images/posts/establishing-minimum-guesses-wordle/ill-example-2.mp4" type="video/mp4">
</video>

### Can we guarantee a win in ill Wordle in 5 moves?

We've seen that we can guarantee a win in ill Wordle in 6 guesses or fewer. This should come as no surprise, since ill Wordle is strictly easier than Wordle, and Laurent had already proven that regular Wordle is winnable in $\leq$ 6 guesses. Let's turn our attention to the question of $\leq$ 5 guesses.

**Observation 2b:** To guarantee a win in 5 guesses, we need to equivalently guarantee that we can eliminate 18 of the 19 letters in $\textit{L}$ in 4 guesses.

Immediately, it's clear this is much trickier. Firstly, to eliminate 18 letters in 4 guesses, we'll need at least two of those guesses to eliminate 5 letters each. Since $\mathit{L}$ contains no vowels, such guesses are scarce. Let's find all the candidates:

```python
# Get Wordle wordlist with `curl -O https://gist.githubusercontent.com/alexpeattie/777a393caf13c2e47a12e3d15ac31438/raw/8c989737a308ed22a029a061a2b628b7b68d4f8b/wordle-12k.txt`

words = open("wordle-12k.txt", "r").read().splitlines()
assert len(words) == 12972

letters = set([w[0] for w in words if w.endswith("ills")])
assert len(letters) == 19

five_letter_eliminating_words = [word for word in words if len(set(letters).intersection(word)) == 5]
print(five_letter_eliminating_words)
```

```
[
  'byrls', 'chynd', 'crwth', 'crypt', 'fyrds', 'glyph', 'grypt', 'gymps', 'hwyls',
  'hymns', 'kydst', 'kynds', 'lymph', 'lynch', 'myths', 'nymph', 'psych', 'rynds',
  'sylph', 'synch', 'synth', 'tryps', 'tymps', 'wynds'
]
```

Additionally, these two guesses cannot share any letters (otherwise the latter guess will eliminate $\lt 5$ letters). This reduces our possible pool of guesses even more:

```python
ten_letter_eliminating_pairs = [
    (w1, w2) for w1 in five_letter_eliminating_words for w2 in five_letter_eliminating_words
    if set(w1).isdisjoint(w2) and w1 < w2]

print(ten_letter_eliminating_pairs)
```

```
[('crwth', 'gymps'), ('crwth', 'kynds')]
```

So two of our four guesses would have to be crwth and gymps, or crwth and kynds -- each eliminating 10 letters, leaving us to find 2 more words which eliminate 8 additional letters. If $\mathit{W}$ is the set of all 12,972 possible Wordle guesses, then the candidates we need to consider can be described by the [Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product):

$$
\{\text{crwth}\} \times \{\text{gymps, kynds}\} \times \mathit{W} \times \mathit{W}
$$

It's fast enough to brute-force all these possibilities:

```python
import time

start = time.perf_counter()

for w3 in words:
  for w4 in words:
    elim_count1 = len(letters.intersection('crwthgymps' + w3 + w4))
    elim_count2 = len(letters.intersection('crwthkynds' + w3 + w4))

    if elim_count1 >= 18 or elim_count2 >= 18:
      print((w3, w4))
      print(f"{time.perf_counter() - start:0.2f} seconds")
      break

print("No solutions found")
print(f"{time.perf_counter() - start:0.2f} seconds")
```

```
No solutions found
179.55 seconds
```

Therefore, there isn't a length-4 subset of $\mathit{W}$ which eliminates 18 of 19 letters in $\mathit{L}$. Thus, ill Wordle can't always be solved in $\leq 5$ guesses, and the same must be true of regular Wordle. **Wordle cannot be always solved in 5 guesses or fewer.**

#### Checking our conclusion with OR-Tools

We can also frame the problem of finding the minimum number of guesses needed to eliminate 18 of 19 letters in $\mathit{L}$ as a constraint programming (CP) problem, which then allows us to use sophisticated [SAT solvers](https://en.wikipedia.org/wiki/SAT_solver) like those provided by Google's [OR-Tools](https://developers.google.com/optimization). The details are beyond the scope of this article, but you can check out [this Colab](https://colab.research.google.com/gist/alexpeattie/be59dcf01fd18ee16a3f437467b191b8/wordle_min_guesses_or_tools.ipynb) if you're interested. At a high level, we're telling the solver to minimize the number of words chosen, while ensuring we eliminate enough letters:

```python
word_chosen = [model.NewIntVar(0, 1, "word_chosen[%i]" % i) for i in range(num_words)]
num_words_chosen = model.NewIntVar(0, num_words, "num_words_chosen")

# Number of chosen words (to minimize)
model.Add(num_words_chosen == sum(word_chosen))

# ...

# The crucial constraint: we must cover at least 18 of the 19 letters we're concerned with.
model.Add(sum([word_chosen[j] * letter_present[i][j] for i in range(num_letters) for j in range(num_words)]) >= 18)

model.Minimize(num_words_chosen)
```

```
Minimum number of words needed: 5
Example words: khoja, caved, fritz, blawn, gymps
Solved in: 0.83 seconds
```

OR-Tools (very quickly) confirms the minimum number of guesses needed is 5.

### Conclusion

So where does that leave us? I think most of the big questions regarding Wordle have been answered, at least in its classic form (using 5 letter English words from the current allowlist). A depth 5 decision tree has been found already by Laurent, and it seems a depth 4 tree cannot exist. It's nice that the number of guesses Wordle gives you is the smallest "fair" number (where fair means that victory is guaranteed with optimal play).

It could still be interesting for someone to crunch through all the depth 5 trees to find the one which minimizes the average number of guesses[^minavg] (I believe at the point Wordle could be declared well and truly solved :grin:!).

:::admonition[Update]{kind="update"}
Thanks (again) to Laurent Poirrier for checking this proof. He also independently verified it with an MIP formulation (in [LP format](https://www.gurobi.com/documentation/9.5/refman/lp_format.html)) which is available [here](https://www.poirrier.ca/notes/wordle/problem.lp.gz).
:::

[^wordcount]: In both this article & Laurent's we assume that the secret word can be any of the 12,972 words which are accepted as guesses. This list seems to be the 5 letter words from the [2019 Collins Scrabble Words list](https://boardgames.stackexchange.com/questions/38366/latest-collins-scrabble-words-list-in-text-file). Wordle actually chooses its word of the day from a smaller subset of these words -- around 2,500 words from the list which the partner of Wordle's creator recognized ([source](https://www.nytimes.com/2022/01/03/technology/wordle-word-game-creator.html)). This is presumably to prevent outrage from players having to guess words like "[yrapt](https://en.wiktionary.org/wiki/yrapt)".
[^laurent]: Laurent's work already establishes that we can't guarantee a solution in 4 or fewer guesses, leaving 5 or 6 as possibilities for the minimum number of guesses needed.
[^vvordle]: The widget is largely based on [Evan You's implementation](https://github.com/yyx990803/vue-wordle) 💚
[^nphard]: It turns out to be the [set cover problem](https://en.wikipedia.org/wiki/Set_cover_problem) in disguise, which is NP-hard.
[^minavg]: I haven't thought much about this, but I suspect doing this would be similarly expensive to an exhaustive search for a depth 4 tree -- i.e. the $80k cost Laurent ballparks.
