import { Router } from "express";
import type { Request, Response } from "express";
import { sql, eq } from "drizzle-orm";
import { dbClient } from "../db/client.js";
import { temples, reviews, users } from "../db/schema.js";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

// สูตร Haversine สำหรับคำนวณระยะทางจากพิกัด (กิโลเมตร)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // รัศมีโลก (กม.)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// 🏛️ คลังภาพสำรอง (Fallback Images) สำหรับวัดที่ไม่มีใน Wikipedia (ภาพวัดไทยแท้ 100%)
const FALLBACK_TEMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80", // วัดอรุณ / วัดไทย
  "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80", // วัดเชียงใหม่
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80", // วัดพระธาตุดอยสุเทพ
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80", // วัดพระแก้ว
  "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80", // วัดเจดีย์หลวง เชียงใหม่
];

function getFallbackImage(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_TEMPLE_IMAGES.length;
  return FALLBACK_TEMPLE_IMAGES[index];
}

// 🟢 0. GET /api/temples/photo/* — Redirect fallback สำหรับรูปภาพเก่า/รูปที่ไม่พบ
router.get(/^\/photo\/.*/, (req: Request, res: Response) => {
  const seed = req.originalUrl || "temple";
  return res.redirect(getFallbackImage(seed));
});

function isRealTempleImage(url?: string | null): boolean {
  return (
    !!url &&
    (url.includes("wikimedia.org") || url.includes("wikipedia.org"))
  );
}

// 🖼️ ดึงรูปถ่ายวัดจริงจาก Wikipedia REST API (ทั้ง th และ en) ถ้าไม่มี คืนค่า null เพื่อให้แสดง icon วัด
async function fetchTempleImage(templeName: string): Promise<string | null> {
  const cleanName = templeName.split(/[,\(]/)[0].trim();
  const shortMatch = cleanName.match(/^(Wat\s+[A-Za-z]+)/i)?.[1];
  const thaiMatch = cleanName.match(/^(วัด\S+)/)?.[1];
  const parenMatch = templeName.match(/\((.*?)\)/)?.[1]?.trim();

  const candidates = [
    templeName,
    cleanName,
    ...(thaiMatch && thaiMatch !== cleanName ? [thaiMatch] : []),
    ...(parenMatch ? [parenMatch] : []),
    cleanName.replace(/ Lad$/i, " Lat"),
    cleanName.replace(/วรมหาวิหาร$/, ""),
    cleanName.replace(/พระอารามหลวง$/, ""),
    ...(shortMatch && shortMatch !== cleanName ? [shortMatch] : []),
  ];

  for (const candidate of candidates) {
    const formatted = candidate.trim().replace(/ /g, "_");
    const urls = [
      `https://th.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`,
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "KhorSuanBoonApp/1.0 (contact: info@khorsuanboon.com)" },
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          const data = (await res.json()) as { thumbnail?: { source?: string } };
          if (data.thumbnail?.source) {
            return data.thumbnail.source;
          }
        }
      } catch {
        // try next
      }
    }
  }
  return null;
}

interface TempleForUpsert {
  id: string; // OpenStreetMap place_id เช่น osm_12345
  name: string;
  address: string;
  rating: number;
  userRatingCount: number;
  location: { lat: number; lng: number };
  imageUrl?: string | null;
}

