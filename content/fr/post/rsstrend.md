---
title: RSS Trends
subtitle: Trouver les événements des actualités françaises en utilisant les flux RSS.
date: 2023-08-24
bigimg: [{ src: "/images/post/rss-trends/rss-trends.webp"}]
image: "/images/post/rss-trends/rss-trends.webp"
tags: ["dataviz", "nlp", "python", "scraping"]
summary: Analyse des flux RSS des grands médias français pour créer un Text Network représentant les tendances de l'actualité ainsi que les liens entre les termes les plus fréquents.
---

{{<link href="https://github.com/antoninfaure/rssTrends" class="btn btn-default my-3" target="_blank" inner="GitHub">}}
{{<link href="https://www.kaggle.com/datasets/antoninfaure/news-france" target="_blank" class="btn btn-info my-3" inner="Kaggle Dataset">}}
{{<link href="https://medium.com/@antonin.faure/grouping-french-news-on-rss-feeds-d4a05404d848" target="_blank" class="btn btn-danger my-3" inner="Medium">}}

{{<link href="https://antoninfaure.github.io/rssTrends/" target="_blank" class="btn btn-success my-3" inner="Live Demo">}}
{{<iframe src="https://antoninfaure.github.io/rssTrends/" class="w-100" >}}

Inspiré et curieux de la façon dont Google News regroupe les articles par événement, je me suis lancé le défi de reproduire cet état de l'art.

