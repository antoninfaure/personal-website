---
title: "Higgs Boson ML Challenge"
draft: false
subtitle: "Machine Learning (CS-433) @EPFL"
date: 2022-10-31
bigimg:
  - src: /images/project/ml-higgs/banner.png
preview: /images/project/ml-higgs/preview.png
tags: ["machine-learning", "data-analysis", "python"]
categories: ["project"]
description: "An exploration of machine learning techniques for identifying Higgs boson generation events in CERN particle accelerator data."
---

[GitHub Repository](https://github.com/antoninfaure/ML-higgs)
[Report](/docs/project/ml-higgs/Report_Project1.pdf)

## Introduction

The project, conducted with [Manon Dorster](https://github.com/mdorster) and [Alexandre Maillard](https://github.com/AlexMlld), aimed to apply machine learning techniques to CERN particle accelerator data to identify Higgs boson events among multiple proton collisions. This project was part of the Machine Learning course (CS-433) at EPFL.

### Objective

The Higgs boson Challenge can be found on the [AIcrowd platform](https://www.aicrowd.com/challenges/epfl-machine-learning-project-1).
The project's objective was to develop a model that could distinguish between signal (Higgs boson generation) and background events from collision data.

## Data Analysis and Feature Engineering

The data we were provided with for this project consisted in:
- A ***training*** set of **250 000 collision events** with 30
features and a label column (-1 or 1). The label -1
corresponds to a background event and the label 1
stands for a signal event.
- A ***test*** set of **568 238 collision events**, organized in the same
manner as the training set except for the empty label
column. Our work consisted in accurately predicting
the labels for the test set.


### Data Cleaning and Standardization

We addressed data inconsistencies by replacing meaningless values and standardizing datasets. This process involved adjusting feature vectors and handling features with significant proportions of undefined values.

### Data Split Method

An insightful approach was to split the training set based on a specific feature highly correlated with undefined values. This resulted in more focused and cleaner subsets for model training.

## Model Prediction

### Exploration of Various Models

We explored multiple models, including ridge regression and logistic regression, fine-tuned with polynomial feature expansion. Through iterative optimization, we aimed to enhance the model's predictive accuracy.

### Results

Our experimentation led to several insights and the development of an optimized model. The logistic regression model with degree 2 polynomial feature expansion and strategic data splitting showed the highest accuracy with a training accuracy of **82.7%** and a test accuracy of **82.5%**. Note that the test accuracy is close to the training accuracy, indicating that the model is not overfitting.

## Conclusion

This project successfully demonstrated the application of machine learning in a complex and high-stakes field like particle physics. Our efforts culminated in a model that significantly improves the identification of Higgs boson events, showcasing the potential of machine learning in scientific research.

Explore the project on GitHub:

- [Higgs Boson ML Challenge GitHub Repository](https://github.com/antoninfaure/ML-higgs)