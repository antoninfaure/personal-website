---
title: "MEDISCHARGE: Automated Clinical Discharge Summaries"
draft: false
subtitle: "BioNLP ACL 2024 Shared Task @EPFL NLP Lab"
date: 2024-08-20
bigimg:
  - src: /images/project/make-medischarge/preview.webp
preview: /images/project/make-medischarge/banner.webp
tags:
  - machine-learning
  - nlp
  - healthcare
  - context-extension
summary: "A project focused on automating discharge summaries from clinical electronic health records using Meditron-7B, featuring context window extension and dynamic information selection for optimal EHR summarization."
---

{{<link href="https://github.com/HAOTIAN89/MEDISCHARGE" class="btn btn-cyan my-3" target="_blank" inner="GitHub Repository">}}
{{<link href="/docs/project/make-medischarge/2024.bionlp-1.61.pdf" class="btn btn-red my-3" target="_blank" inner="ACL Paper">}}

# EPFL-MAKE at "Discharge Me!": An LLM System for Automatically Generating Discharge Summaries of Clinical Electronic Health Records

## Project Summary

This project is focused on the automation of generating discharge summaries from clinical **Electronic Health Records (EHRs)** using **Large Language Models (LLMs)**. The system, **MEDISCHARGE**, is designed to generate two main sections of a discharge summary: **Brief Hospital Course (BHC)** and **Discharge Instructions (DI)**. Built on the **Meditron-7B** model, it leverages a **context window extension** and a **dynamic information selection framework** to handle large EHRs and efficiently select the most important content when needed.

## Dataset

The dataset for this project is sourced from **MIMIC-IV**, which contains 109,168 **Emergency Department (ED)** visits. Each visit includes key information such as:
- Chief complaints
- Diagnosis codes (ICD-9/10)
- Radiology reports
- Full discharge summaries

## Task Focus

The system's main task is to **generate summaries** of a patient's hospital course and provide personalized discharge instructions based on their **EHR** data. Due to the **size limitations** of input text, a **dynamic information selection** framework was introduced, prioritizing sections based on their importance for the summary.

## Models and Baselines

Several models were tested, with **Meditron-7B** being the core of the **MEDISCHARGE** system. **RoPE (Rotary Position Embedding)** was used to extend the model's context window from 2k tokens to 6k tokens. The ability to handle longer EHRs improved the model's capabilities more than the drop due from the context extension. A **dynamic information selection** framework was also employed to optimize the selection of relevant data sections when input exceeded the context limit.

## Results

The system achieved significant improvements:
- A **183% improvement** over the baseline in **overall score**
- Achieved **fourth place** in the **BioNLP ACL’24 Shared Task** on Streamlining Discharge Documentation
- **ROUGE-1 score of 0.444**, showing the model's effectiveness in summarizing clinical data

## Future Work

Future improvements include:
- Expanding support to **multilingual environments**
- **Incorporating image-based content** in discharge summaries
- Enhancing human evaluation for better feedback integration