- [Scraping des flux RSS](#scraping-des-flux-rss)
- [Analyse du vocabulaire et de la fréquence des termes avec du NLP](#analyse-du-vocabulaire-et-de-la-fréquence-des-termes-avec-du-nlp)
- [Création d'un Text Network](#création-dun-text-network)
- [Visualisation du Text Network avec D3.js](#visualisation-du-text-network-avec-d3js)
- [Regroupement des actualités avec les règles d'association](#regroupement-des-actualités-avec-les-règles-dassociation)

---

## Scraping des flux RSS

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
def scrap_feeds(feed_urls):
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

---

## Analyse du vocabulaire et de la fréquence des termes avec du NLP

Ensuite, il est nécessaire de traiter le texte brut des articles en utilisant les bibliothèques [Spacy](https://spacy.io) et [NLTK](https://www.nltk.org), qui gèrent les caractères spéciaux, découpent chaque terme en tokens, puis effectuent une lemmatisation. De plus, un dictionnaire de vocabulaire est généré, contenant la fréquence des termes (tf) dans le corpus.

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

Si vous souhaitez travailler avec le jeu de données, il est disponible sur Kaggle : {{<link inner="Kaggle" href="https://www.kaggle.com/datasets/antoninfaure/news-france" target="_blank" class="btn btn-info">}}

---

## Création d'un Text Network

Pour visualiser les relations entre les termes, nous devons d'abord créer un réseau.

Pour ce faire, nous devons dresser la liste des liens (*arêtes*) entre chaque terme (*nœuds*). Pour cela, nous utiliserons la bibliothèque [NLTK](https://www.nltk.org/) ainsi que sa méthode de calcul des **bigrammes** (c'est-à-dire les paires de termes voisins dans une phrase). Chaque bigramme représente donc un **lien**, tandis que chaque terme représente un **nœud**, dont la taille dépend de sa **fréquence de terme** (tf).

```python
def process_network(docs, voc, min_freq=5):

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

Ce script génère deux fichiers :
- `nodes.json` : répertoriant tous les termes avec leur fréquence comme *size*
- `edges.json` : répertoriant toutes les paires entre termes avec leur nombre total d'occurrences comme *size*

---

## Visualisation du Text Network avec D3.js

Pour visualiser le réseau de texte, nous utiliserons la bibliothèque [D3.js](https://d3js.org/) avec son composant [Force Graph](https://d3js.org/d3-force).


```html
<!-- index.html -->

<!DOCTYPE html>
<html lang="en">
  <body>
    <svg id="mynetwork"></svg>

    <style>
      #mynetwork {
        width: 100%;
        min-height: 300px;
        background-color: white;
        height: 70vh;
      }
    </style>
  
    <!-- JQuery -->
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
  
    <!-- D3.js -->
    <script src="https://d3js.org/d3.v4.min.js"></script>
  
    <!-- Our custom script -->
    <script type="module" src="./network.js"></script>

  </body>
</html>
```

```javascript
// network.js

let date = '19-08-2023'

fetch(`./data/${date}/edges.json`)
  .then(response => {
    if (response.status == 404) throw error;
    return response.json();
  })
  .then(links => {
    fetch(`./data/${date}/nodes.json`)
      .then(response => {
        if (response.status == 404) throw error;
        return response.json();
      })
      .then(nodes => {
        const title = 'News of ' + date
        const width = $('#mynetwork').innerWidth()
        const height = $('#mynetwork').innerHeight()

        var initial_zoom = d3.zoomIdentity.translate(400, 400).scale(0.05);

        //add zoom capabilities 
        var zoom_handler = d3.zoom().on("zoom", zoom_actions);

        const svg = d3.select('#mynetwork')
          .attr('width', width)
          .attr('height', height)
          .call(zoom_handler)
          .call(zoom_handler.transform, initial_zoom)

        var max_value = 0
        for (node of nodes) {
          if (node.size > max_value) max_value = node.size;
        }

        var color = d3.scaleLinear()
          .domain([1, max_value])
          .range(["yellow", "red"])

        const radius = 20

        var simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(function (d) { return d.id; }))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collide", d3.forceCollide().radius(d => { return (d.size * 3) * radius }).iterations(3))
          .on("tick", ticked);


        var zoomable = svg.append("g").attr("class", "zoomable").attr('transform', initial_zoom),
          link = zoomable.append("g").attr('class', 'links').selectAll(".link"),
          node = zoomable.append("g").attr('class', 'nodes').selectAll(".node")


        // Create a drag handler and append it to the node object instead
        var drag_handler = d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);

        displayTrends(latest_date)
        restart()

        /// SELECT DATE CHANGE
        $('#dataInput').on('change', function (event) {
          var valueSelected = this.value;
          $('#dateAlert').html(``)
          if (valueSelected.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)) {
            let date = valueSelected
            loadDate(date)
          } else {
            $('#dateAlert').html(`Erreur. Mauvais format de date`)
          }
        })

        // TITLE
        svg.append('g')
          .append('text')
          .attr('class', 'title')
          .attr('x', width / 2)
          .attr('y', 50)
          .attr('text-anchor', 'middle')
          .text(title);

        /// RESTART WHEN CHANGE OF DATA
        function restart() {
          node.remove()
          link.remove()

          link = zoomable.append("g").attr('class', 'links').selectAll(".link"),
            node = zoomable.append("g").attr('class', 'nodes').selectAll(".node")

          node = node.data(nodes, function (d) { return d.id }).call(function (a) {
            a.transition().attr("r", function (d) {
              return d.size * radius
            })
              .attr("fill", function (d) {
                return color(d.size);
              })
          })

          var selection = node.enter().append('g').attr('class', 'node')

          selection.append("circle")
            .call(function (node) {
              node.transition().attr("r", function (d) {
                return d.size * radius
              })
                .attr("fill", function (d) {
                  return color(d.size);
                })
            })


          selection.append("text")
            .attr('class', 'text-label')
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(function (d) {
              return d.label
            })
            .style("font-size", function (d) {
              return d.size * radius
            })
            .style('fill', 'black')

          node = selection.merge(node)

          // Apply the general update pattern to the links.
          link = link.data(links, function (d) { return d.source.id + "-" + d.target.id; });
          link.exit().remove();
          link = link.enter().append("g").append("line")
            .call(function (link) {
              link.transition()
                .attr("stroke-opacity", 1)
                .attr("stroke-width", function (d) { return 10 + 'px' })
            })
            .style('stroke', 'black').merge(link);

          drag_handler(node);

          simulation.nodes(nodes)

          simulation.force("link").links(links);

          simulation.alphaTarget(0.3).restart();
          d3.timeout(function () {
            simulation.alphaTarget(0);
          }, 500)
        }
        /* ----------------- */
        /* UTILITY FUNCTIONS */
        /* ----------------- */

        // EACH SIMULATION TICK
        function ticked() {
          link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

          node
            .attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            })
        }


        function loadDate(date) {
          fetch(`./data/${date}/nodes.json`)
            .then(response => {
              if (response.status == 404) throw error;
              return response.json();
            })
            .then(new_nodes => {
              fetch(`./data/${date}/edges.json`)
                .then(response => {
                  if (response.status == 404) throw error;
                  return response.json();
                })
                .then(new_edges => {
                  links = new_edges
                  nodes = new_nodes
                  svg.select('.title').text('News of ' + date)
                  displayTrends(date)
                  restart()
                })
            })
        }

        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        function zoom_actions() {
          if (zoomable) {
            zoomable.attr("transform", d3.event.transform)
          }
        }
      })
  })
```

Alternativement, le logiciel [Gephi](https://gephi.org/) peut être utilisé pour gérer les **ensembles de données volumineux**, ce qui serait autrement difficile avec le Force Graph de D3.js.

---

## Regroupement des actualités avec les règles d'association

Pour obtenir les sujets les plus tendances, divers critères de règles d'association peuvent être pris en compte : confiance, support, lift, valeur ajoutée, effet de levier et conviction.

Tout d'abord, nous devons créer une matrice de fréquence terme-document (TDF) pour générer différentes combinaisons de k termes.

```python
te = TransactionEncoder()
te_ary = te.fit(docs).transform(docs, sparse=True)
df = pd.DataFrame.sparse.from_spmatrix(te_ary, columns=te.columns_)
```

Ensuite, nous appliquons l'**algorithme Apriori** pour obtenir les combinaisons de k les plus pertinentes (où k > 1).

```
def find_combinations(df, criterion="leverage"):
  frequent_itemsets = apriori(df, min_support=0.005, use_colnames=True, verbose=1)
  frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))
  
  rules = association_rules(frequent_itemsets, metric ="lift", min_threshold = 1)
  rules = rules.sort_values([criterion], ascending =[False])
  
  rules = rules[rules[criterion] > level]

  return rules
