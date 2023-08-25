---
title: EPFL GraphSociative
draft: true
subtitle: Visualizing EPFL's Associative Network
date: 2023-08-25
bigimg:
  - src: /images/post/graphsociatif/graphsociatif.webp
image: /images/post/graphsociatif/graphsociatif.webp
preview: /images/post/graphsociatif/graphsociatifThumb.webp
tags:
  - dataviz
  - ldap
  - d3js
  - python
  - scraping
summary: Scraping the EPFL LDAP to visualize the associative network of EPFL using D3.js
---

Have you ever wondered about the intricate connections within EPFL's vast academic landscape? How do units, subunits, and individuals interconnect, forming a web of relationships that drive innovation and collaboration? In this blog post, we're embarking on a captivating journey through a Python project that uncovers these hidden relationships, step by step. By the end of this odyssey, you'll witness the creation of a stunning visualization using D3.js that brings EPFL's academic network to life.

--- 

### The Project Overview

Our ambitious goal is to create an interactive visualization that reveals the relationships between EPFL units, subunits, and individuals with accreditations. This visualization will provide an insightful and captivating perspective on the organization's internal connections and collaborations.

{{<iframe src="https://antoninfaure.github.io/graphsociatif" class="w-100" >}}

--- 

### Step 1: **Data Retrieval**

To start our journey, we need data. The `utils.py` script fetches and processes data from EPFL's search API and LDAP server. Here's a snippet of the script that lists units and subunits:

```python
def list_units(write_groups_json=True, write_units_json=True):
    BASE_URL = "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro="

    res = requests.get(BASE_URL + 'ASSOCIATIONS')
    groups = json.loads(res.text)['subunits']

    # Rest of the code...
```

---

### Step 2: **Data Processing**

The next script, `scrap.py`, processes the data retrieved from `utils.py`. It calculates unit sizes, fetches accreditations, and determines user attributes. Let's explore the code that computes unit sizes:

```python
def compute_unit_size(units, accreds):
    unit_size = dict()
    for accred in accreds:
        unit_id = accred['unit_id']
        if unit_id in unit_size:
            unit_size[unit_id] += 1
        else:
            unit_size[unit_id] = 1

    for i, unit in enumerate(units):
        if unit['id'] not in unit_size:
            size = 0
        else:
            size = unit_size[unit['id']]
        units[i] = {
            **unit,
            'size': size
        }

    return units
```

---

### Step 3: **Building the Network**

Now comes the exciting part – building the network using D3.js. The `network.js` script crafts an interactive representation of EPFL's academic landscape. Here's a glimpse of the script that creates nodes and links:

```javascript
// network.js

var node = g.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g")
```

---

### Step 4: **Visualizing with D3.js**

D3.js is the magical ingredient that transforms data into captivating visualizations. Our visualization utilizes D3.js's force simulation to arrange nodes and links dynamically. The simulation ensures nodes repel each other, links connect, and collisions are avoided – resulting in a visually appealing and informative display.

---

### Step 5: **Interactive Exploration**

Interactivity takes our visualization to the next level. Users can drag nodes, zoom in and out for details, and explore connections at their pace. D3.js provides seamless drag-and-drop and zoom features, making the visualization a canvas for your exploration.

---

### Step 6: **Live Demo and Beyond**

But don't just take our word for it – experience the visualization live! Check out our [Live Demo](https://antoninfaure.github.io/graphsociatif) and immerse yourself in EPFL's academic network. This project is open-source, inviting you to customize, extend, and adapt it. The modular structure ensures easy customization – add features, integrate more data sources, and make it your own.

---

The journey from data scraping to D3.js visualization unveils the intricate connections within EPFL's academic network. What was once raw data is now an interactive masterpiece showcasing collaborations, associations, and accreditations. Explore, learn, and gain insights into the web of relationships that power EPFL's academic ecosystem.

As you embark on your own exploration, remember that data, creativity, and technology are potent allies in unraveling even the most complex networks. Bon voyage!