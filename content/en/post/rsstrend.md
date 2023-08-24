---
title: RSS Trends
date: 2023-08-24
bigimg: [{ src: "/images/post/rss-trends/rss-trends.png"}]
image: "/images/post/rss-trends/rss-trends.png"
tags: ["dataviz", "nlp", "python", "scraping"]
---

Analyzing RSS feeds from major French media outlets to create a Text Network depicting news trends and connections between most frequent terms.

<!--more-->

{{<link href="https://github.com/antoninfaure/rssTrends" class="btn btn-default my-3" target="_blank" inner="GitHub">}}
{{<link href="https://www.kaggle.com/datasets/antoninfaure/news-france" target="_blank" class="btn btn-info my-3" inner="Kaggle Dataset">}}

### Made with
{{<span class="btn btn-danger mb-2" inner="Jupyter Notebook">}}
{{<link href="https://d3js.org" class="btn btn-primary mb-2" target="_blank" inner="D3.js">}}

{{<iframe src="https://antoninfaure.github.io/rssTrends/" class="w-100" >}}

## Data Mining
To retrieve French news articles, I relied on the RSS feeds from the following media sources:
```python
feed_urls = [
    "http://www.lemonde.fr/rss/une.xml",
    "https://www.bfmtv.com/rss/news-24-7/",
    "https://www.liberation.fr/rss/",
    "http://www.lefigaro.fr/rss/figaro_actualites.xml",
    "https://www.franceinter.fr/rss",
    "https://www.lexpress.fr/arc/outboundfeeds/rss/alaune.xml",
    "https://www.francetvinfo.fr/titres.rss",
    "https://www.la-croix.com/RSS",
    "http://tempsreel.nouvelobs.com/rss.xml",
    "http://www.lepoint.fr/rss.xml",
    "https://www.france24.com/fr/rss",
    "https://feeds.leparisien.fr/leparisien/rss",
    "https://www.ouest-france.fr/rss/une",
    "https://www.europe1.fr/rss.xml",
    "https://partner-feeds.20min.ch/rss/20minutes",
    "https://www.afp.com/fr/actus/afp_actualite/792,31,9,7,33/feed"
]
```

A quick script to retrieve the titles and descriptions of all articles using the libraries [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/), Pandas, and requests.

```python
def scrapFeeds(feed_urls):
    news_list = pd.DataFrame(columns=('title', 'summary'))

    for feed_url in feed_urls:
        res = requests.get(feed_url)
        feed = BeautifulSoup(res.content, features='xml')

        articles = feed.findAll('item')       
        for article in articles:
            title = BeautifulSoup(article.find('title').get_text(), "html").get_text()
            summary = ""
            if (article.find('description')):
                summary = BeautifulSoup(article.find('description').get_text(), "html").get_text()
                news_list.loc[len(news_list)] = [title, summary]

    return news_list
```

Next, it's necessary to process the text of the articles using the libraries [Spacy](https://spacy.io) and [NLTK](https://www.nltk.org), which replace special characters, tokenize each term, and then lemmatize them. Additionally, a vocabulary dictionary is generated, containing the frequency of terms within the corpus.

```python
def process_text(docs, lang='fr'):
    if (lang=='fr'):
        nlp = spacy.load('fr_core_news_lg')
    elif (lang=='en'):
        nlp = spacy.load('en_core_web_sm')

    # Utility functions
    punctuation_chars =  [
        chr(i) for i in range(sys.maxunicode)
        if category(chr(i)).startswith("P")
    ]

    lemma_docs = []
    for doc in docs:
        # Tokenize doc
        tokenized_doc = nlp(doc)

        # Lemmanize doc
        lemma_doc = list(filter(lambda token: token.is_stop == False and token.pos_ in ['NOUN', 'PROPN'] and token.lemma_ not in [*string.punctuation, *punctuation_chars], tokenized_doc))
        lemma_doc = list(map(lambda tok: tok.lemma_, lemma_doc))
        lemma_docs.append(lemma_doc)


    def get_vocabulary_frequency(documents):
        vocabulary = dict()
        for doc in documents:
            for word in doc:
                if word in list(vocabulary.keys()):
                    vocabulary[word] += 1
                else:
                    vocabulary[word] = 1

        return vocabulary

    voc = get_vocabulary_frequency(lemma_docs)

    return lemma_docs, voc
```

The articles dataset is available on {{<link inner="Kaggle" href="https://www.kaggle.com/datasets/antoninfaure/news-france" target="_blank" class="btn btn-info">}}

## Data Visualization
To visualize the network, the first step is to list the links (edges) between each term (nodes). To accomplish this, the NLTK library is used along with its method for calculating bigrams (i.e., pairs of neighboring terms in a sentence). Each bigram thus represents a **link**, while each term represents a **node**, with the node's size depending on its frequency in the corpus.

```python
def graphnet(docs, voc, min_freq=5):

    # Filter voc with min_freq
    filtered_voc = dict(filter(lambda elem: elem[1] > min_freq, voc.items()))

    dict_voc_id = dict()
    for i, term in enumerate(filtered_voc):
        dict_voc_id[term] = i

    # List bigrams (edges)
    finder = nltk.BigramCollocationFinder.from_documents(docs)
    bigram_measures = nltk.collocations.BigramAssocMeasures()
    bigrams = list(finder.score_ngrams(bigram_measures.raw_freq))
    min_freq = min(list(map(lambda x: x[1], bigrams)))
    bigrams = list(map(lambda x: (x[0], x[1]/min_freq), bigrams))

    # Filter the bigrams with filtered_voc elements and replace by id
    filtered_bigrams = []
    for bigram in bigrams:
        if (bigram[0][0] in filtered_voc.keys() and bigram[0][1] in filtered_voc.keys()):
            #new_bigram = ( dict_voc_id[bigram[0][0]] , dict_voc_id[bigram[0][1]] )
            new_bigram = bigram[0]
            filtered_bigrams.append((new_bigram, bigram[1]))

    # Set nodes sizes
    sizes = list(filtered_voc.values())

    # Format data
    nodes = []
    for i, term in enumerate(filtered_voc.keys()):
        nodes.append({
            'id': term,
            'label': term,
            'size': sizes[i]
        })

    edges = []
    for i, edge in enumerate(filtered_bigrams):
        (source, target) = edge[0]
        edges.append({
            'id': i,
            'source': source,
            'target': target,
            'size': edge[1]
        })


    # Write JSON files
    output_file(nodes, 'nodes.json')

    output_file(edges, 'edges.json')
```

