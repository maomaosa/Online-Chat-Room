import Redis from "ioredis";

const REDIS_URL =
  "rediss://red-cnoeulv109ks73b83j20:lmclZQWTq8ITxzUS6sr16pymG5rxJK3B@oregon-redis.render.com:6379";
// "redis://localhost:6379";
const redisClient = new Redis(REDIS_URL);
const excludedPaths = ["/", "/users", "/users/online", "/favicon.ico"];

export async function checkToken(req, res, next) {
  try {
    if (
      excludedPaths.includes(req.path) ||
      req.path.endsWith(".css") ||
      req.path.endsWith(".js") ||
      req.path.endsWith(".jpg") ||
      (req.method === "GET" && req.path.startsWith("/users")&& !req.path.endsWith("info"))
    ) {
      return next();
    }

    const cookie = req.headers.cookie;
    const token = cookie.substring(6);
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    const userInfoStr = await redisClient.get(token);
    if (!userInfoStr) {
      return res.status(401).json({ error: "Invalid token." });
    }

    const userInfo = JSON.parse(userInfoStr);
    req.userInfo = userInfo;

    next();
  } catch (error) {
    console.error("Error checking token:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

export function flushAllRedisData() {
  redisClient.flushall((err, reply) => {
    if (err) {
      console.error("Error flushing all data:", err);
    } else {
      console.log("All data flushed successfully:", reply);
    }
  });
}

export { redisClient };
