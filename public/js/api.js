export async function loadCourseConfig() {
  const res = await fetch("./data/course.json");
  if (!res.ok) throw new Error("Failed to load course config");
  return res.json();
}

export async function loadUnit(unitId) {
  const res = await fetch(`./data/units/${unitId}.json`);
  if (!res.ok) throw new Error(`Failed to load unit ${unitId}`);
  return res.json();
}
