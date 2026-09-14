import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { eq, desc } from "drizzle-orm";
import { dbClient as db } from "../db/client.js";
import { temples, reviews, users } from "../db/schema.js";

const router = Router();

// สูตร Haversine คำนวณระยะทาง
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // รัศมีโลก (กิโลเมตร)
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

// 🟢 1. GET /api/temples — ค้นหาวัดใกล้ฉัน (Nearby) หรือค้นหาทั่วประเทศด้วยชื่อ/พื้นที่ (Text Search)
router.get("/", async (req: Request, res: Response): Promise<Response> => {
  try {
    const { lat, lng, radius = "10000", query } = req.query as {
      lat?: string;
      lng?: string;
      radius?: string;
      query?: string;
    };

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "API Key ไม่ถูกต้อง" });
    }

    let userLat = lat ? parseFloat(lat) : null;
    let userLng = lng ? parseFloat(lng) : null;

    let googleResponse: globalThis.Response;

    // กรณีที่ 1: พิมพ์คำค้นหา (ค้นหาวัดได้ทั่วไทย เช่น "วัดพระแก้ว", "วัดในเชียงราย")
    if (query && query.trim() !== "") {
      const searchPayload: any = {
        textQuery: query.trim(),
        includedType: "buddhist_temple",
        languageCode: "th",
        maxResultCount: 20,
      };

      // ถ้ามีพิกัดผู้ใช้ด้วย จะช่วยให้น้ำหนักวัดที่อยู่ใกล้คำค้นหามากขึ้น
      if (userLat && userLng) {
        searchPayload.locationBias = {
          circle: {
            center: { latitude: userLat, longitude: userLng },
            radius: 50000.0,
          },
        };
      }

      googleResponse = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos",
          },
          body: JSON.stringify(searchPayload),
        }
      );
    } 
    // กรณีที่ 2: กดค้นหา "ใกล้ฉัน" ด้วยพิกัด GPS
    else if (userLat && userLng) {
      googleResponse = await fetch(
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
    } else {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุคำค้นหา (query) หรือพิกัดตำแหน่ง (lat, lng)",
      });
    }

    const result: any = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("🔥 Google Places Search Error:", result);
      return res.status(googleResponse.status).json({ success: false, error: result.error });
    }

    const places = result.places || [];

    const templeList = places.map((place: any) => {
      const placeLat = place.location?.latitude || 0;
      const placeLng = place.location?.longitude || 0;

      // คำนวณระยะทางเฉพาะกรณีที่มีพิกัดผู้ใช้
      const distanceKm =
        userLat && userLng
          ? calculateDistance(userLat, userLng, placeLat, placeLng)
          : null;

      let imageUrl = "";
      if (place.photos && Array.isArray(place.photos) && place.photos.length > 0) {
        const photoName = place.photos[0].name;
        imageUrl = `/api/temples/photo?name=${encodeURIComponent(photoName)}&maxHeight=300&maxWidth=300`;
      }

      return {
        id: place.id,
        name: place.displayName?.text || "ไม่ระบุชื่อ",
        address: place.formattedAddress || "",
        imageUrl,
        rating: place.rating || 0,
        userRatingCount: place.userRatingCount || 0,
        distanceKm,
        location: { lat: placeLat, lng: placeLng },
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLng}&query_place_id=${place.id}`,
      };
    });

    // ถ้ามีระยะทางให้เรียงตามระยะทางที่ใกล้ที่สุดก่อน
    if (userLat && userLng) {
      templeList.sort((a: any, b: any) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return res.json({ success: true, totalCount: templeList.length, data: templeList });
  } catch (error) {
    console.error("🔥 Fetch Temples Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 2. GET /api/temples/photo — Route ให้บริการโหลดรูปภาพ (ต้องอยู่ก่อน /:id)
router.get("/photo", async (req: Request, res: Response) => {
  try {
    const { name, maxHeight = "600", maxWidth = "800" } = req.query as {
      name?: string;
      maxHeight?: string;
      maxWidth?: string;
    };
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!name || !apiKey) {
      return res.status(400).send("Missing photo resource name or API key");
    }

    const targetUrl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&skipHttpRedirect=true`;

    const googleRes = await fetch(targetUrl, {
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
    });

    const data: any = await googleRes.json();

    if (data.photoUri) {
      return res.redirect(data.photoUri);
    }

    return res.status(404).send("Photo not found");
  } catch (err) {
    console.error("🔥 Photo Proxy Error:", err);
    return res.status(500).send("Error fetching photo");
  }
});

