# Practical 8: Foundational Data Manipulation Using Pandas

Practical 8 adds a student performance dataset, a beginner Pandas notebook, and a Student Performance Analytics section on the CampusCare home page.

The website does not run Pandas in the browser. The notebook cleans the CSV and saves a JSON file. The home page reads that JSON.

```text
data/student_performance.csv
        ↓
notebooks/practical_8_pandas.ipynb
        ↓
data/student_performance_processed.json
        ↓
static/data/student_performance_processed.json
        ↓
Student Performance Analytics on the home page
```

## Files

- `data/student_performance.csv` — raw fictional records (about 40 students), including missing values and one duplicate row
- `notebooks/practical_8_pandas.ipynb` — Pandas practical: load, inspect, clean, filter, sort, statistics, groupby, charts, and insights
- `data/student_performance_processed.json` — cleaned records and summary numbers written by the notebook
- `static/data/student_performance_processed.json` — the same JSON, served by Django as a static file
- `static/js/performance.js` — filters, summary cards, charts, and table on the home page
- `notebooks/figures/` — bar chart and scatter plot saved by the notebook

## Notebook topics

1. Import Pandas
2. Load the CSV with `pd.read_csv()`
3. `head()` and `tail()`
4. `shape`, `columns`, `dtypes`, and `info()`
5. `isnull().sum()`
6. Fill attendance, study hours, and assignments with the median; drop the row that has no final marks
7. `duplicated().sum()`
8. `drop_duplicates()`
9. Filter attendance, final marks, and study hours
10. Sort by final marks and by attendance
11. `mean()`, `median()`, `min()`, `max()`, and `std()`
12. `describe()`
13. `groupby()` with mean, count, min, and max
14. Short written insights and two Matplotlib charts

## How to run the notebook

CampusCare already uses `.venv` for Django. Install the notebook packages into that environment:

```bash
source .venv/bin/activate
pip install -r requirements-notebook.txt
jupyter notebook notebooks/practical_8_pandas.ipynb
```

If you prefer a separate environment:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-notebook.txt
jupyter notebook notebooks/practical_8_pandas.ipynb
```

Run all cells from the top. The cleaning cell explains why medians are used for some gaps and why a missing final mark is removed instead.

## How the home page uses the data

Start Django from the project folder:

```bash
source .venv/bin/activate
python manage.py runserver
```

Open http://127.0.0.1:8000/ and scroll to **Student Performance Analytics**, or use the Performance link in the navigation.

The page loads `static/data/student_performance_processed.json`. Department, minimum attendance, and minimum marks filters update the cards, both charts, and the table in the browser. No extra API is required.
