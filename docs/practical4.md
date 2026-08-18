# Practical 4: Student Wellness Data Visualization

Practical 4 adds a realistic student wellness dataset and a Jupyter Notebook for data visualization using Pandas and Matplotlib.

## Files added

- `data/student_wellness.csv`: 40 realistic student records with study, sleep, stress, mood, screen time, and exercise fields.
- `analytics/student_wellness_analytics.ipynb`: notebook that loads the CSV and creates all required visualizations.
- `analytics/screenshots/`: generated chart images when the notebook is executed.

## Visualizations covered

- Bar Chart: average stress by study-hour group
- Line Chart: mood score trend across student records
- Scatter Plot: sleep hours vs stress level
- Histogram: screen time distribution
- Pie Chart: student wellness support categories

## Dataset fields

- `Student_ID`
- `Study_Hours`
- `Sleep_Hours`
- `Stress_Level`
- `Mood_Score`
- `Screen_Time`
- `Exercise_Hours`

## How to run

Open `analytics/student_wellness_analytics.ipynb` in Jupyter Notebook or JupyterLab, then run all cells. The notebook saves chart screenshots into `analytics/screenshots/`.
