import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.blocker.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.weeklyStatus.deleteMany();
  await prisma.trackSkillRequirement.deleteMany();
  await prisma.engineerSkill.deleteMany();
  await prisma.track.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.engineer.deleteMany();
  await prisma.skill.deleteMany();

  const skills = await Promise.all(
    [
      ["Backend", "Engineering"],
      ["Frontend", "Engineering"],
      ["Mobile", "Engineering"],
      ["DevOps", "Engineering"],
      ["System Design", "Engineering"],
      ["Observability", "Engineering"],
      ["Data Engineering", "Engineering"],
      ["Payments", "Domain"],
    ].map(([name, category]) =>
      prisma.skill.create({ data: { name, category } }),
    ),
  );

  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]));

  const initiatives = await Promise.all([
    prisma.initiative.create({
      data: {
        name: "Platform Modernization",
        businessGoal: "Reduce infra cost 30% and improve deployment velocity",
        owner: "VP Engineering",
        status: "AMBER",
        progressPercentage: 55,
        confidence: "MEDIUM",
        targetDate: new Date("2026-12-31"),
        leadershipAsk: "Approve Q4 infra budget for Kafka upgrade",
      },
    }),
    prisma.initiative.create({
      data: {
        name: "Checkout Conversion",
        businessGoal: "Increase mobile checkout conversion by 15%",
        owner: "VP Product",
        status: "AMBER",
        progressPercentage: 42,
        confidence: "MEDIUM",
        targetDate: new Date("2026-09-30"),
        leadershipAsk: "Temp mobile engineer for 2 sprints",
      },
    }),
    prisma.initiative.create({
      data: {
        name: "Data Platform Reliability",
        businessGoal: "99.9% SLA on core analytics pipelines",
        owner: "Director of Data",
        status: "RED",
        progressPercentage: 35,
        confidence: "LOW",
        targetDate: new Date("2026-10-15"),
        leadershipAsk: "VP Eng approval for $45K infra spend",
      },
    }),
  ]);

  const engineers = await Promise.all([
    { name: "Morgan Lee", role: "lead", level: "IC5", manager: "Alex Rivera", availabilityPercentage: 88 },
    { name: "Casey Nguyen", role: "lead", level: "IC5", manager: "Jordan Kim", availabilityPercentage: 75 },
    { name: "Riley Patel", role: "engineer", level: "IC4", manager: "Alex Rivera", availabilityPercentage: 100 },
    { name: "Quinn Martinez", role: "engineer", level: "IC4", manager: "Alex Rivera", availabilityPercentage: 75 },
    { name: "Avery Johnson", role: "engineer", level: "IC3", manager: "Jordan Kim", availabilityPercentage: 88 },
    { name: "Drew Wilson", role: "engineer", level: "IC3", manager: "Jordan Kim", availabilityPercentage: 63 },
    { name: "Sam Okonkwo", role: "engineer", level: "IC4", manager: "Alex Rivera", availabilityPercentage: 100 },
    { name: "Jamie Foster", role: "engineer", level: "IC3", manager: "Jordan Kim", availabilityPercentage: 50 },
    { name: "Priya Sharma", role: "engineer", level: "IC4", manager: "Alex Rivera", availabilityPercentage: 88 },
    { name: "Chris Taylor", role: "engineer", level: "IC3", manager: "Alex Rivera", availabilityPercentage: 100 },
  ].map((e) => prisma.engineer.create({ data: e })));

  const engMap = Object.fromEntries(engineers.map((e) => [e.name, e]));

  const engineerSkills: [string, string, number][] = [
    ["Morgan Lee", "Backend", 5], ["Morgan Lee", "DevOps", 4], ["Morgan Lee", "System Design", 4],
    ["Casey Nguyen", "Frontend", 5], ["Casey Nguyen", "Mobile", 4], ["Casey Nguyen", "Backend", 3],
    ["Riley Patel", "Backend", 4], ["Riley Patel", "DevOps", 3],
    ["Quinn Martinez", "Data Engineering", 4], ["Quinn Martinez", "Backend", 3],
    ["Avery Johnson", "Frontend", 4], ["Avery Johnson", "Mobile", 3],
    ["Drew Wilson", "Frontend", 3], ["Drew Wilson", "Backend", 3],
    ["Sam Okonkwo", "DevOps", 5], ["Sam Okonkwo", "Observability", 4],
    ["Jamie Foster", "Mobile", 4], ["Jamie Foster", "Payments", 3],
    ["Priya Sharma", "Data Engineering", 5], ["Priya Sharma", "Backend", 4],
    ["Chris Taylor", "Observability", 4], ["Chris Taylor", "DevOps", 3],
  ];

  for (const [engName, skillName, rating] of engineerSkills) {
    await prisma.engineerSkill.create({
      data: {
        engineerId: engMap[engName].id,
        skillId: skillMap[skillName].id,
        rating,
      },
    });
  }

  const weekStart = new Date("2026-06-30T00:00:00.000Z");

  const trackDefs = [
    { init: 0, name: "API Gateway Modernization", status: "GREEN" as const, progress: 62, confidence: "HIGH" as const, em: "Alex Rivera", pm: "Sam Chen", lead: "Morgan Lee", effort: 68, target: "2026-09-15" },
    { init: 0, name: "Observability Stack Upgrade", status: "GREY" as const, progress: 10, confidence: "HIGH" as const, em: "Alex Rivera", pm: "Sam Chen", lead: "Morgan Lee", effort: 36, target: "2026-11-15" },
    { init: 0, name: "CI/CD Pipeline Optimization", status: "GREEN" as const, progress: 78, confidence: "HIGH" as const, em: "Alex Rivera", pm: "Sam Chen", lead: "Riley Patel", effort: 45, target: "2026-08-01" },
    { init: 1, name: "Mobile Checkout Redesign", status: "AMBER" as const, progress: 45, confidence: "MEDIUM" as const, em: "Jordan Kim", pm: "Taylor Brooks", lead: "Casey Nguyen", effort: 56, target: "2026-08-30" },
    { init: 1, name: "Payment SDK Integration", status: "GREEN" as const, progress: 85, confidence: "HIGH" as const, em: "Jordan Kim", pm: "Taylor Brooks", lead: "Casey Nguyen", effort: 30, target: "2026-07-15" },
    { init: 1, name: "A/B Testing Framework", status: "GREEN" as const, progress: 70, confidence: "HIGH" as const, em: "Jordan Kim", pm: "Taylor Brooks", lead: "Avery Johnson", effort: 25, target: "2026-08-15" },
    { init: 2, name: "Data Pipeline Reliability", status: "RED" as const, progress: 38, confidence: "LOW" as const, em: "Alex Rivera", pm: "Sam Chen", lead: "Morgan Lee", effort: 44, target: "2026-10-01" },
    { init: 2, name: "Analytics Recovery Dashboard", status: "GREY" as const, progress: 5, confidence: "MEDIUM" as const, em: "Alex Rivera", pm: "Sam Chen", lead: "Quinn Martinez", effort: 20, target: "2026-11-01" },
  ];

  for (const def of trackDefs) {
    const track = await prisma.track.create({
      data: {
        initiativeId: initiatives[def.init].id,
        name: def.name,
        ownerEm: def.em,
        ownerPm: def.pm,
        techLead: def.lead,
        status: def.status,
        progressPercentage: def.progress,
        confidence: def.confidence,
        targetDate: new Date(def.target),
        effortEstimateDays: def.effort,
      },
    });

    if (def.name === "API Gateway Modernization") {
      for (const [skill, rating, weight] of [["Backend", 4, 2], ["DevOps", 3, 1], ["System Design", 4, 1]] as const) {
        await prisma.trackSkillRequirement.create({
          data: { trackId: track.id, skillId: skillMap[skill].id, requiredRating: rating, effortWeight: weight },
        });
      }
      await prisma.weeklyStatus.create({
        data: {
          trackId: track.id, weekStartDate: weekStart, status: "GREEN",
          completedThisWeek: ["Canary deployment for 3 core services"],
          plannedNextWeek: ["Migrate remaining 5 services"],
          updatedBy: def.em,
        },
      });
    }

    if (def.name === "Mobile Checkout Redesign") {
      for (const [skill, rating, weight] of [["Mobile", 4, 2], ["Frontend", 3, 1], ["Payments", 3, 1]] as const) {
        await prisma.trackSkillRequirement.create({
          data: { trackId: track.id, skillId: skillMap[skill].id, requiredRating: rating, effortWeight: weight },
        });
      }
      await prisma.weeklyStatus.create({
        data: {
          trackId: track.id, weekStartDate: weekStart, status: "AMBER",
          completedThisWeek: ["Payment SDK integration complete"],
          plannedNextWeek: ["Accessibility audit fixes"],
          blockers: ["Design system tokens not finalized"],
          leadershipAsk: "1 additional mobile engineer for 2 sprints",
          updatedBy: def.em,
        },
      });
      await prisma.risk.create({
        data: { trackId: track.id, title: "Mobile capacity constraint", severity: "HIGH", owner: def.em, dueDate: new Date("2026-07-10") },
      });
      await prisma.blocker.create({
        data: { trackId: track.id, title: "Design system tokens not finalized", owner: def.lead, blockedSince: new Date("2026-06-25") },
      });
    }

    if (def.name === "Data Pipeline Reliability") {
      for (const [skill, rating, weight] of [["Data Engineering", 4, 2], ["DevOps", 3, 1]] as const) {
        await prisma.trackSkillRequirement.create({
          data: { trackId: track.id, skillId: skillMap[skill].id, requiredRating: rating, effortWeight: weight },
        });
      }
      await prisma.weeklyStatus.create({
        data: {
          trackId: track.id, weekStartDate: weekStart, status: "RED",
          completedThisWeek: ["Defined SLA targets with data team"],
          plannedNextWeek: ["Auto-retry with dead-letter queue"],
          blockers: ["Kafka cluster upgrade blocked on budget", "Missing prod data lake access"],
          leadershipAsk: "Data platform team to grant prod read access",
          updatedBy: def.em,
        },
      });
      await prisma.risk.create({
        data: { trackId: track.id, title: "Infra budget not approved", severity: "CRITICAL", owner: def.em, mitigation: "Escalate to VP Eng", dueDate: new Date("2026-07-05") },
      });
      await prisma.blocker.create({
        data: { trackId: track.id, title: "Kafka cluster upgrade blocked on budget", owner: def.em, blockedSince: new Date("2026-06-16"), escalationNeeded: true },
      });
    }
  }

  console.log("Seed complete: 3 initiatives, 8 tracks, 10 engineers");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
