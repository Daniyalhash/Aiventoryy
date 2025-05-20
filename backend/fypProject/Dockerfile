# Step 1: Use official Python 3.12 base image
FROM python:3.12-slim

# Step 2: Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Step 3: Set working directory
WORKDIR /app

# Step 4: Copy requirements file
COPY requirements.txt .

# Step 5: Upgrade pip and install dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Step 6: Copy the full project to the container
COPY . .

# Step 7: Collect static files (uncomment in production)
# RUN python manage.py collectstatic --noinput

# Step 8: Expose the port Django will run on
EXPOSE 8000

# Step 9: Run migrations (optional)
# RUN python manage.py migrate

# Step 10: Create superuser (optional)
# RUN echo "from django.contrib.auth import get_user_model; \
# User = get_user_model(); \
# User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')" | python manage.py shell

# Step 11: Healthcheck (optional)
# HEALTHCHECK CMD curl --fail http://localhost:8000/ || exit 1

# Step 12: Start Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
