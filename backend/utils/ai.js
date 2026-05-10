function calculatePriority(issue) {
  let score = 0;

  const text = issue.description.toLowerCase();

  // 🔥 CRITICAL CATEGORY (life-threatening)
  const critical = ["fire", "accident", "ambulance", "theft", "crime", "fight", "injury"];
  
  // ⚠️ MODERATE CATEGORY
  const moderate = ["garbage", "water", "electricity", "lights", "sewage", "traffic", "noise", "dogs"];
  
  // 🟢 LOW CATEGORY
  const low = ["cleanliness", "maintenance", "delay", "minor"];

  // 🔍 MATCHING LOGIC
  critical.forEach(word => {
    if (text.includes(word)) score += 60;
  });

  moderate.forEach(word => {
    if (text.includes(word)) score += 30;
  });

  low.forEach(word => {
    if (text.includes(word)) score += 10;
  });

  // 👥 USER VOTES IMPACT
  score += issue.votes * 5;

  // ⏳ TIME IMPACT (older = more urgent)
  const hours = (Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60);
  score += Math.min(hours, 24);

  // 🎯 FINAL PRIORITY
  let priority = "Low";

  if (score >= 80) priority = "High";
  else if (score >= 40) priority = "Medium";

  return { score, priority };
}

module.exports = { calculatePriority };