```

Néanmoins il s'avère que plusieurs combinaisons peuvent représenter le même "topic" et il serait donc pertinent de fusionner les combinaisons afin d'obtenir le condensé du "topic".

Voici ci-dessous les combinaisons les plus pertinentes avec les valeurs des critères pour les données du 13 février 2023, en utilisant "leverage" comme critère d'ordre :

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

Pour le critère de pertinence, j'ai choisi "leverage" car il offrait les résultats les plus prometteurs, mais il y a encore de la place pour davantage d'exploration à l'avenir.

Pour fusionner les combinaisons, nous pouvons faire l'hypothèse que dans l'ordre décroissant de pertinence, si $(x, y)$ et $(x, z)$ partagent $x$, alors nous associons les deux pour obtenir $(x, y, z)$, en veillant à indexer la combinaison avec la plus grande pertinence des deux.

L'inconvénient de cette hypothèse est que nous pouvons **lier deux éléments non liés** $y$ **et** $z$.

```python
def merge_topics(rules, criterion="leverage", level=0.01):
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

  return trends
```

Pour les données du 13 février 2023 on obtient les topics suivants :

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

Après avoir testé cette méthode sur plusieurs jours, j'ai pu remarqué que la pertinence des topics était très **imprévisible** d'un jour à l'autre avec la méthode actuelle.

Une solution pourrait être d'explorer davantage de solutions de merging avec des **règles d'association** ou de réaliser un clustering (par exemple avec l'algorithme de **Spectral Clustering**).

Il y a certainement plus de travail à faire pour rendre cette solution plus précise et self-learning.

---

Pour la suite, il pourrait être intéressant d'explorer le clustering non pas des termes, mais des articles, et de trouver un moyen d'extraire des événements ou des sujets à partir des termes des articles.
