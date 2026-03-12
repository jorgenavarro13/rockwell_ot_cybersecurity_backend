# Rockwell Automation Challenge FJ2026 Database Schema

This repository contains the **PostgreSQL database schema** for an rockwell automation gaming platform designed to analyze player performance, engagement, and potential market interest.

The system stores information about users, their roles, the games available on the platform, and each gameplay session (match). The goal is to track learning progress and gameplay analytics while maintaining a clean and normalized relational model.

---

# Project Goals

The database is designed to support:

- Tracking **users and their relationship with the company**
- Recording **game sessions and player performance**
- Analyzing **learning progress over time**
- Understanding **geographical distribution of players**
- Supporting **role-based access control**
- Providing data for **game analytics and educational effectiveness**

The platform focuses on measuring whether educational games are effective by observing improvements in gameplay metrics such as score, streaks, and accuracy.

---

# Design Decisions

## User Types
Users are classified by their **relationship with the company**, such as:

- Unknown
- Interested
- Consumer
- Worker

This classification is stored in a separate table to keep the schema normalized and allow flexible categorization.

---

## Roles System

A **role-based access control system (RBAC)** is implemented:

- `roles` defines system roles
- `user_roles` connects users with roles

This allows flexibility in assigning roles such as:

- admin
- player
- tester
- moderator

---

## Gameplay Sessions

Each gameplay session is stored in the `matches` table.

A match represents **one play session of a game by a user**, storing metrics such as:

- score
- correct answers
- power-ups used
- longest streak

The composite primary key ensures uniqueness of each gameplay session.

---

## Analytics and Learning Metrics

The system stores gameplay metrics that allow analysis of learning progression:

- **Score progression over time**
- **Accuracy improvements**
- **Streak length (racha)**
- **Session duration**

These metrics help determine whether the educational game effectively teaches its intended concepts.

---

## Country Tracking

Users are associated with a country to analyze:

- geographic distribution of players
- regions with the most engagement

The `countries` table stores the country name and an associated flag/logo.

---

## Password Security

Passwords are **not stored directly**.  
Instead, the database stores a `password_hash`.


---

## Match Identification Strategy

Matches are uniquely identified using a **composite primary key**:
