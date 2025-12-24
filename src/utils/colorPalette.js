/**
 * Color Palette Utility
 * Provides 8 pastel colors based on the user's preferred palette
 */

export const COURSE_COLORS = [
  { name: 'Purple', value: '#7E698B' },      // Primary purple
  { name: 'Sage Green', value: '#828B85' },  // Sage green
  { name: 'Pink', value: '#E3C6CD' },       // Pink pastel
  { name: 'Lavender', value: '#9A9CAB' },   // Light gray-purple
  { name: 'Dusty Rose', value: '#D4A5B0' }, // Darker pink
  { name: 'Mauve', value: '#B8A9C9' },      // Purple-gray blend
  { name: 'Sage', value: '#A8B5A0' },       // Light sage
  { name: 'Blush', value: '#F0D4D9' },      // Light pink
];

/**
 * Get a color for a course by name or code
 * Uses a hash function to consistently assign colors
 */
export const getCourseColor = (courseName, courses = []) => {
  // First, check if the course has an assigned color
  const course = courses.find(c => c.name === courseName || c.code === courseName);
  if (course && course.color) {
    return course.color;
  }
  
  // Otherwise, assign a color based on hash
  let hash = 0;
  const str = courseName || 'default';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_COLORS.length;
  return COURSE_COLORS[index].value;
};

/**
 * Get color name from value
 */
export const getColorName = (colorValue) => {
  const color = COURSE_COLORS.find(c => c.value === colorValue);
  return color ? color.name : 'Custom';
};

