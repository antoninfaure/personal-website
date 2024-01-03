---
title: "SBB Journey Planner"
draft: false
subtitle: "Large-Scale Data Science Course (COM-490) @EPFL"
date: 2023-05-30
bigimg:
  - src: /images/project/sbb-journey-planner/preview.png
preview: /images/project/sbb-journey-planner/preview.png
tags:
  - data-science
  - hadoop
  - python
summary: "An EPFL course project using Hadoop and Python to develop a dependable public transport route planner for the Zurich area"
---

{{<link href="https://github.com/antoninfaure/sbb-journey-planner" class="btn btn-dark my-3" target="_blank" inner="GitHub">}}

## Introduction

In the Large-Scale Data Science for Real-World Data course at EPFL, our team embarked on a project to build a reliable public transport route planner. The **SBB Journey Planner** aims to offer robust journey planning options, considering the probability of on-time arrivals and departures.

### The Need for Reliability

Consider this scenario: you need to choose between two routes to reach a class reunion. One option gives you extra time upon arrival, but carries a risk of being late due to a **potential missed connection**. Traditional journey planners often recommend the fastest route, disregarding such risk factors. Our project sought to address this by offering a more balanced approach.

### The Objective

The primary goal was to develop a journey planner that computes the fastest routes within a specified **confidence tolerance**. This approach considers the likelihood of a route being feasible within the estimated travel time, thereby enhancing the **reliability** of journey planning.

## Development Journey

### Data-Driven Approach

Utilizing the SBB dataset focused around Zurich, we modeled the public transport infrastructure to create a predictive model. This model was built using Hadoop and Python, integrating historical arrival/departure time data to predict route reliability.

### Delay Prediction Model

We developed a **delay prediction model** to estimate the probability of a connection being missed. We just fitted a **gamma distribution** to the historical delay data, and used it to predict the probability of a connection being missed, depending on the time of day (splitted into morning, afternoon and evening) and the day of the week (splitted into weekdays and weekends). This model was then used to compute the probability of a route being feasible within the estimated travel time.

### Robust Route Planning Algorithm

We experimented with two algorithms: C-Scan and Djikstra's Constrained Algorithm, to compute the most reliable routes. The C-Scan algorithm was selected for its efficiency and accuracy, offering a good balance between speed and reliability. While the Djikstra's Constrained Algorithm was more accurate, it was also slower and less scalable.

### Visualization and User Interface

We developed a simple yet effective visualization using Jupyter, allowing users to interact with and understand the journey planner's suggestions. 

 ## Conclusion 

 The SBB Journey Planner was a fun project and application of data science in public transport systems. It was a great opportunity to learn about Hadoop, and to develop a data-driven approach to route planning :)

Discover more about the project on GitHub:

- [SBB Journey Planner GitHub Repository](https://github.com/antoninfaure/sbb-journey-planner)