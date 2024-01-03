---
title: EPFL GraphSociatif
draft: false
subtitle: Visualisation du réseau associatif de l'EPFL
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
summary: Scraping du LDAP de l'EPFL pour visualiser le réseau associatif de l'EPFL en utilisant D3.js
---

{{<link href="https://github.com/antoninfaure/graphsociatif" class="btn btn-cyan my-3" target="_blank" inner="GitHub">}}
{{<link href="https://antoninfaure.github.io/graphsociatif" class="btn btn-success my-3" inner="Live Demo" >}}
{{<iframe src="https://antoninfaure.github.io/graphsociatif" class="w-100" >}}

Avez-vous déjà pensé aux liens entres les associations de l'EPFL ? Quelles sont les associations les plus importantes ? Quelles sont les personnes qui sont actives dans plusieurs associations ? Quelles sont les associations qui ont le plus de membres ?

Créons une visualisation interactive qui montre les relations entre les associations et les personnes avec leurs accréditations.

- [Récupération de la liste des associations](#récupération-de-la-liste-des-associations)
- [Récupération de la liste des personnes dans une unité](#récupération-de-la-liste-des-personnes-dans-une-unité)
  - [Calcul des tailles d'unités et d'utilisateurs](#calcul-des-tailles-dunités-et-dutilisateurs)
- [Calcul des liens entre les unités et les utilisateurs](#calcul-des-liens-entre-les-unités-et-les-utilisateurs)
- [Visualisation avec D3.js](#visualisation-avec-d3js)
- [Conclusion](#conclusion)

---

## Récupération de la liste des associations

Après quelques recherches sur le site web de l'EPFL, j'ai découvert l'API search-ai.epfl.ch. Elle permet de rechercher des unités et des personnes. L'API n'est pas documentée publiquement, mais nous avons seulement besoin d'utiliser un point de terminaison pour récupérer la liste des sous-unités d'une unité :

```bash
https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro={ACRONYME}
```

Par exemple, pour récupérer la liste des sous-unités de l'unité ASSOCIATIONS, nous pouvons utiliser l'URL suivante :

```bash
curl "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro=ASSOCIATIONS"
```

Nous obtenons la réponse suivante :

```json
{
    "code": 10583,
    "acronym": "ASSOCIATIONS",
    "name": "Associations on the campus",
    "unitPath": "EHE ASSOCIATIONS",
    "path": [
        {
            "acronym": "EHE",
            "name": "New structure of the entities except school"
        },
        {
            "acronym": "ASSOCIATIONS",
            "name": "Associations on the campus"
        }
    ],
    "terminal": null,
    "ghost": null,
    "url": "https://associations.epfl.ch",
    "subunits": [
        {
            "acronym": "AGEPOLY-CE",
            "name": "AGEPoly - Commissions et \u00e9quipes"
        },
        {
            "acronym": "AIDE-PROF",
            "name": "Aide \u00e0 la vie professionnelle"
        },
        {
            "acronym": "ANIMATIONS",
            "name": "Animations"
        },
        {
            "acronym": "AUTRES-ASS",
            "name": "Autres associations"
        },
        {
            "acronym": "DEVELOP",
            "name": "D\u00e9veloppement"
        },
        {
            "acronym": "ETUD-PAYS",
            "name": "Etudiants - Pays"
        },
        {
            "acronym": "ETUD-EPFL",
            "name": "Etudiants EPFL"
        },
        {
            "acronym": "PROJETS-INT",
            "name": "Projets interdisciplinaires"
        },
        {
            "acronym": "4-CORPS",
            "name": "Representation of the 4 school bodies and ACC-EPFL"
        },
        {
            "acronym": "REPRESENT",
            "name": "Repr\u00e9sentation des \u00e9tudiants"
        },
        {
            "acronym": "SCIENC-CULT",
            "name": "Sciences et cultures"
        },
        {
            "acronym": "SPORTS",
            "name": "Sports"
        }
    ]
}
```

Nous pouvons voir qu'il y a 12 unités "groupe" pour ASSOCIATIONS. En interrogeant maintenant le même point de terminaison avec l'acronyme de l'un des "groupes", par exemple `ANIMATIONS` :

```bash
curl "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro=ANIMATIONS"
```

Nous obtenons la réponse suivante :

```json
{
    "code": 11438,
    "acronym": "ANIMATIONS",
    "name": "Animations",
    "unitPath": "EHE ASSOCIATIONS ANIMATIONS",
    "path": [
        {
            "acronym": "EHE",
            "name": "New structure of the entities except school"
        },
        {
            "acronym": "ASSOCIATIONS",
            "name": "Associations on the campus"
        },
        {
            "acronym": "ANIMATIONS",
            "name": "Animations"
        }
    ],
    "terminal": null,
    "ghost": null,
    "address": [
        "CH-"
    ],
    "head": {
        "sciper": "220390",
        "name": "Traill",
        "firstname": "Heidy",
        "email": "heidy.traill@epfl.ch",
        "profile": "heidy.traill"
    },
    "subunits": [
        {
            "acronym": "ARTIPHYS",
            "name": "Artiphys"
        },
        {
            "acronym": "BALELEC",
            "name": "Festival Bal\u00e9lec"
        },
        {
            "acronym": "SYSMIC",
            "name": "Festival SYSMIC"
        },
        {
            "acronym": "AS-SATELLITE",
            "name": "Satellite"
        }
    ]
}
```

Maintenant, nous avons des unités d'associations en tant que sous-unités. Nous pouvons ainsi créer un script qui récupère la liste des sous-unités de l'unité ASSOCIATIONS, puis la liste des sous-unités de chaque sous-unité, et ainsi de suite jusqu'à obtenir la liste de toutes les associations.

```python
import requests
import json

def list_units(write_groups_json=True, write_units_json=True):
    BASE_URL = "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro="

    res = requests.get(BASE_URL + 'ASSOCIATIONS')
    groups = json.loads(res.text)['subunits']

    units = []
    for i, group in enumerate(groups):
        res = requests.get(BASE_URL + group['acronym'])

        # Trouver les unités enfants du groupe
        child_units = json.loads(res.text)['subunits']

        # Ajouter l'ID aux groupes
        groups[i] = {
            **group,
            'id': i
        }
        for unit in child_units:
            units.append({
                'group_name': group['acronym'],
                'group_id': i,
                **unit
            })

    # Ajouter l'ID et le type aux unités
    for i, unit in enumerate(units):
        units[i] = {
            **unit,
            'id': i,
            'label': unit['acronym'],
            'type': 'unit'
        }

    return units, groups
```

---

## Récupération de la liste des personnes dans une unité

Maintenant que nous avons la liste des sous-unités, nous devons récupérer la liste des personnes dans chaque sous-unité. Testons le même point de terminaison qu'auparavant avec l'acronyme `SYSMIC` :

```bash
curl "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro=SYSMIC"
```
Nous obtenons la réponse :
```json
{
    "code": 11346,
    "acronym": "SYSMIC",
    "name": "Festival SYSMIC",
    "unitPath": "EHE ASSOCIATIONS ANIMATIONS SYSMIC",
    "path": [
        {
            "acronym": "EHE",
            "name": "New structure of the entities except school"
        },
        {
            "acronym": "ASSOCIATIONS",
            "name": "Associations on the campus"
        },
        {
            "acronym": "ANIMATIONS",
            "name": "Animations"
        },
        {
            "acronym": "SYSMIC",
            "name": "Festival SYSMIC"
        }
    ],
    "terminal": "1",
    "ghost": null,
    "address": [
        "Festival SYSMIC",
        "P.a. EPFL STI SMT-GE",
        "BM 2107 (B\u00e2timent BM)",
        "Station 17",
        "CH-1015 Lausanne"
    ],
    "head": {
        "sciper": "324926",
        "name": "Cirillo",
        "firstname": "Thomas",
        "email": "thomas.cirillo@epfl.ch",
        "profile": "thomas.cirillo"
    },
    "url": "https://sysmic.epfl.ch",
    "people": [
        {
            "name": "Artru",
            "firstname": "Thomas",
            "email": "thomas.artru@epfl.ch",
            "sciper": "329649",
            "rank": 0,
            "profile": "thomas.artru",
            "position": "Vice-President of Association",
            "phoneList": [
                
            ],
            "officeList": [
                
            ]
        },
        {
            "name": "Charoz\u00e9",
            "firstname": "Rapha\u00ebl Guillaume Alexandre",
            "email": "raphael.charoze@epfl.ch",
            "sciper": "330682",
            "rank": 0,
            "profile": "raphael.charoze",
            "position": "Vice-President of Association",
            "phoneList": [
                
            ],
            "officeList": [
                
            ]
        },
        {
            "name": "Cirillo",
            "firstname": "Thomas",
            "email": "thomas.cirillo@epfl.ch",
            "sciper": "324926",
            "rank": 0,
            "profile": "thomas.cirillo",
            "position": "President of Association",
            "phoneList": [
                
            ],
            "officeList": [
                
            ]
        },
        {
            "name": "D\u00e9vaud",
            "firstname": "S\u00e9bastien Andr\u00e9",
            "email": "sebastien.devaud@epfl.ch",
            "sciper": "315144",
            "rank": 0,
            "profile": "sebastien.devaud",
            "position": "Treasurer",
            "phoneList": [
                
            ],
            "officeList": [
                
            ]
        },
        {
            "name": "Hakim",
            "firstname": "Daoud",
            "email": null,
            "sciper": "330002",
            "rank": 0,
            "profile": "330002",
            "position": "Vice-President of Association",
            "phoneList": [
                
            ],
            "officeList": [
                
            ]
        }
    ]
}
```

Le champ `people` contient la liste des personnes de la sous-unité qui est affichée sur la page [people.epfl.ch](https://people.epfl.ch) de l'unité.

Malheureusement, pour `SYSMIC` et d'autres sous-unités, il ne contient que certains membres de la sous-unité. Pour récupérer la liste complète des membres, nous devons utiliser le **serveur LDAP interne de l'EPFL**.

Le serveur LDAP de l'EPFL est un serveur interne qui contient la liste de toutes les personnes de l'EPFL. Il n'est pas accessible publiquement, mais nous pouvons utiliser le **VPN de l'EPFL** pour

 y accéder. Le serveur LDAP n'est pas documenté, mais il suit le [protocole LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) et nous pouvons utiliser la bibliothèque Python [ldap3](https://ldap3.readthedocs.io/en/latest/) pour s'y connecter et effectuer des requêtes.

Voici un script qui récupère la liste des accréditations dans une sous-unité à partir du serveur LDAP, pour toutes les unités :

```python
from ldap3 import Server, Connection, SUBTREE

def list_accreds(units):
    '''
    Liste toutes les accréditations de l'EPFL depuis le serveur LDAP de l'EPFL (ldap.epfl.ch).

    Entrée :
        units (list) : liste des unités
        write_accreds_json (booléen) : écrit les accréditations dans accreds.json (facultatif)

    Sortie :
        accreds.json (fichier) : liste des accréditations (facultatif)

    Retour :
        accreds (list) : liste des accréditations
    '''

    server = Server('ldaps://ldap.epfl.ch:636', connect_timeout=5)
    c = Connection(server)

    if not c.bind():
        print("Erreur : impossible de se connecter à ldap.epfl.ch", c.result)
        return

    accreds = []
    for unit in units:
        c.search(search_base = 'o=ehe,c=ch',
                search_filter = f"(&(ou={unit['acronym']})(objectClass=person))",
                search_scope = SUBTREE,
                attributes = '*')

        results = c.response
        for user in results:
            user = dict(user['attributes'])
            accreds.append({
                'sciper': int(user['uniqueIdentifier'][0]),
                'name': user['displayName'],
                'unit_name': unit['acronym'],
                'unit_id': unit['id']
            })
        
    return accreds
```

---

### Calcul des tailles d'unités et d'utilisateurs

Maintenant que nous avons la liste des accréditations, nous pouvons calculer la taille de chaque unité et de chaque utilisateur. La taille d'une unité est le nombre d'accréditations dans l'unité. La taille d'un utilisateur est le nombre d'accréditations de l'utilisateur.

```python
def compute_units_size(units, accreds):
    units_size = dict()
    for accred in accreds:
        unit_id = accred['unit_id']
        if unit_id in units_size:
            units_size[unit_id] += 1
        else:
            units_size[unit_id] = 1

    for i, unit in enumerate(units):
        if unit['id'] not in units_size:
            size = 0
        else:
            size = units_size[unit['id']]
        units[i] = {
            **unit,
            'size': size
        }

    return units
```

```python
def compute_users_size(accreds):
    n_accreds = dict()
    for accred in accreds:
        if (accred['sciper'] in n_accreds):
            n_accreds[accred['sciper']] += 1
        else:
            n_accreds[accred['sciper']] = 1

    users = []
    for accred in accreds:
        if (n_accreds[accred['sciper']] > 1):
            user = {
                'id': accred['sciper'],
                'name': accred['name'],
                'type': 'user',
                'accreds': n_accreds[accred['sciper']]
            }
            if (user not in users):
                users.append(user)

    return users
```

---

## Calcul des liens entre les unités et les utilisateurs

Maintenant que nous avons la liste des accréditations, nous pouvons calculer les liens entre les unités et les utilisateurs. Un lien entre une unité et un utilisateur signifie que l'utilisateur possède une accréditation dans l'unité.

```python
def compute_links(accreds, units, users):
    links = []
    for i, accred in enumerate(accreds):
        for unit in units:
            if (unit['acronym'] == accred['unit_name']):
                unit_id = unit['id']

        for user in users:
            if (user['id'] == accred['sciper']):
                user_id = user['id']
                links.append({
                    'target': unit_id,
                    'source': user_id
                })

    return links
```

## Visualisation avec D3.js

Maintenant que nous avons la liste des unités, des utilisateurs et des liens, nous pouvons la visualiser avec D3.js. La visualisation est basée sur l'exemple du [Graphique à Liaisons Fortes de D3.js](https://observablehq.com/@d3/force-directed-graph).

Tout d'abord, nous devons

 écrire les données dans un fichier JSON :

```python
def write_json(units, users, links, groups):

    data = {
        'nodes': units + users,
        'links': links
    }

    with open("data.json", "w", encoding='utf8') as outfile:
        json.dump(data, outfile, ensure_ascii=False)

    with open("groups.json", "w", encoding='utf8') as outfile:
        json.dump(groups, outfile, ensure_ascii=False)

```

Ensuite, nous pouvons utiliser le modèle HTML suivant pour visualiser les données :

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="description" content="Graphsociatif">
    <meta name="keywords" content="graph,associations,EPFL">
    <meta name="author" content="Antonin Faure">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Graphsociatif</title>

    <!-- JQuery -->
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>

    <!-- D3.js -->
    <script src="https://d3js.org/d3.v4.min.js"></script>
</head>

<body>
    <svg id="mynetwork"></svg>
</body>

<style>
    html, body {
        min-height: 100%;
        height: 100%;
        min-width: 100%;
        margin: 0;
        padding: 0;
        background-color: black;
    }
    #mynetwork {
        width: 100%;
        min-height: 600px;
        border: 1px solid lightgray;
        height: 100%;
    }
</style>


<!-- Notre script personnalisé -->
<script type="module" src="network.js"></script>

</html>
```

Maintenant, nous pouvons écrire le script `network.js` qui chargera les données et les visualisera avec D3.js.
Nous devons différencier entre les unités et les utilisateurs, et entre les liens entre les unités et les liens entre les utilisateurs.

Pour les **nœuds utilisateur**, nous allons définir la couleur en **rouge**, et le rayon en fonction du nombre d'accréditations de l'utilisateur. Pour les **nœuds unité**, nous allons définir la couleur en fonction de la **couleur du groupe** de l'unité, et le rayon en fonction du nombre d'accréditations dans l'unité. On ajoute aussi une **légende** avec le nom et la couleur de chaque groupe.

```javascript
// network.js

fetch("groups.json")
  .then(response => {
    return response.json();
  })
  .then(groups => {
    fetch("data.json")
      .then(response => {
        return response.json();
      })
      .then(graph => {

        // Dimensions du canevas SVG
        const largeur = window.innerWidth
        const hauteur = window.innerHeight

        // Sélectionner l'élément SVG et définir ses dimensions
        const svg = d3.select('svg')
          .attr('width', largeur)
          .attr('height', hauteur)

        // Échelle de couleur pour les unités
        var couleur = d3.scaleOrdinal(d3.schemeCategory20);

        // Constantes de rayon du nœud
        const rayon = 20
        const rayon_personnes = 25

        // Créer une simulation de force
        var simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(function (d) { return d.id; }))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(largeur / 2, hauteur / 2))
          .force("collide", d3.forceCollide().radius(d => { return d.type === 'user' ? 50 * rayon_personnes : 100 * rayon }).iterations(3))

        // Ajouter un groupe SVG pour les éléments
        var g = svg.append("g")
          .attr("class", "everything");

        // Créer les nœuds en utilisant les données de graph.nodes
        var node = g.append("g")
          .attr("class", "nodes")
          .selectAll("g")
          .data(graph.nodes)
          .enter().append("g")

        // Créer les liens en utilisant les données de graph.links
        var link = g.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graph.links)
          .enter().append("line")
          .attr("stroke-width", function (d) { return Math.sqrt(d.value); })
          .style('stroke', 'white')

        // Créer des cercles pour les nœuds
        var cercles = node.append("circle")
          .attr("r", function (d) {
            return d.type === 'user' ? d.accreds * rayon_personnes : d.size * rayon
          })
          .attr("fill", function (d) {
            if (d.type == 'unit') {
              return couleur(d.group_id);
            } else {
              return 'red'
            }
          })

        // Créer un gestionnaire de traînée et l'ajouter à l'objet nœud
        var drag_handler = d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);

        drag_handler(node);

        // Ajouter des étiquettes aux nœuds
        var etiquettes = node.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .text(function (d) {
            return d.type === 'user' ? d.name : d.label
          })
          .style("font-size", function (d) {
            return d.type === 'user' ? d.accreds * rayon_personnes : d.size * rayon
          })
          .style('fill', 'white')

        // Ajouter des info-bulles aux nœuds
        node.append("title")
          .text(function (d) { return d.type === 'user' ? d.name : d.label });

        // Initialiser la simulation avec les nœuds et les liens
        simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

        simulation.force("link")
          .links(graph.links);

        // Fonction pour mettre à jour les positions des liens et des nœuds pendant la simulation
        function ticked() {
          link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

          node
            .attr("transform",

            function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            })
        }

        // Fonction de gestion des événements pour le démarrage du glisser
        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        // Fonction de gestion des événements pour le glisser
        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        // Fonction de gestion des événements pour le glisser
        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
      });
  });
```

La visualisation est maintenant terminée ! Nous pouvons ouvrir le fichier `index.html` dans un navigateur pour voir la visualisation (nous devons exécuter un serveur local pour charger les données avec la commande fetch).

Pour personnaliser la visualisation, nous pouvons modifier l'échelle de couleurs, le rayon des nœuds, les paramètres de simulation de force, etc dans le fichier `network.js`.


{{<image src="/images/post/graphsociatif/graphsociatifBig.png" alt="Graphsociatif" position="center" style="border-radius: 10px;" >}}

---

## Conclusion

Nous avons appris comment récupérer la liste des associations et la liste des accréditations à partir du serveur LDAP de l'EPFL, ainsi que comment les visualiser avec D3.js. La visualisation est disponible sur [https://antoninfaure.github.io/graphsociatif](https://antoninfaure.github.io/graphsociatif).

Le code est disponible sur {{<link href="https://github.com/antoninfaure/graphsociatif" inner="GitHub" class="btn btn-default" target="_blank" >}}.

Pour les projets futurs, il pourrait être intéressant d'étendre le graph à toutes les unités de l'EPFL et d'ajouter davantage d'informations sur les accréditations (par exemple, le rôle de l'utilisateur dans l'unité).