// บันทึก/อัปเดตวัดลง Database
async function upsertTemples(items: TempleForUpsert[]) {
  if (items.length === 0) return;

  const values = items.map((t) => ({
    googlePlaceId: t.id,
    name: t.name,
    address: t.address,
    latitude: t.location.lat,
    longitude: t.location.lng,
    imageUrl: t.imageUrl || null,
    ratingAvg: t.rating,
    ratingCount: t.userRatingCount,
  }));

  try {
    await dbClient
      .insert(temples)
      .values(values)
      .onConflictDoUpdate({
        target: temples.googlePlaceId,
        set: {
          name: sql`excluded.name`,
          address: sql`excluded.address`,
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
          imageUrl: sql`excluded.image_url`,
          ratingAvg: sql`excluded.rating_avg`,
          ratingCount: sql`excluded.rating_count`,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("Upsert Temples Error:", error);
  }
}

// เช็ค/สร้างวัดใน DB สำหรับการผูกรีวิว
async function checkTemplewithDB(placeId: string): Promise<number | null> {
  const existing = await dbClient
    .select()
    .from(temples)
    .where(eq(temples.googlePlaceId, placeId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // หากไม่มีใน DB ให้สร้างขึ้นมาใหม่โดยดึงข้อมูลจาก OpenStreetMap
  const cleanId = placeId.replace("osm_", "");
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/details?place_id=${cleanId}&format=json&accept-language=th`,
      { headers: { "User-Agent": "KhorSuanBoonApp/1.0", "Accept-Language": "th" }, signal: AbortSignal.timeout(3000) }
    );
    if (osmRes.ok) {
      const data = (await osmRes.json()) as any;
      const name = data.names?.["name:th"] || data.localname || data.names?.name || "วัด";
      const lat = parseFloat(data.centroid?.coordinates?.[1] || "18.7883");
      const lng = parseFloat(data.centroid?.coordinates?.[0] || "98.9853");
      const imageUrl = await fetchTempleImage(name);

      const inserted = await dbClient
        .insert(temples)
        .values({
          googlePlaceId: placeId,
          name,
          address: data.calculated_postcode || "เชียงใหม่",
          latitude: lat,
          longitude: lng,
          imageUrl,
          ratingAvg: 4.8,
          ratingCount: 0,
        })
        .onConflictDoNothing({ target: temples.googlePlaceId })
        .returning();

      if (inserted.length > 0) return inserted[0].id;
    }
  } catch (error) {
    console.error("Check temple error:", error);
  }

  const retry = await dbClient
    .select()
    .from(temples)
    .where(eq(temples.googlePlaceId, placeId))
    .limit(1);
  return retry.length > 0 ? retry[0].id : null;
}

interface NearbyQueryParams {
  lat?: string;
  lng?: string;
  radius?: string;
  query?: string;
}

interface ReviewBody {
  rating: number;
  text: string;
}

// 🟢 1. GET /api/temples — ค้นหาวัดรอบพิกัด GPS หรือค้นหาด้วยชื่อ (รองรับ Caching ใน Database)
router.get("/", async (req: Request<{}, {}, {}, NearbyQueryParams>, res: Response): Promise<Response> => {
  try {
    const { lat, lng, radius = "10000", query } = req.query;

    const userLat = lat ? parseFloat(lat) : 18.7883;
    const userLng = lng ? parseFloat(lng) : 98.9853;
    const radiusNum = parseFloat(radius);
    const radiusKm = radiusNum / 1000;

    // ─────────────────────────────────────────────
    // กรณีที่ 1: พิมพ์ค้นหาด้วยข้อความ (Text Search)
    // ─────────────────────────────────────────────
    if (query && query.trim() !== "") {
      const searchKeyword = query.trim();
      const osmSearchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchKeyword
      )}&format=json&limit=20&addressdetails=1&accept-language=th&namedetails=1`;

      const osmRes = await fetch(osmSearchUrl, {
        headers: { "User-Agent": "KhorSuanBoonApp/1.0", "Accept-Language": "th" },
      });

      if (!osmRes.ok) {
        return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการค้นหาจาก OpenStreetMap" });
      }

      const rawItems = (await osmRes.json()) as any[];
      const templeList = await Promise.all(
        rawItems.map(async (item) => {
          const placeLat = parseFloat(item.lat);
          const placeLng = parseFloat(item.lon);
          const name = item.namedetails?.["name:th"] || item.namedetails?.name || item.name || item.display_name?.split(",")[0]?.trim() || "วัด";
          const placeId = `osm_${item.place_id}`;
          const distanceKm = calculateDistance(userLat, userLng, placeLat, placeLng);
          const imageUrl = await fetchTempleImage(name);

          return {
            id: placeId,
            name,
            address: item.display_name || "",
            rating: 4.8,
            userRatingCount: 0,
            distanceKm,
            location: { lat: placeLat, lng: placeLng },
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLng}`,
            imageUrl,
          };
        })
      );

      templeList.sort((a, b) => a.distanceKm - b.distanceKm);
      upsertTemples(templeList);

      return res.json({ success: true, totalCount: templeList.length, data: templeList });
    }

    // ─────────────────────────────────────────────
    // กรณีที่ 2: ค้นหาวัดรอบตัวด้วย GPS (Nearby Search)
    // ⚡ ขั้นตอน Caching: ตรวจสอบใน Database ก่อนเป็นอันดับแรก
    // ─────────────────────────────────────────────
    const allDbTemples = await dbClient.select().from(temples);
    const nearbyFromDb = allDbTemples
      .map((t) => {
        const tLat = t.latitude || 0;
        const tLng = t.longitude || 0;
        const imageUrl = isRealTempleImage(t.imageUrl) ? t.imageUrl : null;
        return {
          id: t.googlePlaceId,
          name: t.name,
          address: t.address || "",
          rating: t.ratingAvg || 4.8,
          userRatingCount: t.ratingCount || 0,
          distanceKm: calculateDistance(userLat, userLng, tLat, tLng),
          location: { lat: tLat, lng: tLng },
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${tLat},${tLng}`,
          imageUrl,
        };
      })
      .filter((t) => t.distanceKm <= radiusKm);

    // ⚡ ถ้าใน Database มีวัดในรัศมีรอบตัวผู้ใช้เพียงพอ (ตั้งแต่ 5 วัดขึ้นไป) -> ดึงจาก Database ตอบกลับทันที!
    if (nearbyFromDb.length >= 5) {
      nearbyFromDb.sort((a, b) => a.distanceKm - b.distanceKm);
      return res.json({
        success: true,
        source: "database_cache",
        totalCount: nearbyFromDb.length,
        data: nearbyFromDb,
      });
    }

    // ─────────────────────────────────────────────
    // ถ้าใน Database ยังไม่มีหรือมีไม่พอ -> ดึงจาก OpenStreetMap
    // ─────────────────────────────────────────────
    const delta = Math.max(0.04, radiusKm / 111);
    const minLng = userLng - delta;
    const maxLng = userLng + delta;
    const minLat = userLat - delta;
    const maxLat = userLat + delta;
    const viewbox = `${minLng},${maxLat},${maxLng},${minLat}`;

    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      "วัด"
    )}&format=json&bounded=1&viewbox=${viewbox}&limit=25&addressdetails=1&accept-language=th&namedetails=1`;

    const osmResponse = await fetch(osmUrl, {
      headers: { "User-Agent": "KhorSuanBoonApp/1.0", "Accept-Language": "th" },
    });

    if (!osmResponse.ok) {
      return res.status(500).json({ success: false, message: "ไม่สามารถเชื่อมต่อ OpenStreetMap ได้" });
    }

    const places = (await osmResponse.json()) as any[];

    const templeList = await Promise.all(
      places.map(async (place) => {
        const placeLat = parseFloat(place.lat);
        const placeLng = parseFloat(place.lon);
        const name = place.namedetails?.["name:th"] || place.namedetails?.name || place.name || place.display_name?.split(",")[0]?.trim() || "วัด";
        const distanceKm = calculateDistance(userLat, userLng, placeLat, placeLng);
        const placeId = `osm_${place.place_id}`;
        const imageUrl = await fetchTempleImage(name);

        return {
          id: placeId,
          name,
          address: place.display_name || "",
          rating: 4.8,
          userRatingCount: 0,
          distanceKm,
          location: { lat: placeLat, lng: placeLng },
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLng}`,
          imageUrl,
        };
      })
    );

    templeList.sort((a, b) => a.distanceKm - b.distanceKm);

    // เซฟลง Database เพื่อให้คนถัดไปดึงจาก Cache ได้ทันที
    upsertTemples(templeList);

    return res.json({
      success: true,
      source: "openstreetmap",
      totalCount: templeList.length,
      data: templeList,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 2. GET /api/temples/:id — ดึงรายละเอียดวัด + รีวิวทั้งหมดจาก Database
router.get("/:id", async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const templeId = req.params.id;

    // 1. ค้นหาใน DB ก่อน
    let templeRow = await dbClient
      .select()
      .from(temples)
      .where(eq(temples.googlePlaceId, templeId))
      .limit(1);

    // ถ้ายังไม่มีใน DB ให้ดึงและสร้างวัดนี้ขึ้นมาก่อน
    if (templeRow.length === 0) {
      await checkTemplewithDB(templeId);
      templeRow = await dbClient
        .select()
        .from(temples)
        .where(eq(temples.googlePlaceId, templeId))
        .limit(1);
    }

    if (templeRow.length === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลวัดนี้" });
    }

    const t = templeRow[0];

    // 2. ดึงรีวิวทั้งหมดของวัดนี้จากตาราง reviews
    const dbReviews = await dbClient
      .select({
        id: reviews.id,
        rating: reviews.rating,
        text: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.templeId, t.id));

    const imageUrl = isRealTempleImage(t.imageUrl) ? t.imageUrl : null;

    const templeDetail = {
      id: t.googlePlaceId,
      name: t.name,
      address: t.address || "",
      rating: t.ratingAvg || 4.8,
      userRatingCount: t.ratingCount || dbReviews.length,
      location: { lat: t.latitude || 0, lng: t.longitude || 0 },
      imageUrl,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${t.latitude},${t.longitude}`,
      reviews: dbReviews.map((r) => ({
        author: r.userName || "ผู้ใช้งาน",
        rating: r.rating,
        relativeTime: r.createdAt ? new Date(r.createdAt).toLocaleDateString("th-TH") : "ไม่นานมานี้",
        text: r.text || "",
      })),
    };

    return res.json({ success: true, data: templeDetail });
  } catch (error) {
    console.error("Fetch Detail Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 3. POST /api/temples/:id/reviews — ให้ดาว (1-5) และเพิ่มข้อความรีวิว
router.post("/:id/reviews", requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const templeId = String(req.params.id);
    const { rating, text } = req.body as ReviewBody;
    const userId = req.userId!;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุคะแนนดาว (rating) ระหว่าง 1 - 5",
      });
    }

    // หา/สร้างวัดใน DB ก่อน (reviews.templeId อ้างอิง temples.id ที่เป็น serial)
    const templeDbId = await checkTemplewithDB(templeId);
    if (!templeDbId) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลวัดนี้" });
    }

    // insert ลงตาราง reviews
    const insertedReview = await dbClient
      .insert(reviews)
      .values({
        userId,
        templeId: templeDbId,
        rating,
        comment: text || "",
      })
      .returning();

    // อัปเดต rating เฉลี่ย + จำนวนรีวิวของวัด
    const allReviews = await dbClient
      .select()
      .from(reviews)
      .where(eq(reviews.templeId, templeDbId));

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await dbClient
      .update(temples)
      .set({
        ratingAvg: Math.round(avgRating * 10) / 10,
        ratingCount: allReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(temples.id, templeDbId));

    // ดึงชื่อ user จริงจาก DB
    const userRow = await dbClient
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return res.status(201).json({
      success: true,
      message: "เพิ่มรีวิวเรียบร้อยแล้ว",
      data: {
        author: userRow[0]?.name || "ผู้ใช้งาน",
        rating: insertedReview[0].rating,
        text: insertedReview[0].comment,
      },
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;