// 🟢 3. GET /api/temples/:id — ดึงรายละเอียดวัด + รูปภาพ + รีวิวทั้งหมด
router.get("/:id", async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const googlePlaceId = req.params.id;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: "API Key ไม่ถูกต้อง" });
    }

    // 1. ดึงข้อมูลจาก Google Places API
    const googleResponse = await fetch(
      `https://places.googleapis.com/v1/places/${googlePlaceId}`,
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

    const place: any = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("🔥 Google Place Detail Error:", place);
      return res.status(googleResponse.status).json({ success: false, error: place.error });
    }

    let imageUrl = "";
    if (place.photos && Array.isArray(place.photos) && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      imageUrl = `/api/temples/photo?name=${encodeURIComponent(photoName)}&maxHeight=800&maxWidth=1000`;
    }

    const googleReviews = (place.reviews || []).map((rev: any) => ({
      author: rev.authorAttribution?.displayName || "ผู้ใช้งาน Google Maps",
      rating: rev.rating || 5,
      relativeTime: rev.relativePublishTimeDescription || "",
      text: rev.text?.text || "",
      source: "Google Maps",
    }));

    // 2. ดึงรีวิวจาก PostgreSQL ของเรา
    let localReviewsFormatted: any[] = [];
    try {
      const [existingTemple] = await db
        .select()
        .from(temples)
        .where(eq(temples.googlePlaceId, googlePlaceId))
        .limit(1);

      if (existingTemple) {
        const dbReviews = await db
          .select({
            id: reviews.id,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            authorName: users.name,
          })
          .from(reviews)
          .leftJoin(users, eq(reviews.userId, users.id))
          .where(eq(reviews.templeId, existingTemple.id))
          .orderBy(desc(reviews.createdAt));

        localReviewsFormatted = dbReviews.map((r) => ({
          author: r.authorName || "ผู้ใช้งานในระบบ",
          rating: r.rating,
          relativeTime: new Date(r.createdAt).toLocaleDateString("th-TH"),
          text: r.comment || "",
          source: "แอปขอส่วนบุญ",
        }));
      }
    } catch (dbErr) {
      console.warn("⚠️ Query local reviews warning (ข้ามไปใช้รีวิว Google ก่อน):", dbErr);
    }

    const combinedReviews = [...localReviewsFormatted, ...googleReviews];

    const templeDetail = {
      id: place.id,
      name: place.displayName?.text || "ไม่ระบุชื่อ",
      address: place.formattedAddress || "",
      imageUrl: imageUrl,
      rating: place.rating || 0,
      userRatingCount: (place.userRatingCount || 0) + localReviewsFormatted.length,
      location: { lat: place.location?.latitude, lng: place.location?.longitude },
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${place.location?.latitude},${place.location?.longitude}&query_place_id=${place.id}`,
      reviews: combinedReviews,
    };

    return res.json({ success: true, data: templeDetail });
  } catch (error) {
    console.error("🔥 Fetch Detail Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 4. POST /api/temples/:id/reviews — บันทึกรีวิวลงฐานข้อมูล PostgreSQL
router.post("/:id/reviews", async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const googlePlaceId = req.params.id;
    const { rating, text, authorName = "ผู้ใช้งานทั่วไป", templeName = "", address = "", lat = 0, lng = 0 } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุคะแนนดาว (rating) ระหว่าง 1 - 5",
      });
    }

    // 1. ตรวจสอบ Token
    let currentUserId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "khorsuanboon_super_secret_key_2026");
        currentUserId = decoded.id || decoded.userId;
      } catch (err) {
        // Token หมดอายุหรือไม่ถูกต้อง
      }
    }

    if (!currentUserId) {
      const firstUser = await db.query.users.findFirst();
      if (firstUser) {
        currentUserId = firstUser.id;
      } else {
        const [newUser] = await db
          .insert(users)
          .values({ name: authorName || "ผู้ใช้งานทั่วไป", email: `guest_${Date.now()}@example.com` })
          .returning();
        currentUserId = newUser.id;
      }
    }

    // 2. เช็คว่ามีวัดใน Database หรือยัง
    let templeRecord = await db.query.temples.findFirst({
      where: eq(temples.googlePlaceId, googlePlaceId),
    });

    if (!templeRecord) {
      const [newTemple] = await db
        .insert(temples)
        .values({
          googlePlaceId: googlePlaceId,
          name: templeName || "วัด",
          address: address || "",
          latitude: Number(lat) || 0,
          longitude: Number(lng) || 0,
        })
        .returning();
      templeRecord = newTemple;
    }

    // 3. เพิ่มรีวิว
    const [insertedReview] = await db
      .insert(reviews)
      .values({
        userId: currentUserId,
        templeId: templeRecord.id,
        rating: Number(rating),
        comment: text || "",
      })
      .returning();

    const reviewer = await db.query.users.findFirst({
      where: eq(users.id, currentUserId!),
    });

    return res.status(201).json({
      success: true,
      message: "เพิ่มรีวิวเรียบร้อยแล้ว",
      data: {
        id: insertedReview.id,
        author: reviewer?.name || authorName,
        rating: insertedReview.rating,
        text: insertedReview.comment,
        relativeTime: "เมื่อสักครู่",
        source: "แอปขอส่วนบุญ",
      },
    });
  } catch (error) {
    console.error("🔥 Create Review Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;