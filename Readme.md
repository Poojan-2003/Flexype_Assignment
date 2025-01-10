
# Alerting System for Monitoring Failed POST Requests

## Overview
This project implements an alerting backend system that monitors and tracks failed POST requests for a specific endpoint. The system provides real-time alerts via email when a threshold for invalid requests is exceeded, stores metrics for analysis, and exposes metrics through an endpoint.

## Features
- **Monitor POST Requests:** Tracks failed requests caused by invalid headers or incorrect access tokens.
- **Alerting System:** Sends email alerts using Google's SMTP server when failed requests from a specific IP exceed a defined threshold.
- **Metrics Logging:** Logs details of failed requests, including source IP, timestamp, and reason for failure.
- **Metrics Endpoint:** Exposes an endpoint to fetch logged metrics for analysis.
- **Scalability :** Designed to handle approximately 500 requests per second efficiently.

## Tech Stack
- **Backend Language:** Node.js 
- **Framework:** Express.js 
- **Database:** MongoDB
- **Email Notifications:** Google's SMTP server

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/alerting-system.git
   cd alerting-system
   ```
2. Install dependencies:
   ```bash
   npm install express mongoose nodemailer dotenv
   ```
3. Configure environment variables:
   - Create a `.env` file in the project root.
   - Add the following variables:
     ```
     PORT=3000
     MONGO_URI=<your_mongodb_connection_string>
     SMTP_USER=<your_email_address>
     SMTP_PASS=<your_email_password>
     ALERT_THRESHOLD=No of max failed request you want to allow from same IP
     TIME_WINDOW=Duration to send email if no of request exceeds alert threshold
     ```

## Usage
1. Start the server:
   ```bash
   npm start
   ```
2. POST requests monitoring is available at:
   ```
   POST /api/submit
   ```
3. Fetch metrics:
   ```
   GET /api/metrics
   ```

## Key Components
- **Request Monitoring:** Middleware validates incoming requests to `/api/submit` and logs failures.
- **Alerting:** Triggers email alerts when the number of failed attempts from the same IP exceeds the threshold.
- **Metrics Storage:** Failed requests are logged with IP, timestamp, and failure reason in MongoDB.