Subsequently, the network can be displayed using the D3.js library, as shown at the top of the page. Alternatively, the software [Gephi](https://gephi.org/) can be utilized for handling large datasets, which would be otherwise impractical for the 2022 US articles dataset (~250,000 articles).

{{<figure src="/images/post/rss-trends/gephi.png" title="French news from January 30, 2023 viewed on Gephi">}}

## Association Rules
To obtain the most trending topics, various association rule criteria can be considered: confidence, support, lift, added value, leverage, and conviction. Initially, a term-document frequency (TDF) matrix is created to generate different k-combinations of terms.

```python
te = TransactionEncoder()
te_ary = te.fit(docs).transform(docs, sparse=True)
df = pd.DataFrame.sparse.from_spmatrix(te_ary, columns=te.columns_)
```

When the apply the Apriori algorithm to obtain the most relevant k-combinations (where k > 1).

```
frequent_itemsets = apriori(df, min_support=0.005, use_colnames=True, verbose=1)
frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))

rules = association_rules(frequent_itemsets, metric ="lift", min_threshold = 1)
rules = rules.sort_values([criterion], ascending =[False])

rules = rules[rules[criterion] > level]
```

However, it turns out that several combinations can represent the same "topic," making it relevant to merge these combinations to obtain a condensed view of the "topic."

Below is an excerpt of the most relevant combinations for the data from February 13, 2023:

{{< table >}}
|     | antecedents       | consequents         | support   | confidence   | lift       | leverage   | conviction   |
|-----|-------------------|---------------------|-----------|--------------|------------|------------|--------------|
| 141 | (Ukraine)         | (guerre)            | 0.048507  | 0.812500     | 14.048387  | 0.045055   | 5.024876     |
| 140 | (guerre)          | (Ukraine)           | 0.048507  | 0.838710     | 14.048387  | 0.045055   | 5.829851     |
| 71  | (Palmade)         | (Pierre)            | 0.041045  | 1.000000     | 22.333333  | 0.039207   | inf          |
| 70  | (Pierre)          | (Palmade)           | 0.041045  | 0.916667     | 22.333333  | 0.039207   | 11.507463    |
| 459 | (Palmade)         | (accident, Pierre)  | 0.027985  | 0.681818     | 24.363636  | 0.026836   | 3.054904     |
| 454 | (accident, Pierre)| (Palmade)           | 0.027985  | 1.000000     | 24.363636  | 0.026836   | inf          |
| 457 | (accident)        | (Pierre, Palmade)   | 0.027985  | 0.937500     | 22.840909  | 0.026760   | 15.343284    |
| 456 | (Pierre, Palmade) | (accident)          | 0.027985  | 0.681818     | 22.840909  | 0.026760   | 3.049041     |
| 73  | (Palmade)         | (accident)          | 0.027985  | 0.681818     | 22.840909  | 0.026760   | 3.049041     |
| 72  | (accident)        | (Palmade)           | 0.027985  | 0.937500     | 22.840909  | 0.026760   | 15.343284    |
| 458 | (Pierre)          | (accident, Palmade) | 0.027985  | 0.625000     | 22.333333  | 0.026732   | 2.592040     |
| 455 | (accident, Palmade)| (Pierre)            | 0.027985  | 1.000000     | 22.333333  | 0.026732   | inf          |
| 95  | (Pierre)          | (accident)          | 0.027985  | 0.625000     | 20.937500  | 0.026648   | 2.587065     |
| 94  | (accident)        | (Pierre)            | 0.027985  | 0.937500     | 20.937500  | 0.026648   | 15.283582    |
| 231 | (réforme)         | (retraite)          | 0.018657  | 1.000000     | 26.800000  | 0.017961   | inf          |
{{< /table >}}

For the relevance criterion, I've chosen leverage as it provided the most promising results. To merge the combinations, we can assume that in descending order of relevance, if $(x, y)$ and $(x, z)$ share $x$, then we associate the two and obtain $(x, y, z)$, taking care to index the combination with the higher relevance of the two.

```python
criterion='leverage'
level=0.01
trends = []

for i in rules.index:
    rule = rules.loc[i]
    x = list(rule['antecedents'])
    y = list(rule['consequents'])
    terms = x + y
    same = True
    new_trend = terms
    delete_trends_ids = []
    for term in terms:
        for i, trend in enumerate(trends):
            if (term in trend):
            same = False
                old_trend = new_trend
                # old_trend -> new_terms + old_trend
                new_trend = list(set(new_trend + list(trend)))
                delete_trends_ids.append(i)
    if (same == True):
        trends.append((tuple(y + x)))
    else:
        trends = [x for i, x in enumerate(trends) if i not in delete_trends_ids]
        trends.insert(min(delete_trends_ids), tuple(new_trend))
```

When then obtain these following "topics":

```
# Car accident involving Pierre Palmade, tested positive for cocaine (death of a baby in the accident)
('accident','Palmade','Pierre','homme','avocat','sœur','victime','humoriste','affaire','famille')

# War in Ukraine
('Kiev', 'Otan', 'guerre', 'Moldavie', 'Ukraine', 'bakhmout', 'Russie', 'char')

# Pension reform, with Aurélien Pradié (LR deputy) abstaining against his party's opinion
('Pradié','LR','médecin','âge','cotisation','SNCF','février','an','jeudi','Aurélien',
   'RATP','enfant','perturbation','libéral','majorité','carrière','grève','réforme','long','retraite')

# Nikki Haley announces candidacy for the 2024 US presidential election (against Donald Trump)
('Nikki','républicain','Trump','américain','présidentielle','candidat','Haley','Donald')

# Earthquake in Turkey-Syria
('séisme', 'Turquie', 'Syrie')

# Round of 16 Champions League match (PSG - Bayern)
('Bayern', 'PSG')

# Europe votes to end internal combustion engine cars by 2035
('européen','thermique','moteur','pollution','air','automobile',
   'particule','France','vote','parlement','fin')

# Remains of dismembered woman found in Buttes-Chaumont park
('Chaumont', 'butte', 'humain', 'femme', 'reste')

# Bruno Benard (Lyon) postpones diesel ban until 2028
('Bruno', 'Bernard', 'Lyon', 'président', 'zfe')

# Slight decrease in unemployment rate
('taux', 'chômage')

# Stade de France without events in 2024 to prepare for the Olympics
('Paris', 'jo')

# Olivier Dussopt called an assassin by an LFI deputy in the assembly
('Dussopt', 'LFI', 'député')

# Marseille concerned about electric scooter operators
('Marseille', 'trottinette')

# Bansky unveils new artwork on domestic violence for Valentine's Day
('Banksy', 'oeuvre')

# Chinese balloons are found everywhere in the world
('chinois', 'espion', 'ballon')

# It's close to Valentine's Day
('Saint-Valentin', 'conjugal')
```