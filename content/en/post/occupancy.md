---
title: "Occupancy FLEP"
draft: false
subtitle: "Enhancing Room Occupancy Information @EPFL"
date: 2023-12-27
bigimg:
  - src: /images/post/occupancy/room.png
preview: /images/post/occupancy/room.png
tags:
  - python
  - scraping
  - flask
  - react
summary: "A web application to enhance the room occupancy information at EPFL."
---

{{<link href="https://github.com/antoninfaure/occupancy-epfl" class="btn btn-dark my-3" target="_blank" inner="GitHub Backend">}}
{{<link href="https://github.com/antoninfaure/occupancy-front" class="btn btn-dark my-3" target="_blank" inner="GitHub Frontend">}}
{{<link href="https://occupancy.flep.ch" class="btn btn-red my-3" target="_blank" inner="occupancy.flep.ch">}}

## Introduction

As a master's student in Data Science at EPFL, Lausanne, I often found myself in a common predicament faced by many of my peers: **the search for a quiet, unoccupied room for studying** or group discussions. This task, seemingly simple, was surprisingly challenging due to the lack of accessible and comprehensive information about room availability on campus.

### Context and Motivation

EPFL, like many sprawling university campuses, hosts a plethora of rooms and halls, each with its own schedule of classes, events, and activities. Amidst this busy timetable, finding a free room can feel like searching for a needle in a haystack. The university did have a solution in place, [occupancy.epfl.ch](https://occupancy.epfl.ch), but it fell short in several aspects. First, it didn’t cover **all** the rooms available on campus, leaving many potential study spaces unlisted. Additionally, the user interface was not particularly **user-friendly**, making it difficult to quickly find information.

This inconvenience sparked a thought: What if there was a better way? A more efficient, comprehensive tool that could make this search easier for everyone on campus? This idea became the seed for my project, **occupancy.flep.ch**.

### Project Objective

The primary goal of developing **occupancy.flep.ch** was twofold. First, to provide a comprehensive listing of **all available rooms** on the EPFL campus, including those not covered by the existing system. Second, to create a user interface that was **intuitive, fast, and responsive**, catering to the needs of students who are often on the go and in immediate need of information.

With this vision in mind, I embarked on a journey to bridge this gap, leveraging my skills in data science and web development. The project was not just about building a web application; it was about enhancing the campus experience for my fellow students and contributing to the EPFL community.

In the following sections, I’ll delve into the steps I took to turn this idea into reality, from scraping course schedules to designing a user-friendly interface, and the challenges I faced along the way.



## Planning the Solution

### Conceptualization

The idea for occupancy.flep.ch was born out of observations and conversations. The core concept was simple: create a platform that provides real-time information on available rooms across the entire EPFL campus, presented in a clear and accessible manner. This tool would not only save time but also reduce the stress associated with finding study spaces, especially during peak hours and exam periods.

![occupancy.flep.ch](/images/post/occupancy/homepage.png)

### Technology Stack

The next step was to decide on the technology stack. I chose to use **Python** for the backend and **React** for the frontend. I also used **Flask** to create a REST API to communicate between the two. The choice of Python was obvious, given its popularity in the data science community and my familiarity with the language. I chose React for the frontend because of its ease of use and the availability of several useful libraries, and also I just wanted to learn more about it ;)

## Implementing the Backend: Flask

### Scraping the Data

