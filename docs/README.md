---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e23-co2060-Maathacare
Title: MaathaCare
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# MaathaCare

---
![MaathaCare Cover](./data/cover_page.jpg)
## Team
- E/23/211, A.M.G.M.Madubhashinie, [e23211@eng.pdn.ac.lk](mailto:e23211@eng.pdn.ac.lk)
- E/23/244, M.T.C.Newanma, [e23244@eng.pdn.ac.lk](mailto:e23244@eng.pdn.ac.lk)
- E/23/360, K.K.S.Semmindi, [e23360@eng.pdn.ac.lk](mailto:e23360@eng.pdn.ac.lk)
- E/23/427, A.S.Weerasinghe, [e23427@eng.pdn.ac.lk](mailto:e23427@eng.pdn.ac.lk)


<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->
![Project Thumbnail](./data/thumbnail.jpg)
<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction



**MaathaCare** is an intelligent digital maternal healthcare platform built to transform maternal care in Sri Lanka by bringing essential public health services into the digital age.

Despite Sri Lanka's strong maternal healthcare system, many critical processes—including pregnancy records, clinic schedules, and follow-up monitoring—still rely on paper-based workflows. MaathaCare modernizes this ecosystem with a secure, intelligent, and user-friendly platform that empowers **expectant mothers**, **Public Health Midwives (PHMs)**, and **healthcare professionals** to stay connected through real-time digital services.

By digitizing maternal records, automating clinic reminders, monitoring supplement adherence, and identifying high-risk pregnancies early, MaathaCare helps reduce administrative overhead while improving continuity of care. Our goal is simple: **ensure that every mother receives timely, personalized, and accessible healthcare throughout her pregnancy.**


* 📁 **Digital Health Locker:** Secure, paperless medical report and document management for mothers.

* 📅 **Smart Clinic Scheduling:** Automated appointments and automated SMS supplement reminders triggered directly by PHMs.

* 📈 **Pregnancy Milestones Timeline:** An interactive week-by-week tracker complete with baby growth details and instructional videos.

* 🌍 **Inclusivity First:** Complete multilingual translation support (English, Sinhala, Tamil) to eliminate language barriers.

* 🔔 **Smart Push & SMS Notifications:** Automated alerts for clinic appointments, daily supplement updates, and real-time medical advisories from public health staff.
* 🔔 **Symptom Tracker** User can update daily symptoms so the history is saved 

## Solution Architecture

MaathaCare follows a modern **three-tier architecture** to ensure scalability and security. The system connects pregnant mothers and healthcare professionals (midwives/doctors) through a centralized cloud-based backend.

[🔗 View System Architecture Diagram](./architecture-diagram.png)

### Key Components:
* **Frontend:** A responsive web application built using React.js for healthcare workers and a mobile-friendly interface for mothers. 
* **Backend API:** A RESTful API developed with Spring Boot 3.x to handle business logic, authentication, and data processing.
* **Database:** A PostgreSQL database via Supabase stores encrypted patient records, clinic schedules, and medical history.
* **Cloud Hosting:** The system is deployed on Railway, ensuring high availability.

## Software Designs
The Software Designs section of MaathaCare outlines the technical framework used to bridge clinical requirements with a modern, full-stack digital solution. The system follows a structured Three-Tier Architecture, utilizing Java with Spring Boot for a robust backend and React Native for a high-performance, cross-platform mobile frontend. Central to the design is the Database Schema (ER Diagram), which carefully organizes entities like mothers, midwives, and medical records in a PostgreSQL database to ensure data integrity and security. This architecture allows for seamless communication between the user’s device and the server, ensuring that sensitive pregnancy data is processed and stored according to engineering best practices.

The backend logic computes weeks and days from the Last Menstrual Period (LMP)—and the secure JWT-based authentication cycle that manages user sessions. The visual aspect of the software is governed by a User Interface (UI) Design philosophy that prioritizes accessibility and comfort, using a glassmorphic aesthetic with soft pink and purple palettes. By documenting these layers, from the high-level system architecture down to specific component interactions, the project demonstrates a disciplined software engineering process tailored for the maternal healthcare sector.

## Testing
Our QA strategy covers backend reliability and frontend usability across devices:
* **Unit Testing:** Comprehensive test suites using JUnit and Mockito for Spring Boot service layers (e.g., MotherProfileService transaction workflows).
* **API Testing:** Endpoint validation via Postman to ensure secure JWT-based access control and correct response payloads.
* **User Acceptance Testing (UAT):** Simulated workflows validating multi-role registration and real-time SMS reminder delivery triggers.

## Conclusion
MaathaCare successfully digitizes the maternal healthcare journey in Sri Lanka, reducing the risk of missed clinics and improving the tracking of high-risk pregnancies. By replacing manual paperwork with a smart digital ecosystem, we provide healthcare workers with actionable insights to save lives.

### Future Developments
**Implement a chat option** So PHMs and Mothers can directly communicate through the app.
  
## Links

- [Project Repository](https://github.com/cepdnaclk/
- [Project Page](https://cepdnaclk.github.io/
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
