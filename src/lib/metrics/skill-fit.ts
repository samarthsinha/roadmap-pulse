export interface SkillLike {
  id: string;
  name: string;
}

export interface SkillRequirementLike {
  requiredRating: number;
  effortWeight: number;
}

export interface EngineerSkillLike {
  skillId: string;
  rating: number;
}

export interface EngineerLike {
  id: string;
  name: string;
  role: string;
  availabilityPercentage: number;
  skills: EngineerSkillLike[];
}

export interface SkillRequirementInput {
  skill: SkillLike;
  requirement: SkillRequirementLike;
}

export interface SkillFitResult {
  engineerId: string;
  engineerName: string;
  score: number;
  availabilityPercentage: number;
  skillBreakdown: {
    skillName: string;
    engineerRating: number;
    requiredRating: number;
    ratio: number;
  }[];
}

export function computeSkillFit(
  engineer: EngineerLike,
  requirements: SkillRequirementInput[],
): SkillFitResult | null {
  if (requirements.length === 0) return null;

  const breakdown: SkillFitResult["skillBreakdown"] = [];
  let totalWeight = 0;
  let weightedRatio = 0;

  for (const { skill, requirement } of requirements) {
    const engineerSkill = engineer.skills.find((es) => es.skillId === skill.id);
    const engineerRating = engineerSkill?.rating ?? 0;
    const requiredRating = requirement.requiredRating;
    const ratio =
      requiredRating > 0
        ? Math.min(1, engineerRating / requiredRating)
        : 0;

    breakdown.push({
      skillName: skill.name,
      engineerRating,
      requiredRating,
      ratio,
    });

    weightedRatio += ratio * requirement.effortWeight;
    totalWeight += requirement.effortWeight;
  }

  const avgRatio = totalWeight > 0 ? weightedRatio / totalWeight : 0;
  const score = avgRatio * (engineer.availabilityPercentage / 100);

  return {
    engineerId: engineer.id,
    engineerName: engineer.name,
    score: Math.round(score * 100) / 100,
    availabilityPercentage: engineer.availabilityPercentage,
    skillBreakdown: breakdown,
  };
}

export function rankEngineersForTrack(
  engineers: EngineerLike[],
  requirements: SkillRequirementInput[],
  limit = 5,
): SkillFitResult[] {
  return engineers
    .filter((e) => e.role === "engineer" || e.role === "lead")
    .map((engineer) => computeSkillFit(engineer, requirements))
    .filter((r): r is SkillFitResult => r !== null && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getSkillGaps(
  requirements: SkillRequirementInput[],
  engineers: EngineerLike[],
) {
  return requirements.map(({ skill, requirement }) => {
    const qualified = engineers.filter((e) => {
      const es = e.skills.find((s) => s.skillId === skill.id);
      return (es?.rating ?? 0) >= requirement.requiredRating;
    }).length;

    return {
      skillName: skill.name,
      required: requirement.requiredRating,
      availableEngineers: qualified,
      gap: qualified === 0,
    };
  });
}
