---
title: "Fine-tuning T5 for Q/A on EPFL Courses Materials"
draft: false
subtitle: "Modern Natural Language Processing (CS-552) @EPFL"
date: 2023-06-16
bigimg:
  - src: /images/project/mnlp-project/banner.png
preview: /images/project/mnlp-project/preview.png
tags:
  - ai
  - llm
  - nlp
summary: "An attempt at training a large language model for assisting students in understanding EPFL course materials."
---

{{<link href="/docs/project/mnlp-project/MNLP_final_report.pdf" class="btn btn-cyan my-3" target="_blank" inner="Report">}}

# Introduction

The project, undertaken with Delabarre Luca and Nemo Fabrice, aimed to train a large language model (LLM) for assisting students in understanding EPFL course materials. This initiative sought to provide quick, detailed answers without human interaction, thereby streamlining the educational process.

## The Challenge

Providing assistance to students often requires lengthy human interactions. The objective was to train an LLM to function as a teaching assistant, offering detailed and immediate answers to students' queries, especially for mathematical and logical problems.

# Approach and Methodology

We employed fine-tuning techniques on the T5 model, a Text-to-text Transfer Transformer known for its versatility in various tasks, including question answering. Our process involved:

1. **Supervised Fine-Tuning**: Adapting T5 to the context of EPFL undergraduate courses.
2. **Reinforcement Learning**: Enhancing the model's performance in generating high-quality responses through Proximal Policy Optimization (PPO) and N sampling methods.

## Data Utilization

For training, we used datasets containing basic math questions and answers, along with instruction-following examples. The focus was on aligning the model to provide explanatory responses to course-related queries.

## Evaluation and Results

Our evaluation involved both qualitative and quantitative methods, including similarity scores like BLEU, ROUGE, and BERTScores. The model was compared against baselines like GPT-2, GPT-4, and the original T5 model.

# Conclusion

This project represents a significant stride in applying AI for educational assistance. While challenges remain, such as the complexity of question answering and the necessity for extensive datasets, the results show promise in using LLMs for academic support.

# Future Work

Exploring models like Orca for further development and integrating Tree of Thoughts reasoning could enhance the model's problem-solving capabilities.
