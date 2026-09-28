import { Router } from "express";
import type { Request, Response } from "express";
import { sql, eq, desc } from 'drizzle-orm';
import { dbClient } from '../db/client.js';
import { temples, reviews, users } from '../db/schema.js';
import { requireAuth, type AuthRequest } from '../middlewares/requireAuth.js';


const router = Router();

// สูตร Haversine สำหรับคำนวณระยะทาง 
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // รัศมีโลก
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

// สร้าง URL รูปผ่าน proxy ของเราเอง (ไม่เอา API key ไปใส่ใน URL ที่ส่งให้ client)
// ถ้า frontend อยู่คนละ host กับ backend ให้ตั้ง PUBLIC_API_URL เช่น http://localhost:3000
function getPhotoUrl(photos: GooglePlaceItem["photos"]): string | undefined {
  const photoName = photos?.[0]?.name;
  if (!photoName) return undefined;
  const base = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
  return `${base}/api/temples/photo/${photoName}`;
}

interface TempleForUpsert {
  id: string; // google place id
  name: string;
  address: string;
  rating: number;
  userRatingCount: number;
  location: { lat: number; lng: number };
  imageUrl?: string;
}

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
    // ไม่ให้ error ตรงนี้ทำให้ response หลักพัง แค่ log ไว้เฉยๆ
    console.error("Upsert Temples Error:", error);
  }
}


