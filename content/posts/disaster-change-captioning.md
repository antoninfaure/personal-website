---
title: "Disaster Change Captioning"
draft: false
subtitle: "Semester Project @EPFL NLP Lab"
date: 2024-08-17
cover:
  image: images/project/disaster-change-captioning/disaster.png
tags: ["machine-learning", "multimodal", "remote-sensing"]
categories: ["project"]
description: "Detect disaster-driven changes in satellite images using multispectral data and geographic context."
---

[Report](/docs/project/disaster-change-captioning/PDS_Disaster_Change_Captioning.pdf)
[Website](https://smontariol.github.io/Disaster_change_captioning/)

## Project Summary

This project revolves around the task of **disaster change detection** using remote sensing imagery, particularly from satellite sources. The objective is to create a comprehensive dataset and develop models to detect and analyze changes between **pre-** and **post-disaster images**. The dataset includes over **60 disaster events**, along with pixel-level annotations of disaster-specific changes.

## Dataset

The dataset combines **multispectral aerial images** from **Sentinel-2**, enriched with auxiliary data such as **terrain data** from **OpenStreetMap (OSM)**, **land cover information** from **ESA WorldCover**, and **textual reports** from **ReliefWeb**. The dataset includes high-resolution images with 12 spectral bands, and detailed **annotations** of disaster impacts were manually added using the **CVAT annotation tool**.

### Data Sources:
- **Sentinel-2 imagery**: 10-meter resolution for RGB bands and up to 60 meters for other spectral bands.
- **OpenStreetMap**: For contextual geographic information.
- **ESA WorldCover**: Provides land cover maps for understanding pre- and post-disaster conditions.
- **ReliefWeb**: Disaster-specific textual reports to add context.

### Data Processing:
- **Cloud filtering**: Only images with less than 10% cloud cover were selected.
- **Temporal window**: Images were captured within a 90-day window around the disaster date.
- **Spatial extent**: 30x30 km² areas centered around the disaster.

## Task Focus

The primary task is **change detection**, identifying changes in images caused by natural disasters. The dataset is divided into three visibility-based categories:
1. **Visible**: Clearly visible disaster changes.
2. **Tiny-visible**: Small area changes.
3. **Not visible**: Changes not visible in satellite imagery but known through external sources.

## Models and Baselines

Several **change detection models** were tested on this dataset, including:

1. **FC-EF**: A single-stream fully convolutional network that merges pre- and post-disaster images.
2. **FC-Siam-Diff**: A dual-stream network with a difference operation on extracted features.
3. **FC-Siam-Conc**: A dual-stream network that concatenates extracted features from pre- and post-images.
4. **BIT**: A transformer-based model.
5. **TinyCD**: EfficientNet-based model designed for small-area change detection.

Training involved a small, annotated dataset split into **training**, **validation**, and **test sets**. Models were trained for **20 epochs** with a batch size of **1** using **Adam optimizer**. The evaluation used metrics such as **precision**, **recall**, **F1 score**, **IoU**, and **Overall Accuracy**.

## Results

- The **FC-EF** model showed the best overall performance on early generalization.
- **TinyCD** and **BIT** models struggled with training efficiency and generalization.
- Visual examples of detected changes across different models demonstrated varying success rates.

## Future Work

The next steps for this project include:
- **Expanding the dataset**: More disaster types and annotated samples.
- **Leveraging full Sentinel-2 spectral data**: Utilize all 12 spectral bands for better analysis.
- **Integrating new tasks**: Add tasks such as **visual question answering (VQA)** to explore the full potential of the multimodal dataset.
- **Model refinement**: Explore new architectures and training approaches to improve change detection performance.
