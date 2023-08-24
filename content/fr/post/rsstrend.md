---
title: RSS Trends
date: 2023-08-24
bigimg: [{ src: "/images/post/rss-trends/rss-trends.png"}]
image: "/images/post/rss-trends/rss-trends.png"
---

Analyse des flux RSS des grands médias français pour créer un Text Network représentant les tendances de l'actualité ainsi que les liens entre les termes les plus fréquents.

<!--more-->

{{<link href="https://github.com/antoninfaure/rssTrends" class="btn btn-default my-3" target="_blank" inner="GitHub">}}
{{<link href="https://www.kaggle.com/datasets/antoninfaure/news-france" target="_blank" class="btn btn-info my-3" inner="Kaggle Dataset">}}

### Réalisé avec
{{<span class="btn btn-danger mb-2" inner="Jupyter Notebook">}}
{{<link href="https://d3js.org" class="btn btn-primary mb-2" target="_blank" inner="D3.js">}}

{{<iframe src="https://antoninfaure.github.io/rssTrends/" class="w-100" >}}

## Data Mining
Pour récupérer des articles d'actualités françaises je me suis basé sur les flux RSS des médias suivants : 
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

Un rapide script pour récupérer les titres et descriptions de tous les articles avec l'utilisation des librairies [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/), Pandas et requests.

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

Il faut ensuite traiter le texte des articles à l'aide des librairies [Spacy](https://spacy.io) et [NLTK](https://www.nltk.org) qui remplacent les charactères spéciaux puis qui tokenize chaque terme et pour ensuite les lemmatiser. On génére aussi un dictionnaire pour le vocabulaire avec la fréquence des termes dans le corpus.

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

Le dataset des articles est disponible sur {{<link inner="Kaggle" href="https://www.kaggle.com/datasets/antoninfaure/news-france" target="_blank" class="btn btn-info">}}

## Data Visualization
Afin de visualiser le network, il faut dans un premier temps lister les liens (edges) entre chaque terme (nodes). Pour ce faire, on utilise la librairie NLTK et sa méthode pour calculer les bigrammes (i.e. les paires de termes voisins dans une phrase). Chaque bigramme représente donc un **lien** tandis que chaque terme représente un **noeud** dont la taille dépend de sa fréquence dans le corpus.

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

On peut ensuite afficher le network à l'aide de la libraire D3.js, comme visible en haut de la page. On peut aussi utiliser le logiciel [Gephi](https://gephi.org/) permettant la manipulation de large set de données, inenvisageable autrement pour le set des articles US 2022 (~250,000 articles).

{{<figure src="/images/post/rss-trends/gephi.png" title="Actualités françaises du 30 janvier 2023 visualisées sur Gephi">}}

## Association Rules
Afin d'obtenir les sujets les plus tendances on peut se baser sur différents critères d'association rules : confidence, support, lift, added value, leverage, conviction. Dans un premier temps on crée une tdf-matrix (term-document frequency) afin de créer les différentes k-combinaisons de termes.
```python
te = TransactionEncoder()
te_ary = te.fit(docs).transform(docs, sparse=True)
df = pd.DataFrame.sparse.from_spmatrix(te_ary, columns=te.columns_)
```
On applique ensuite l'apriori algorithm pour obtenir les k-combinaisons (avec k>1) les plus pertinentes.
```
frequent_itemsets = apriori(df, min_support=0.005, use_colnames=True, verbose=1)
frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))

rules = association_rules(frequent_itemsets, metric ="lift", min_threshold = 1)
rules = rules.sort_values([criterion], ascending =[False])

rules = rules[rules[criterion] > level]
```

Néanmoins il s'avère que plusieurs combinaisons peuvent représenter le même "topic" et il serait donc pertinent de fusionner les combinaisons afin d'obtenir le condensé du "topic".

Ci-dessous un extrait des combinaisons les plus pertinentes pour les données du 13 février 2023 :

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

Pour le critére de pertinence je suis parti sur le leverage car c'est celui qui donnait les résultats les plus prometteurs. Afin de merge les combinaisons on peut supposer que dans l'ordre décroissant de la pertinence si $(x, y)$ et $(x,z)$ ont $x$ en commun alors on associe les deux et on obtient $(x,y,z)$, en prenant bien soin d'indexer la combinaison avec la meilleure pertinence des deux.

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
Après itération du code ci-dessus on obtient les "topics" suivants :
```
# Accident de voiture de Pierre Palmade testé positif à la cocaïne (mort d'un bébé dans l'accident)
('accident','Palmade','Pierre','homme','avocat','sœur','victime','humoriste','affaire','famille')

# Guerre en Ukraine
('Kiev', 'Otan', 'guerre', 'Moldavie', 'Ukraine', 'bakhmout', 'Russie', 'char')

# Réforme des retraites, avec Aurélien Pradié (député LR) qui s'abstient contre l'avis de son parti
('Pradié','LR','médecin','âge','cotisation','SNCF','février','an','jeudi','Aurélien',
   'RATP','enfant','perturbation','libéral','majorité','carrière','grève','réforme','long','retraite')

# Nikki Haley qui candidate à la présidentielle américaine de 2024 (face à Donald Trump) 
('Nikki','républicain','Trump','américain','présidentielle','candidat','Haley','Donald')

# Séisme en Turquie-Syrie
('séisme', 'Turquie', 'Syrie')

# Match 8e de finale Ligue des Champions (PSG - Bayern)
('Bayern', 'PSG')

# Europe vote fin des voitures à moteur thermique pour 2035
('européen','thermique','moteur','pollution','air','automobile',
   'particule','France','vote','parlement','fin')

# Reste de cadavre d'une femme découpée au parc des Buttes-Chaumont
('Chaumont', 'butte', 'humain', 'femme', 'reste')

# Bruno Benard (Lyon) repousse l'interdiction du diesel à 2028
('Bruno', 'Bernard', 'Lyon', 'président', 'zfe')

# Légère baisse du taux de chômage
('taux', 'chômage')

# Stade de France privé d'évènement en 2024 pour préparer les JO
('Paris', 'jo')

# Olivier Dussopt traité d'assassin par un député LFI à l'assemblée
('Dussopt', 'LFI', 'député')

# Marseille se préocupe des opérateurs de trottinettes électriques
('Marseille', 'trottinette')

# Bansky dévoile une nouvelle oeuvre sur les violences conjugales pour la St Valentin
('Banksy', 'oeuvre')

# Des ballons chinois sont partout dans le monde
('chinois', 'espion', 'ballon')

# C'est proche de la Saint-Valentin
('Saint-Valentin', 'conjugal')
```