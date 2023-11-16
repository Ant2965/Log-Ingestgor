# Log Ingestor and Query Interface

## Overview

This project is a log ingestor system with a query interface that allows efficient handling of vast volumes of log data. It provides a simple interface for querying data using full-text search and specific field filters.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Advanced Features (Bonus)](#advanced-features-bonus)
- [Sample Queries](#sample-queries)
- [Evaluation Criteria](#evaluation-criteria)
- [Submission](#submission)
- [Tips](#tips)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/CoHarsh/log-ingestor.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd log-ingestor
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

## Usage

### Log Ingestor

1. **Run the log ingestor server:**

    ```bash
    node log_ingestor.js
    ```

   - The log ingestor runs on port 3000 by default.

2. **Use the provided script to populate logs into the system:**

    ```bash
    curl -X POST -H "Content-Type: application/json" -d @logs.json http://localhost:3000
    ```

### Query Interface

1. **Run the query interface:**

    ```bash
    node query_interface.js
    ```
    CLI interface
   <!-- - The query interface is accessible at [http://localhost:3001](http://localhost:3001). -->

<!-- 2. **Open the interface in a web browser or use the CLI for full-text search and filtering.** -->

## Features

### Log Ingestor

- Ingest logs in the provided format.
- Scalability to handle high volumes of logs efficiently.
- Mitigation of potential bottlenecks such as I/O operations and database write speeds.
- Log ingestion via an HTTP server on port 3000 by default.

