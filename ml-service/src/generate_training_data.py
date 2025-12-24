#!/usr/bin/env python3
"""
Generate large synthetic training dataset for ML models
Creates realistic assignments, courses, and study sessions
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Course templates
COURSES = [
    {"name": "Calculus I", "code": "MATH 201", "instructor": "Dr. Smith", "credits": "4"},
    {"name": "Physics I", "code": "PHYS 150", "instructor": "Dr. Johnson", "credits": "3"},
    {"name": "Introduction to Computer Science", "code": "CS 101", "instructor": "Dr. Williams", "credits": "4"},
    {"name": "Organic Chemistry", "code": "CHEM 301", "instructor": "Dr. Brown", "credits": "4"},
    {"name": "English Literature", "code": "ENG 201", "instructor": "Dr. Davis", "credits": "3"},
    {"name": "Statistics", "code": "STAT 250", "instructor": "Dr. Miller", "credits": "3"},
    {"name": "Biology", "code": "BIO 101", "instructor": "Dr. Wilson", "credits": "4"},
    {"name": "History of Art", "code": "ART 150", "instructor": "Dr. Moore", "credits": "3"},
    {"name": "Linear Algebra", "code": "MATH 301", "instructor": "Dr. Taylor", "credits": "4"},
    {"name": "Data Structures", "code": "CS 201", "instructor": "Dr. Anderson", "credits": "4"},
]

# Assignment types and their base hours
ASSIGNMENT_TYPES = {
    "homework": {"base_hours": 2.0, "weight": 0.4},
    "project": {"base_hours": 8.0, "weight": 0.2},
    "exam": {"base_hours": 5.0, "weight": 0.2},
    "lab_report": {"base_hours": 3.0, "weight": 0.1},
    "essay": {"base_hours": 4.0, "weight": 0.05},
    "quiz": {"base_hours": 1.0, "weight": 0.05},
}

# Assignment title templates
ASSIGNMENT_TITLES = {
    "homework": [
        "{course} Homework Chapter {num}",
        "{course} Problem Set {num}",
        "{course} Assignment {num}",
        "{course} Practice Problems {num}",
    ],
    "project": [
        "{course} Final Project",
        "{course} Term Project",
        "{course} Programming Project",
        "{course} Research Project",
    ],
    "exam": [
        "{course} Midterm Exam",
        "{course} Final Exam",
        "{course} Test {num}",
        "{course} Quiz {num}",
    ],
    "lab_report": [
        "{course} Lab Report {num}",
        "{course} Lab {num} Write-up",
        "{course} Experiment Report",
    ],
    "essay": [
        "{course} Essay Assignment",
        "{course} Paper {num}",
        "{course} Writing Assignment",
    ],
    "quiz": [
        "{course} Quiz {num}",
        "{course} Pop Quiz",
        "{course} Quick Check",
    ],
}

# Priority distribution
PRIORITIES = ["low", "medium", "high"]
PRIORITY_WEIGHTS = [0.2, 0.5, 0.3]

# Days of week for courses
WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"]
WEEKEND = ["saturday", "sunday"]

# Study session time preferences (hour of day)
STUDY_HOURS = {
    "morning": list(range(8, 12)),    # 8am-11am
    "afternoon": list(range(12, 17)),  # 12pm-4pm
    "evening": list(range(17, 22)),    # 5pm-9pm
}


def generate_courses(num_courses=10):
    """Generate course data"""
    courses = []
    selected_courses = random.sample(COURSES, min(num_courses, len(COURSES)))
    
    for i, course_template in enumerate(selected_courses):
        # Random days (2-4 days per week)
        num_days = random.randint(2, 4)
        days = random.sample(WEEKDAYS, num_days)
        
        # Random time slot
        start_hour = random.choice([8, 9, 10, 11, 12, 13, 14, 15])
        start_time = datetime(2024, 1, 15, start_hour, 0)
        end_time = start_time + timedelta(hours=1, minutes=30)
        
        course = {
            "id": str(i + 1),
            "name": course_template["name"],
            "code": course_template["code"],
            "instructor": course_template["instructor"],
            "credits": course_template["credits"],
            "days": days,
            "startTime": start_time.isoformat() + "Z",
            "endTime": end_time.isoformat() + "Z",
            "location": f"Room {random.randint(100, 500)}"
        }
        courses.append(course)
    
    return courses


def generate_assignments(courses, num_assignments=150):
    """Generate assignment data with realistic patterns"""
    assignments = []
    base_date = datetime(2024, 1, 15)
    
    # Track assignment counts per course
    course_counts = {course["code"]: 0 for course in courses}
    
    for i in range(num_assignments):
        # Select course
        course = random.choice(courses)
        course_code = course["code"]
        course_counts[course_code] += 1
        
        # Select assignment type based on weights
        assignment_type = random.choices(
            list(ASSIGNMENT_TYPES.keys()),
            weights=[ASSIGNMENT_TYPES[t]["weight"] for t in ASSIGNMENT_TYPES.keys()],
            k=1
        )[0]
        
        # Generate title
        title_template = random.choice(ASSIGNMENT_TITLES[assignment_type])
        title = title_template.format(
            course=course_code,
            num=course_counts[course_code]
        )
        
        # Due date: 1-30 days from base date
        days_until_due = random.randint(1, 30)
        due_date = base_date + timedelta(days=days_until_due)
        
        # Created date: 0-14 days before due date
        days_before = random.randint(0, min(14, days_until_due))
        created_date = due_date - timedelta(days=days_before)
        
        # Priority: higher priority for exams and projects, closer due dates
        if assignment_type in ["exam", "project"]:
            priority = random.choices(["medium", "high"], weights=[0.3, 0.7])[0]
        elif days_until_due <= 3:
            priority = random.choices(["medium", "high"], weights=[0.4, 0.6])[0]
        else:
            priority = random.choices(PRIORITIES, weights=PRIORITY_WEIGHTS)[0]
        
        # Description (sometimes present)
        descriptions = [
            f"Complete problems 1-{random.randint(10, 30)}",
            f"Read chapters {random.randint(1, 5)}-{random.randint(6, 10)}",
            f"Lab on {random.choice(['thermodynamics', 'optics', 'mechanics', 'waves'])}",
            f"Write a {random.randint(3, 10)} page paper",
            f"Build a {random.choice(['web app', 'mobile app', 'desktop app'])}",
            None,  # Sometimes no description
        ]
        description = random.choice(descriptions)
        
        assignment = {
            "id": str(i + 1),
            "title": title,
            "course": course_code,
            "dueDate": due_date.isoformat() + "Z",
            "priority": priority,
            "description": description,
            "createdAt": created_date.isoformat() + "Z"
        }
        assignments.append(assignment)
    
    return assignments


def estimate_study_hours(assignment):
    """Estimate realistic study hours based on assignment characteristics"""
    assignment_type = None
    title_lower = assignment["title"].lower()
    for atype in ASSIGNMENT_TYPES.keys():
        if atype in title_lower or (atype == "homework" and "homework" in title_lower):
            assignment_type = atype
            break
    
    if not assignment_type:
        # Try to infer from title keywords
        if "project" in title_lower:
            assignment_type = "project"
        elif "exam" in title_lower or "test" in title_lower or "quiz" in title_lower:
            assignment_type = "exam"
        elif "lab" in title_lower:
            assignment_type = "lab_report"
        elif "essay" in title_lower or "paper" in title_lower:
            assignment_type = "essay"
        else:
            assignment_type = "homework"  # default
    
    base_hours = ASSIGNMENT_TYPES[assignment_type]["base_hours"]
    
    # Adjust for priority
    priority_mult = {"low": 0.8, "medium": 1.0, "high": 1.2}[assignment["priority"]]
    
    # Adjust for days until due (more time = more complex work)
    due_date = datetime.fromisoformat(assignment["dueDate"].replace("Z", "+00:00"))
    created_date = datetime.fromisoformat(assignment["createdAt"].replace("Z", "+00:00"))
    days_until_due = (due_date - created_date).days
    
    if days_until_due > 14:
        time_mult = 1.3  # More time = bigger project
    elif days_until_due < 3:
        time_mult = 0.7  # Less time = simpler task
    else:
        time_mult = 1.0
    
    # Add some randomness
    hours = base_hours * priority_mult * time_mult * random.uniform(0.8, 1.2)
    
    return max(0.5, round(hours, 1))


def generate_study_sessions(assignments, courses):
    """Generate realistic study sessions for assignments"""
    study_sessions = []
    session_id = 1
    
    # Group assignments by course
    assignments_by_course = {}
    for assignment in assignments:
        course_code = assignment["course"]
        if course_code not in assignments_by_course:
            assignments_by_course[course_code] = []
        assignments_by_course[course_code].append(assignment)
    
    for course_code, course_assignments in assignments_by_course.items():
        # Find course info
        course = next((c for c in courses if c["code"] == course_code), None)
        if not course:
            continue
        
        for assignment in course_assignments:
            # Estimate total hours needed
            total_hours = estimate_study_hours(assignment)
            
            # Split into 1-4 sessions (more hours = more sessions)
            if total_hours <= 2:
                num_sessions = 1
            elif total_hours <= 5:
                num_sessions = random.randint(1, 2)
            elif total_hours <= 10:
                num_sessions = random.randint(2, 3)
            else:
                num_sessions = random.randint(3, 4)
            
            hours_per_session = total_hours / num_sessions
            
            # Due date (make timezone-aware)
            due_date_str = assignment["dueDate"]
            if due_date_str.endswith("Z"):
                due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
            else:
                due_date = datetime.fromisoformat(due_date_str)
                # Make timezone-aware
                from datetime import timezone
                due_date = due_date.replace(tzinfo=timezone.utc)
            
            # Generate sessions spread before due date
            now = datetime.now(due_date.tzinfo) if due_date.tzinfo else datetime.now()
            total_days_available = max(1, (due_date - now).days)
            
            for session_num in range(num_sessions):
                # Session date: spread over days before due (more sessions = spread more)
                # Earlier sessions should be closer to due date
                min_days = max(0, (num_sessions - session_num - 1) * 2)
                max_days = max(min_days + 1, total_days_available - session_num)
                
                if min_days >= max_days:
                    days_before = min_days
                else:
                    days_before = random.randint(min_days, max_days)
                
                session_date = due_date - timedelta(days=days_before)
                
                # Avoid weekends for some sessions (70% chance)
                if random.random() < 0.7 and session_date.weekday() >= 5:
                    session_date = session_date - timedelta(days=2)  # Move to Friday
                
                # Choose time of day (preference based on course time if available)
                if course and course.get("startTime"):
                    course_hour = datetime.fromisoformat(course["startTime"].replace("Z", "+00:00")).hour
                    if course_hour < 12:
                        preferred_times = STUDY_HOURS["afternoon"] + STUDY_HOURS["evening"]
                    else:
                        preferred_times = STUDY_HOURS["morning"] + STUDY_HOURS["evening"]
                else:
                    # Random preference
                    time_pref = random.choice(["morning", "afternoon", "evening"])
                    preferred_times = STUDY_HOURS[time_pref]
                
                start_hour = random.choice(preferred_times)
                start_time = session_date.replace(hour=start_hour, minute=random.choice([0, 15, 30, 45]))
                
                # Duration: 1-4 hours, rounded to 15 min intervals
                duration_hours = max(1, min(4, hours_per_session * random.uniform(0.8, 1.2)))
                duration_minutes = int(duration_hours * 60)
                duration_minutes = (duration_minutes // 15) * 15  # Round to 15 min
                
                end_time = start_time + timedelta(minutes=duration_minutes)
                
                # Topic
                topics = [
                    f"{assignment['title']} - Part {session_num + 1}",
                    f"Review for {assignment['title']}",
                    f"Work on {assignment['title']}",
                    assignment['title'],
                ]
                
                # Format times as ISO with Z suffix (UTC) - remove timezone if present
                start_time_iso = start_time.replace(tzinfo=None).isoformat() + "Z"
                end_time_iso = end_time.replace(tzinfo=None).isoformat() + "Z"
                
                session = {
                    "id": str(session_id),
                    "assignmentTitle": assignment["title"],
                    "course": course_code,
                    "date": session_date.strftime("%Y-%m-%d"),
                    "startTime": start_time_iso,
                    "endTime": end_time_iso,
                    "duration": duration_minutes,
                    "topic": random.choice(topics)
                }
                study_sessions.append(session)
                session_id += 1
    
    return study_sessions


def generate_dataset(num_courses=10, num_assignments=150, output_path="data/training_data.json"):
    """Generate complete training dataset"""
    print(f"Generating dataset with {num_courses} courses and {num_assignments} assignments...")
    
    # Generate courses
    courses = generate_courses(num_courses)
    print(f"✅ Generated {len(courses)} courses")
    
    # Generate assignments
    assignments = generate_assignments(courses, num_assignments)
    print(f"✅ Generated {len(assignments)} assignments")
    
    # Generate study sessions
    study_sessions = generate_study_sessions(assignments, courses)
    print(f"✅ Generated {len(study_sessions)} study sessions")
    
    # Create dataset
    dataset = {
        "exportDate": datetime.now().isoformat() + "Z",
        "version": "1.0",
        "assignments": assignments,
        "courses": courses,
        "studySessions": study_sessions,
        "metadata": {
            "totalAssignments": len(assignments),
            "totalCourses": len(courses),
            "totalStudySessions": len(study_sessions),
            "generated": True
        }
    }
    
    # Save to file
    output_file = Path(__file__).parent.parent / output_path
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"✅ Dataset saved to {output_file}")
    print(f"\n📊 Dataset Summary:")
    print(f"   Courses: {len(courses)}")
    print(f"   Assignments: {len(assignments)}")
    print(f"   Study Sessions: {len(study_sessions)}")
    print(f"   File size: {output_file.stat().st_size / 1024:.1f} KB")
    
    return dataset


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate synthetic training data")
    parser.add_argument("--courses", type=int, default=10, help="Number of courses")
    parser.add_argument("--assignments", type=int, default=150, help="Number of assignments")
    parser.add_argument("--output", type=str, default="data/training_data.json", help="Output file path")
    
    args = parser.parse_args()
    
    generate_dataset(
        num_courses=args.courses,
        num_assignments=args.assignments,
        output_path=args.output
    )

