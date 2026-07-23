import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  timeout: 15000,
});
const unique = Date.now();

const run = async () => {
  const name = `mobile-smoke-${unique}`;
  await api.post("/api/v1/auth/register", {
    name,
    email: `${name}@example.com`,
    password: "password123",
    cpassword: "password123",
    isVisibleInRanking: true,
  });
  const login = await api.post("/api/v1/auth/login", {
    name,
    password: "password123",
  });
  const auth = { headers: { Authorization: `Bearer ${login.data.token}` } };
  const gym = await api.post(
    "/api/v1/gyms",
    { name: "Smoke Studio", address: "Local" },
    auth,
  );
  const group = await api.post(
    "/api/v1/muscle-groups",
    { name: "Smoke Chest", region: "CHEST" },
    auth,
  );
  const exercise = await api.post(
    "/api/v1/exercises",
    { name: "Smoke Press", muscleGroupId: group.data._id, formula: "STANDARD" },
    auth,
  );
  await api.post(
    "/api/v1/plans",
    {
      name: "Smoke Plan",
      days: [
        {
          name: "Day",
          orderIndex: 0,
          exercises: [
            {
              exerciseId: exercise.data._id,
              series: 1,
              repsTarget: 8,
              orderIndex: 0,
            },
          ],
        },
      ],
    },
    auth,
  );
  const first = await api.post(
    "/api/v1/workouts",
    {
      gymId: gym.data._id,
      startedAt: new Date().toISOString(),
      sets: [
        {
          exerciseId: exercise.data._id,
          series: 1,
          reps: 8,
          weight: 80,
          unit: "KILOGRAMS",
        },
      ],
    },
    auth,
  );
  await api.post(`/api/v1/workouts/${first.data.id}/finalize`, undefined, {
    headers: { ...auth.headers, "Idempotency-Key": `smoke-${unique}-1` },
  });
  const second = await api.post(
    "/api/v1/workouts",
    {
      gymId: gym.data._id,
      startedAt: new Date().toISOString(),
      sets: [
        {
          exerciseId: exercise.data._id,
          series: 1,
          reps: 9,
          weight: 82,
          unit: "KILOGRAMS",
        },
      ],
    },
    auth,
  );
  const done = await api.post(
    `/api/v1/workouts/${second.data.id}/finalize`,
    undefined,
    { headers: { ...auth.headers, "Idempotency-Key": `smoke-${unique}-2` } },
  );
  await api.post(
    "/api/v1/measurements",
    {
      bodyPart: "WEIGHT",
      unit: "KG",
      value: 82,
      takenAt: new Date().toISOString(),
    },
    auth,
  );
  const trends = await api.get("/api/v1/measurements/trends", auth);
  const elo = await api.get("/api/v1/elo/chart", auth);
  console.log(
    JSON.stringify(
      {
        finalized: done.status,
        trends: trends.data.length,
        elo: elo.data.length,
      },
      null,
      2,
    ),
  );
};

run().catch((error) => {
  console.error(error.response?.data ?? error.message);
  process.exit(1);
});
