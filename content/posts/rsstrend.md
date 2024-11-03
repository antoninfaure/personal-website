---
title: RSS Trends
subtitle: Finding Topics in French News using RSS Feeds
date: 2023-08-24
image: /images/post/rss-trends/rss-trends.webp
tags: ["dataviz", "nlp", "d3js", "python", "scraping"]
categories: ["post"]
description: Analyzing RSS feeds from major French media outlets to create a Text Network depicting news trends and connections between most frequent terms.
---

[GitHub](https://github.com/antoninfaure/rssTrends)
[Kaggle Dataset](https://www.kaggle.com/datasets/antoninfaure/news-france)
[Medium](https://medium.com/@antonin.faure/grouping-french-news-on-rss-feeds-d4a05404d848)
[Live Demo](https://antoninfaure.github.io/rssTrends/)

Inspired by and curious about Google News articles grouping by event I challenged myself into replicating its state of the art.

- [Scraping RSS feeds](#scraping-rss-feeds)
- [Extracting vocabulary and tf using NLP](#extracting-vocabulary-and-tf-using-nlp)
- [Creating a Text Network](#creating-a-text-network)
- [Visualizing the Text Network with D3.js](#visualizing-the-text-network-with-d3js)
- [Grouping news with associations rules](#grouping-news-with-associations-rules)
- [Automating with GitHub Actions](#automating-with-github-actions)

---

## Scraping RSS feeds

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

## Extracting vocabulary and tf using NLP

Next, it's necessary to process the raw text of the articles using the libraries [Spacy](https://spacy.io) and [NLTK](https://www.nltk.org), which handle special characters, tokenize each term and then lemmatize them. Additionally, a vocabulary dictionary is generated, containing the frequency of terms (tf) within the corpus.

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

If you wanna play with the dataset it’s available on Kaggle: [Kaggle](https://www.kaggle.com/datasets/antoninfaure/news-france)

---

## Creating a Text Network

To visualize the relations between terms, we first have to create a network.

In order to do so we must list the links (*edges*) between each terms (*nodes*). To accomplish this, we’ll use the [NLTK](https://www.nltk.org/) library along with its method for calculating **bigrams** (i.e., pairs of neighboring terms in a sentence). Each bigram thus represents a **link**, while each term represents a **node**, with the node’s size depending on its **term-frequency** (tf).

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

This script outputs two files:
- `nodes.json`: listing all terms with their frequency as size
- `edges.json`: listing all pairs between terms with their total number of occurrences as size

---

## Visualizing the Text Network with D3.js

In order to visualize the Text Network we will use the [D3.js](https://d3js.org/) library with its [Force Graph](https://d3js.org/d3-force).

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

Alternatively, the software [Gephi](https://gephi.org/) can be used for handling **large datasets**, which would be otherwise impractical with D3.js Force Graph.

---

## Grouping news with associations rules

To obtain the most trending topics, various association rule criteria can be considered: confidence, support, lift, added value, leverage, and conviction.

First we need to create a term-document frequency (TDF) matrix to generate different k-combinations of terms.

```python
te = TransactionEncoder()
te_ary = te.fit(docs).transform(docs, sparse=True)
df = pd.DataFrame.sparse.from_spmatrix(te_ary, columns=te.columns_)
```

When the apply the **Apriori algorithm** to obtain the most relevant k-combinations (where k > 1).

```
def find_combinations(df, criterion="leverage"):
  frequent_itemsets = apriori(df, min_support=0.005, use_colnames=True, verbose=1)
  frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))
  
  rules = association_rules(frequent_itemsets, metric ="lift", min_threshold = 1)
  rules = rules.sort_values([criterion], ascending =[False])
  
  rules = rules[rules[criterion] > level]

  return rules
```

However, it turns out that several combinations can represent the same “topic”, making it relevant to merge these combinations to obtain a single condensed topic.

Below are the most relevant combinations with criteria values on data from February 13, 2023, using “leverage” as sorting criterion:


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

For the relevance criterion, I’ve chosen leverage as it provided the most promising results, but there is room for more exploration in the future.

To merge the combinations, we can make the assumption that in descending  order of relevance, if $(x, y)$ and $(x, z)$ share $x$, then we associate the two and obtain $(x, y, z)$, taking care to index the combination with the higher relevance of the two.

The drawback of this assumption is that we can **link two unrelated** $y$ **and** $z$.

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

When then obtain these following “merged topics” for the data from February 13, 2023:

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

After testing this method on several days I noticed that the relevance of the merged topic was very **unpredictable** from day to day with the current method.

One solution to this could be to explore more merging solutions with **associations rules** or to perform clustering (with **Spectral Clustering** Algorithm for e.g.).

There’s definitely more work to make this solution more accurate and self-learning.

---

## Automating with GitHub Actions

In order to scrap the data and update our graph on a daily basis without our intervention we can use [GitHub Actions](https://github.com/features/actions). I made a [dedicated post](/post/actions-scraping) to explain the process.

---

For future work it could be interesting to explore not terms but articles clustering instead and finding a way to extract event or topics from their terms.