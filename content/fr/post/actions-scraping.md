---
title: Scraping avec GitHub Actions
draft: false
subtitle: Automatisation du scraping avec GitHub Actions
date: 2023-08-26
bigimg:
  - src: /images/post/actions-scraping/github-actions.webp
preview: /images/post/actions-scraping/preview.webp
tags:
  - python
  - scraping
  - github
summary: Exécution d'un script de scraping selon un horaire avec GitHub Actions
---

J'ai récemment dû exécuter un script de scraping quotidiennement afin de récupérer des articles de presse à partir de flux RSS ([en savoir plus](/post/rsstrend)). Pour ce faire j'ai décidé d'utiliser [GitHub Actions](https://github.com/features/actions). Voyons ensemble comment faire.

Nous souhaitons que notre flux de travail puisse :

- [Déclenchement du workflow selon un horaire](#déclenchement-du-workflow-selon-un-horaire)
- [Récupération de la dernière version du repository](#récupération-de-la-dernière-version-du-repository)
- [Exécution d'un script Python](#exécution-dun-script-python)
- [Commit et push les modifications sur le repository](#commit-et-push-les-modifications-sur-le-repository)
- [Résumé](#résumé)

---

## Déclenchement du workflow selon un horaire

Pour déclencher le workflow selon un horaire, nous pouvons utiliser l'événement `schedule` ([voir la documentation](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events)). L'horaire est défini à l'aide d'une syntaxe cron ([voir la documentation](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule)).

```yaml
on:
  schedule:
    - cron: "0 21 * * *" # s'exécute tous les jours à 21 h 00 UTC
```

---

## Récupération de la dernière version du repository

Pour récupérer la dernière version du repository, nous pouvons utiliser l'action `actions/checkout` ([voir la documentation](https://github.com/actions/checkout)). Cette action va extraire le contenu du repository vers l'exécuteur GitHub.

```yaml
steps:
  - name: checkout repo content
    uses: actions/checkout@v3 # extraire le contenu du repository vers l'exécuteur GitHub
```

---

## Exécution d'un script Python

Pour exécuter un script Python, nous devons configurer Python et installer les paquets requis. Nous pouvons utiliser l'action `actions/setup-python` ([voir la documentation](https://github.com/actions/setup-python)). Cette action va configurer Python et pip sur l'exécuteur GitHub. Ensuite, nous pouvons installer les librairies requies pour notre utilisation à l'aide de `pip install -r requirements.txt`.

```yaml
steps:
  - name: setup python
    uses: actions/setup-python@v4 # configurer Python
    with:
      python-version: '3.9'
      
  - name: install python packages # installer les paquets à partir de requirements.txt
    run: |
      python -m pip install --upgrade pip
      pip install -r requirements.txt
```

Nous pouvons également ajouter d'autres étapes pour installer des paquets spécifiques. Par exemple, j'ai dû installer le modèle français pour Spacy, ce qui peut être fait en utilisant `python -m spacy download fr_core_news_lg`.

```yaml
steps:
  - name: install spacy french model
    run: python -m spacy download fr_core_news_lg # installer le modèle français pour Spacy (utilisé par mon script)
```

Enfin, nous pouvons exécuter notre script Python nommé `run.py` en utilisant `python run.py`.

```yaml
steps:
  - name: execute py script # exécuter run.py
    run: python run.py
```

---

## Commit et push les modifications sur le repository

Pour valider et envoyer les modifications sur le repository, nous pouvons utiliser l'action `ad-m/github-push-action` ([voir la documentation](https://github.com/ad-m/github-push-action)). Cette action va valider et envoyer les modifications sur le repository. Nous devons configurer l'action pour utiliser la variable secrète `GITHUB_TOKEN` ([voir la documentation](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)) afin de permettre l'envoi des modifications sur le repository.
Pour ce faire nous devons donner l'autorisation d'écriture au `GITHUB_TOKEN` dans les paramètres du repository : 

{{<image src="/images/post/actions-scraping/settings.png" alt="github-token-settings" position="center">}}

Le workflow génère ensuite automatiquement son propre token, qui est stocké dans la variable secrète `GITHUB_TOKEN`. Ce token est utilisé pour autoriser l'envoi des modifications sur le repository. Nous allons envoyer les modifications directement sur la branche `main`.

```yaml
steps:
  - name: commit files
    run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add -A
        git diff-index --quiet HEAD || (git commit -a -m "logs mis à jour" --allow-empty)
          
  - name: push changes
    uses: ad-m/github-push-action@v0.6.0
    with:
        github_token: ${{ secrets.GITHUB_TOKEN }} # GITHUB_TOKEN est une variable secrète générée automatiquement par GitHub Actions
        branch: main # envoyer vers la branche main
```

---

## Résumé

Pour résumer, voici le workflow complet :

```yaml
name: cron_scrap

on:
  schedule:
    - cron: "0 21 * * *" # s'exécute tous les jours à 21 h 00 UTC

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: checkout repo content
        uses: actions/checkout@v3 # extraire le contenu du repository vers l'exécuteur GitHub
        
      - name: setup python
        uses: actions/setup-python@v4 # configurer Python
        with:
          python-version: '3.9'
          
      - name: install python packages # installer les paquets à partir de requirements.txt
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt 
          
      - name: install spacy french model
        run: python -m spacy download fr_core_news_lg # installer le modèle français pour Spacy (utilisé par mon script)
        
      - name: execute py script # exécuter run.py
        run: python run.py
          
      - name: commit files
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A
          git diff-index --quiet HEAD || (git commit -a -m "logs mis à jour" --allow-empty)
          
      - name: push changes
        uses: ad-m/github-push-action@v0.6.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }} # GITHUB_TOKEN est une variable secrète générée automatiquement par GitHub Actions
          branch: main # envoyer vers la branche main
```

J'espère que vous avez trouvé ces explications sur la façon d'exécuter un script de scraping selon un horaire en utilisant GitHub Actions utiles !