The first step was to collect accurate and up-to-date data on room occupancy. This task required scraping the course schedules from [edu.epfl.ch](https://edu.epfl.ch), the official EPFL course directory with information on all courses offered at the university (including their timetables). The complexity here was not just in the scraping itself, but in dealing with the intricacies of a website not originally designed for easy data extraction. For example some courses had multiple schedules, some had schedules that were not yet available, and some even had no schedules or in a format hardcoded in text without any structure (#ecoledoctorale). 

Python, with its powerful libraries like BeautifulSoup and Requests, was instrumental in this process. I developed scripts that could periodically fetch data from the website, parse the HTML content, and extract relevant information about course schedules and room occupancies.

### Database Creation

With the data scraped, the next step was storing it in a structured and accessible manner. For this, I created a database that could efficiently store and manage the room occupancy information. The database schema was designed to be simple yet effective, with entities for rooms, schedules, and any other relevant details.

I used MongoDB as the database, as it was easy to set up and use and also _free_ with the MongoDB Atlas free tier service. I also used the PyMongo library to interact with the database from Python. The database was hosted on the cloud, allowing for easy access from anywhere.

### REST API

The final step in the backend development was to create a REST API to communicate between the backend and frontend. I used Flask to create the API, as it was simple to use and well-documented. The API was designed to be flexible and scalable, allowing for easy integration of new features and functionalities.


### Deployment

Deployment was another critical aspect of the project. I used **Heroku** for hosting the application, as it offers a straightforward and efficient way to deploy Flask applications, and also it was free with my Education plan ;). The Procfile was set up to define the web server and the necessary commands to run the application on Heroku.

## Implementing the Frontend: React

### Designing the Interface

For the frontend I chose React in conjunction with Material UI to ensure a sleek, modern, and user-friendly interface. Material UI provided a suite of ready-to-use components that adhered to Material Design principles, allowing for a consistent and intuitive user experience.

The frontend was designed to be responsive, with a clean and minimalistic layout. The user interface was divided into 4 main sections: the **home page**, the **rooms**, the **courses**, and the **studyplans**.

- The **home page** provided a brief introduction to the application with a schedule to fill by drag-and-select to query the rooms available for the selected time period.
- The **rooms page** listed all the rooms available on campus, with information on their occupancy status and schedules.
- The **courses page** listed all the courses offered at EPFL, with information on their schedules and the rooms they were held in.
- The **studyplans page** listed all the studyplans offered at EPFL, with information on the courses they contained and the rooms they were held in.

### Frontend-Backend Communication

Integrating the React frontend with the Flask backend was streamlined thanks to the asynchronous capabilities of React. API calls were made to the Flask backend to fetch the latest room availability data, which was then dynamically rendered in the React components.

Material UI's components enhanced this process, providing visually appealing loading indicators and smooth transitions that kept the user informed during data retrieval. This approach ensured that the application was not only functional but also engaging and responsive to user interactions.

### Deployment

As I'm always looking for the cheapest way to host my projects, I decided to host the frontend on GitHub Pages. This was a bit tricky as GitHub Pages only supports static websites, so I had to build the React app and then push the build folder to GitHub. For this I used the gh-pages package, which automates the process of deploying the React app to GitHub Pages but I could have also used a simple GitHub Actions workflow to do the same thing.


## Future Work

Looking ahead, there are several ways in which occupancy.flep.ch can be improved and expanded. For example the scraping process can be optimized to ensure that the data is always up-to-date and runs every week or so.

- **Meeting reservations availability**: For now the application only shows the courses occupying the rooms but it would be nice to also show the reservations made by meetings or events to have a more accurate view of rooms occupancy.

- **Geolocalisation**: It would be nice to have a map with all the rooms and the possibility to filter them by building or the possibility to see the closest rooms to your current location. I have to give credit to [Simon](https://github.com/Androz2091) for this idea and his current implementation of it on [Less Walk, More Work](https://lm.polysource.ch) which use my API to get the closest rooms available in the next 3 hours to your current location. 

- **Pin rooms**: It would be nice to have the possibility to pin rooms to have a quick access to them on the home page. But this would require to have a user system which is not the case for now.

The dream goal would be to simply integrate this application into the official EPFL application to have direct access to the room occupancy information. (we'll see about that) :D

### Final Thoughts

[occupancy.flep.ch](https://occcupancy.flep.ch) was a fun project to work on and a great opportunity to learn new skills. I hope that it'll be useful to at least some people :D
As always I'm open to any feedback and suggestions or even contributions to the project so don't hesitate to open a pull request on one of the GitHub repositories :
- [Backend](https://github.com/antoninfaure/occupancy-epfl)
- [Frontend](https://github.com/antoninfaure/occupancy-front)

