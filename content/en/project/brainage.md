---
title: "Predict Biological Age from Brain Anatomical Volume Measurements using Subgrouping Models"
draft: false
subtitle: "Machine Learning (CS-433) @EPFL"
date: 2022-12-22
bigimg:
  - src: /images/project/brainage/preview.png
preview: /images/project/brainage/preview.png
tags:
  - machine-learning
  - data-analysis
  - python
summary: "Exploring the impact of cluster subgrouping models on biological age prediction using brain anatomical volume measurements."
---

{{<link href="https://github.com/CS-433/project2_brainAge" class="btn btn-cyan my-3" target="_blank" inner="GitHub Repository">}}
{{<link href="/docs/project/brainage/Report_Project2_BrainAge.pdf" class="btn btn-red my-3" target="_blank" inner="Report">}}

# Introduction

As data scientists and researchers, we are constantly seeking ways to push the boundaries of accuracy and efficiency in various domains. In the field of medical image processing, the accuracy of age prediction based on anatomical features can have significant implications for diagnosing and understanding age-related conditions. In this project, we embarked on a journey to optimize biological age prediction from brain anatomical volume measurements. Our goal was to determine whether splitting patients into subgroups and developing prediction models for each subgroup could improve the accuracy of age prediction compared to a global prediction model.

# Project Objective

The primary objective of this project was two-fold. First, we aimed to reduce the dimensionality of our features, selecting only the most relevant ones, and then testing several machine learning models to predict age based on brain anatomical measurements. Second, we explored the concept of subgrouping patients by clustering the data points. For each subgroup, we trained and tested prediction models individually. Our hypothesis was that subgrouping and tailoring models to each cluster could lead to more precise age predictions.

# Data and Methodology

We were provided with two datasets containing volumetric measurements of brain areas, along with information about the patients' ages and genders. The datasets, although valuable, posed challenges due to their relatively small sizes. When dividing the data into smaller subsets for subgroup analysis, overfitting became a concern.

Moreover, the age range of the patients in our datasets was limited, spanning from 49 to 85 years old. This constraint introduced bias into our results as we lacked a baseline for quantifying age-related anatomical features. In future work, acquiring data from a wider age range, including younger patients, could contribute to more accurate predictions.

To address the challenges, we evaluated multiple machine learning models and explored the impact of subgrouping the patients. The datasets' limitations, including their small sizes and potential variations in data acquisition parameters, were acknowledged and considered throughout our analysis.

# Subgrouping and Age Prediction

The results of our project offered intriguing insights into the accuracy of age prediction. Although the differences in accuracy were not substantial, subgrouping the patients and developing models tailored to each cluster yielded slightly more accurate age predictions compared to models trained on the entire dataset.

The practice of clustering patients and personalizing prediction models for each cluster showcased promise. While the improvement in accuracy was incremental, it hinted at the potential benefits of considering patient subgroups in age prediction tasks.

# Future Directions

As we conclude this project, we recognize the need for further improvements and considerations. To enhance the accuracy and robustness of age prediction models, future work should address the following aspects:

1. **Dataset Size**: Efforts should be made to increase the size of the datasets while maintaining consistent data acquisition parameters. Combining datasets acquired with different scanners can introduce variations that may affect model performance.

2. **Age Range**: Acquiring data from patients spanning a wider age range, including younger individuals, can provide a more comprehensive understanding of age-related anatomical features and improve model accuracy.

3. **Multiple Samples**: Collecting multiple samples from the same patient at different ages could facilitate the development of aging patterns within subgroups, potentially enhancing the precision of subgroup models.

4. **Overfitting Mitigation**: Careful consideration and techniques to mitigate overfitting should be applied, especially when working with small datasets and subgroup analysis.

5. **Clinical Applications**: Exploring clinical applications and real-world implementations of improved age prediction models can lead to practical benefits in healthcare and research.

In conclusion, our project in optimizing biological age prediction using brain anatomical volume measurements provided valuable insights into the potential advantages of subgrouping patients. While challenges exist, the pursuit of accuracy and understanding in medical image processing continues to drive innovation and progress in the field.

As we look ahead, we remain open to feedback, suggestions, and collaborations to further advance the capabilities of age prediction models in the realm of medical image processing.

For more details, you can explore our GitHub repository: [GitHub Repository](https://github.com/CS-433/project2_brainAge).