---
title: "Jarvis Chrome Extension: Your Personal Web Assistant"
draft: false
subtitle: "Enhancing Web Browsing with AI-driven Insights"
date: 2024-01-03
bigimg:
  - src: /images/post/jarvis/demo.png
preview: /images/post/jarvis/jarvis.png
tags:
  - chrome-extension
  - ai
  - llm
  - python
summary: "A Chrome extension that utilizes a Language Learning Model (LLM) to provide contextual insights during web browsing."
---

{{<link href="https://github.com/antoninfaure/jarvis-chrome-extension" class="btn btn-cyan my-3" target="_blank" inner="GitHub">}}


## Introduction

As a Chrome user and a developer, I've always been intrigued by the potential of enhancing web browsing with artificial intelligence. This curiosity led to the creation of the **Jarvis Chrome Extension**, a tool that leverages the capabilities of Language Learning Models (LLM) to offer contextual insights and answers to user queries based on the content of the currently viewed webpage.

### Background and Inspiration

The idea for Jarvis stemmed from the desire to make web browsing more interactive and informative. With the vast amount of information available online, it can be overwhelming to sift through content to find relevant answers. This is where Jarvis comes in – to provide users with quick, contextual insights without the need to leave their current webpage.

### Project Goal

The primary aim of the Jarvis Chrome Extension is to enhance the user's web browsing experience by providing tailored responses and insights. This tool aims to bridge the gap between the information available on a webpage and the user's specific queries, making web browsing more efficient and interactive.

## Development Process

### Conceptualization

The concept behind Jarvis was straightforward: integrate a Language Learning Model with a Chrome extension to analyze the context of the current webpage and provide relevant responses. The challenge was to implement this in a user-friendly and efficient manner.

### Technology Stack

For this project, I chose a combination of technologies:

- **JavaScript**: For the Chrome extension development.
- **Python**: To handle the backend processing and integration with the LLM.
- **Flask & Socket.IO**: For creating a communication bridge between the Chrome extension and the Python backend.

## Implementation Details

### Setting Up

The setup process involved several steps:

1. **Cloning the Repository**: Users can clone the Jarvis repository to get started.
2. **Installing Dependencies**: The project requires Node.js for the extension and Python for the server. Dependencies can be installed via npm and pip commands.

### Integration with LLM

Users have two options for the LLM integration:

- **LLM Studio**: Setting up a local inference server.
- **OpenAI API**: Using OpenAI's API by obtaining an API key.

### Running the Extension

To use Jarvis, users need to:

1. **Start the Flask Server**: A script is provided to start the Flask server on the user's machine.
2. **Load the Extension**: Instructions are provided to load the extension into Chrome.
3. **Using Jarvis**: Users can click on the extension icon and enter their query to get responses based on the current webpage context.

## Future Enhancements and Collaboration

### Potential Improvements

Several enhancements are possible for Jarvis, such as refining the AI responses, improving the user interface, and expanding the range of supported webpages. What can also be explored is the text-to-speech functionality, which would allow users to listen to the responses instead of reading them.

### Open to Contributions

As the project is open-source and hosted on GitHub, contributions via pull requests are welcomed. This is an opportunity for developers to contribute to an innovative project and help enhance its capabilities.

### Concluding Thoughts

The Jarvis Chrome Extension represents a step forward in integrating AI with everyday web browsing, providing users with a unique and enhanced experience. It's a testament to the power of open-source collaboration and the endless possibilities of AI in web development. 
Visit the GitHub repository to explore more:

- [GitHub Repository](https://github.com/antoninfaure/jarvis-chrome-extension)