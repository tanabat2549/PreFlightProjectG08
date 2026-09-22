import { Router } from "express";
import type { Request, Response } from "express";

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

interface NearbyQueryParams {
  lat?: string;
  lng?: string;
  radius?: string;
}

interface ReviewBody {
  rating: number;
  text: string;
  authorName?: string;
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
}

interface GoogleSearchResponse {
  places?: GooglePlaceItem[];
  error?: any;
}

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
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount",
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

    const temples = places.map((place: GooglePlaceItem) => {
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
      };
    });

    temples.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({ success: true, totalCount: temples.length, data: temples });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 2. GET /api/temples/:id — ดึงรายละเอียดวัด + รีวิวทั้งหมด
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
            "id,displayName,formattedAddress,location,rating,userRatingCount,reviews",
        },
      }
    );

    const place = (await googleResponse.json()) as GooglePlaceItem & { error?: any };

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ success: false, error: place.error });
    }

    const templeDetail = {
      id: place.id,
      name: place.displayName?.text || "ไม่ระบุชื่อ",
      address: place.formattedAddress || "",
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      location: { lat: place.location?.latitude, lng: place.location?.longitude },
      reviews: (place.reviews || []).map((rev: GoogleReview) => ({
        author: rev.authorAttribution?.displayName || "ผู้ใช้งาน",
        rating: rev.rating || 0,
        relativeTime: rev.relativePublishTimeDescription || "",
        text: rev.text?.text || "",
      })),
    };

    return res.json({ success: true, data: templeDetail });
  } catch (error) {
    console.error("Fetch Detail Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🟢 3. POST /api/temples/:id/reviews — ให้ดาว (1-5) และเพิ่มข้อความรีวิว
router.post("/:id/reviews", async (req: Request<{ id: string }, {}, ReviewBody>, res: Response): Promise<Response> => {
  try {
    const templeId = req.params.id;
    const { rating, text, authorName = "ผู้ใช้งานทั่วไป" } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุคะแนนดาว (rating) ระหว่าง 1 - 5",
      });
    }

    const newReview = {
      templeId,
      author: authorName,
      rating,
      text: text || "",
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: "เพิ่มรีวิวเรียบร้อยแล้ว",
      data: newReview,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;