import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import styles from "./Temple.module.css";

interface TempleItem {
  id: string;
  name: string;
  address: string;
  rating: number;
  userRatingCount: number;
  distanceKm: number | null;
  mapsUrl: string;
  imageUrl?: string;
  location?: { lat: number; lng: number };
}

interface Review {
  author: string;
  rating: number;
  relativeTime?: string;
  text: string;
  source?: string;
}

interface TempleDetail extends TempleItem {
  reviews: Review[];
}

const getFullImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `http://localhost:3001${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function Temple() {
  const [temples, setTemples] = useState<TempleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedTemple, setSelectedTemple] = useState<TempleDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // 1. ค้นหาวัดใกล้ฉันผ่าน GPS
  const fetchNearbyTemples = () => {
    if (!navigator.geolocation) {
      setErrorMsg("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        try {
          const res = await api.get("/temples", {
            params: { lat: latitude, lng: longitude, radius: "10000" },
          });

          if (res.data.success) {
            setTemples(res.data.data);
          } else {
            setErrorMsg(res.data.message || "ไม่สามารถดึงข้อมูลวัดได้");
          }
        } catch (err: any) {
          setErrorMsg(err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setErrorMsg("กรุณาอนุญาตการเข้าถึงพิกัดตำแหน่ง (Location Permission)");
      }
    );
  };

  // 2. ค้นหาวัดด้วยข้อความ (ค้นหาได้ทั่วไทย)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const params: any = { query: searchQuery.trim() };
      if (userCoords) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
      }

      const res = await api.get("/temples", { params });
      if (res.data.success) {
        setTemples(res.data.data);
      } else {
        setErrorMsg(res.data.message || "ไม่พบข้อมูลวัดที่ค้นหา");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyTemples();
  }, []);

  const handleOpenDetail = async (id: string) => {
    setPageLoading(true);
    setShowReviewForm(false);
    try {
      const res = await api.get(`/temples/${id}`);
      if (res.data.success) {
        setSelectedTemple(res.data.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      alert("ไม่สามารถดึงข้อมูลรายละเอียดได้");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemple) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/temples/${selectedTemple.id}/reviews`, {
        rating: newRating,
        text: newComment,
        authorName: authorName || "ผู้ใช้งานทั่วไป",
        templeName: selectedTemple.name,
        address: selectedTemple.address,
        lat: selectedTemple.location?.lat,
        lng: selectedTemple.location?.lng,
      });

      if (res.data.success) {
        alert("เพิ่มรีวิวเรียบร้อยแล้ว!");
        setSelectedTemple({
          ...selectedTemple,
          reviews: [
            {
              author: res.data.data.author,
              rating: res.data.data.rating,
              text: res.data.data.text,
              relativeTime: "เมื่อสักครู่",
              source: "แอปขอส่วนบุญ",
            },
            ...selectedTemple.reviews,
          ],
        });
        setNewComment("");
        setShowReviewForm(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "ไม่สามารถส่งรีวิวได้");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className={styles.container}>
      {pageLoading && <div className={styles.statusMessage}>กำลังเปิดหน้าวัด...</div>}

      {!pageLoading && selectedTemple ? (
        /* DETAIL VIEW */
        <div className={styles.detailView}>
          <div className={styles.heroContainer}>
            <button className={styles.backButton} onClick={() => setSelectedTemple(null)}>
              ← ย้อนกลับ
            </button>
            {selectedTemple.imageUrl ? (
              <img
                src={getFullImageUrl(selectedTemple.imageUrl)}
                alt={selectedTemple.name}
                className={styles.heroImage}
              />
            ) : (
              <div className={styles.heroPlaceholder}>
                <span style={{ fontSize: "3rem", marginBottom: "6px" }}>🏛️</span>
                <span>ไม่มีรูปภาพตัวอย่าง</span>
              </div>
            )}
          </div>

          <div className={styles.detailBody}>
            <h1 className={styles.detailTitle}>{selectedTemple.name}</h1>
            <p className={styles.detailAddress}>📍 {selectedTemple.address}</p>

            <div className={styles.navRow}>
              <div className={styles.ratingRow}>
                <span className={styles.starScore}>★ {selectedTemple.rating || "-"}</span>
                <span className={styles.reviewCount}>({selectedTemple.userRatingCount} รีวิว)</span>
              </div>
              <a
                href={selectedTemple.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.navigateButton}
              >
                นำทางด้วย Google Maps
              </a>
            </div>

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                รีวิวทั้งหมด ({selectedTemple.reviews?.length || 0})
              </h2>
              <button
                className={styles.addReviewBtn}
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "ปิดแบบฟอร์ม" : "เขียนรีวิว"}
              </button>
            </div>

            {showReviewForm && (
              <form className={styles.reviewFormCard} onSubmit={handleSubmitReview}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.98rem", color: "var(--sms-maroon)" }}>
                  แบ่งปันประสบการณ์ทำบุญ
                </h3>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="ชื่อของคุณ (ไม่ระบุก็ได้)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />

                <div className={styles.ratingSelectGroup}>
                  <label>ให้คะแนน:</label>
                  <select
                    className={styles.selectBox}
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 ดาว)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 ดาว)</option>
                    <option value={3}>⭐⭐⭐ (3 ดาว)</option>
                    <option value={2}>⭐⭐ (2 ดาว)</option>
                    <option value={1}>⭐ (1 ดาว)</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  className={styles.formTextarea}
                  placeholder="เล่าความประทับใจ บรรยากาศ หรือการกราบไหว้..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />

                <button type="submit" className={styles.submitBtn} disabled={submittingReview}>
                  {submittingReview ? "กำลังบันทึก..." : "ส่งรีวิว"}
                </button>
              </form>
            )}

            <div className={styles.reviewList}>
              {selectedTemple.reviews && selectedTemple.reviews.length > 0 ? (
                selectedTemple.reviews.map((rev, idx) => (
                  <div key={idx} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <span className={styles.reviewerName}>{rev.author}</span>
                        {rev.source && <span className={styles.sourceBadge}>{rev.source}</span>}
                      </div>
                      <span className={styles.starScore}>{"★".repeat(rev.rating)}</span>
                    </div>
                    <p className={styles.reviewText}>{rev.text || "ไม่มีข้อความรีวิว"}</p>
                    <span className={styles.reviewDate}>{rev.relativeTime}</span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>ยังไม่มีรีวิวสำหรับวัดนี้ ร่วมรีวิวเป็นคนแรกได้เลย!</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className={styles.listView}>
          <header className={styles.header}>
            <h2 className={styles.title}>ค้นหาวัด</h2>
            <p className={styles.subtitle}>ค้นหาวัดรอบตัวคุณ หรือพิมพ์ค้นหาวัดทั่วประเทศ</p>
          </header>

          {/* Form ค้นหาด้วยคีย์เวิร์ด */}
          <form onSubmit={handleSearchSubmit} className={styles.searchWrapper}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="พิมพ์ชื่อวัด ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.primaryButton} style={{ borderRadius: "25px", whiteSpace: "nowrap" }}>
                ค้นหา
              </button>
            </div>
          </form>

          <div className={styles.filterBar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setSearchQuery("");
                fetchNearbyTemples();
              }}
            >
              📍 ใกล้ฉัน
            </button>
          </div>

          {loading && <div className={styles.statusMessage}>กำลังค้นหาข้อมูลวัด...</div>}
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

          {!loading && temples.length === 0 && !errorMsg && (
            <div className={styles.emptyState}>
              <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "8px" }}>🏛️</span>
              <p>ไม่พบข้อมูลวัด ลองเปลี่ยนคำค้นหาใหม่</p>
            </div>
          )}

          <div className={styles.listContainer}>
            {temples.map((temple) => (
              <div
                key={temple.id}
                className={styles.templeCard}
                onClick={() => handleOpenDetail(temple.id)}
              >
                <div className={styles.templeCardContent}>
                  {temple.imageUrl ? (
                    <img
                      src={getFullImageUrl(temple.imageUrl)}
                      alt={temple.name}
                      className={styles.templeThumb}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.templeThumbPlaceholder}>🏛️</div>
                  )}

                  <div className={styles.templeCardInfo}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.templeName}>{temple.name}</h3>
                      {temple.distanceKm !== null && (
                        <span className={styles.distanceBadge}>{temple.distanceKm} กม.</span>
                      )}
                    </div>

                    <p className={styles.addressText}>
                      📍 {temple.address || "ไม่มีข้อมูลที่อยู่"}
                    </p>

                    <div className={styles.cardFooter}>
                      <div className={styles.ratingRow}>
                        <span className={styles.starScore}>★ {temple.rating || "-"}</span>
                        <span className={styles.reviewCount}>({temple.userRatingCount} รีวิว)</span>
                      </div>
                      <span className={styles.viewDetailText}>ดูรายละเอียด →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}