async function checkTemplewithDB(googlePlaceId: string): Promise<number | null> {
  const existing = await dbClient
    .select()
    .from(temples)
    .where(eq(temples.googlePlaceId, googlePlaceId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const googleResponse = await fetch(
    `https://places.googleapis.com/v1/places/${googlePlaceId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,rating,userRatingCount,photos",
      },
    }
  );
  const place = (await googleResponse.json()) as GooglePlaceItem;

  if (!googleResponse.ok || !place.location) {
    return null;
  }

  const inserted = await dbClient
    .insert(temples)
    .values({
      googlePlaceId,
      name: place.displayName?.text || "ไม่ระบุชื่อ",
      address: place.formattedAddress || "",
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      imageUrl: getPhotoUrl(place.photos) || null,
      ratingAvg: place.rating || 0,
      ratingCount: place.userRatingCount || 0,
    })
    .onConflictDoNothing({ target: temples.googlePlaceId })
    .returning();

  if (inserted.length > 0) return inserted[0].id;

  const retry = await dbClient
    .select()
    .from(temples)
    .where(eq(temples.googlePlaceId, googlePlaceId))
    .limit(1);
  return retry.length > 0 ? retry[0].id : null;
}


interface NearbyQueryParams {
  lat?: string;
  lng?: string;
  radius?: string;
}

interface ReviewBody {
  rating: number;
  text?: string;
}
// Interfaces กำหนดประเภทข้อมูลป้องกัน 'unknown'
interface GoogleReview {
  authorAttribution?: {
    displayName?: string;
  };
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: {
    text?: string;
  };
}

interface GooglePlaceItem {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
  reviews?: GoogleReview[];
  photos?: { name: string; widthPx?: number; heightPx?: number }[];
}

interface GoogleSearchResponse {
  places?: GooglePlaceItem[];
  error?: any;
}

// ดึงรีวิวที่ผู้ใช้เขียนในแอปเราเอง (อิงจาก google place id)
async function getAppReviews(googlePlaceId: string) {
  try {
    const rows = await dbClient
      .select({
        author: users.name,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(temples, eq(reviews.templeId, temples.id))
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(temples.googlePlaceId, googlePlaceId))
      .orderBy(desc(reviews.createdAt));

    return rows.map((r) => ({
      author: r.author || "ผู้ใช้งาน",
      rating: r.rating,
      relativeTime: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "",
      text: r.comment || "",
      source: "แอปขอส่วนบุญ", // frontend แสดงเป็น badge อยู่แล้ว
    }));
  } catch (error) {
    // ถ้าดึงจาก DB พลาด ยังให้แสดงรีวิว Google ต่อได้
    console.error("Get App Reviews Error:", error);
    return [];
  }
}


// GET /api/temples/photo/places/xxx/photos/yyy — proxy รูปจาก Google (ซ่อน API key)
router.get(/^\/photo\/(.+)$/, async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).send();
    }

    // req.params[0] จะได้ path ต่อจาก /photo/ เช่น "places/xxx/photos/yyy"
    const photoPath = (req.params as any)[0] as string;

    // ตรวจรูปแบบ path กันคนยิงมั่วมากิน quota
    if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(photoPath)) {
      return res.status(400).send();
    }

    const googleUrl = `https://places.googleapis.com/v1/${photoPath}/media?maxHeightPx=400&key=${apiKey}`;

    const googleRes = await fetch(googleUrl);
    if (!googleRes.ok) {
      return res.status(googleRes.status).send();
    }

    res.set("Content-Type", googleRes.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400"); // cache 1 วัน ลด quota การยิง Google ซ้ำ
    const buffer = await googleRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Photo Proxy Error:", error);
    return res.status(500).send();
  }
});

// GET /api/temples — ค้นหาวัด + คำนวณระยะทางจากพิกัด Lat/Lng ผู้ใช้ 
router.get("/", async (req: Request<{}, {}, {}, NearbyQueryParams>, res: Response): Promise<Response> => {
  try {
    const { lat, lng, radius = "5000" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุพิกัด lat และ lng ใน Query Parameter",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: "API Key ไม่ถูกต้อง" });
    }

    const googleResponse = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos",
        },
        body: JSON.stringify({
          includedTypes: ["buddhist_temple"],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude: userLat, longitude: userLng },
              radius: parseFloat(radius),
            },
          },
        }),
      }
    );

    const result = (await googleResponse.json()) as GoogleSearchResponse;

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ success: false, error: result.error });
    }

    const places = result.places || [];

    const templeList = places.map((place: GooglePlaceItem) => {
      const placeLat = place.location?.latitude || 0;
      const placeLng = place.location?.longitude || 0;

      const distanceKm = calculateDistance(userLat, userLng, placeLat, placeLng);

      return {
        id: place.id,
        name: place.displayName?.text || "ไม่ระบุชื่อ",
        address: place.formattedAddress || "",
        rating: place.rating || 0,
        userRatingCount: place.userRatingCount || 0,
        distanceKm: distanceKm,
        location: { lat: placeLat, lng: placeLng },
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLng}&query_place_id=${place.id}`,
        imageUrl: getPhotoUrl(place.photos),
      };
    });

    templeList.sort((a, b) => a.distanceKm - b.distanceKm);

    upsertTemples(templeList);

    return res.json({ success: true, totalCount: templeList.length, data: templeList });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 2. GET /api/temples/:id — ดึงรายละเอียดวัด + รีวิวทั้งหมด (Google + รีวิวในแอป)
router.get("/:id", async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const templeId = req.params.id;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: "API Key ไม่ถูกต้อง" });
    }

    const googleResponse = await fetch(
      `https://places.googleapis.com/v1/places/${templeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,location,rating,userRatingCount,reviews,photos",
        },
      }
    );

    const place = (await googleResponse.json()) as GooglePlaceItem & { error?: any };

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ success: false, error: place.error });
    }

    // รีวิวที่ผู้ใช้เขียนในแอปเราเอง (จาก DB)
    const appReviews = await getAppReviews(place.id);

    const templeDetail = {
      id: place.id,
      name: place.displayName?.text || "ไม่ระบุชื่อ",
      address: place.formattedAddress || "",
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      location: { lat: place.location?.latitude, lng: place.location?.longitude },
      imageUrl: getPhotoUrl(place.photos),
      reviews: [
        ...appReviews, // รีวิวในแอปขึ้นก่อน
        ...(place.reviews || []).map((rev: GoogleReview) => ({
          author: rev.authorAttribution?.displayName || "ผู้ใช้งาน",
          rating: rev.rating || 0,
          relativeTime: rev.relativePublishTimeDescription || "",
          text: rev.text?.text || "",
        })),
      ],
    };

    if (templeDetail.location.lat != null && templeDetail.location.lng != null) {
      upsertTemples([
        {
          id: templeDetail.id,
          name: templeDetail.name,
          address: templeDetail.address,
          rating: templeDetail.rating,
          userRatingCount: templeDetail.userRatingCount,
          location: { lat: templeDetail.location.lat, lng: templeDetail.location.lng },
          imageUrl: templeDetail.imageUrl,
        },
      ]);
    }

    return res.json({ success: true, data: templeDetail });
  } catch (error) {
    console.error("Fetch Detail Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 3. POST /api/temples/:id/reviews — ให้ดาว (1-5) และเพิ่มข้อความรีวิว
router.post("/:id/reviews", requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const templeId = req.params.id;
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

    //insert ลง DB
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
      .set({ ratingAvg: avgRating, ratingCount: allReviews.length })
      .where(eq(temples.id, templeDbId));

    // ดึงชื่อ user จริงจาก DB (ไม่ใช้ authorName ที่ client กรอกเองแบบเดิม กันปลอมชื่อ)
    const userRow = await dbClient.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    return res.status(201).json({
      success: true,
      message: "เพิ่มรีวิวเรียบร้อยแล้ว",
      data: {
        author: userRow?.name || "ผู้ใช้งาน",
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