import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import styles from "./Temple.module.css";

import iconTemple from '../assets/icon/iconTemple.png';

// Minimal Clean SVG Icons (ไม่พึ่งพา third-party ลดปัญหา hook conflict)
const Icons = {
  Search: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  MapPin: ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Landmark: ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="22" y2="22" />
      <line x1="12" x2="12" y1="2" y2="6" />
      <path d="m2 6 10-4 10 4" />
      <line x1="6" x2="6" y1="10" y2="18" />
      <line x1="10" x2="10" y1="10" y2="18" />
      <line x1="14" x2="14" y1="10" y2="18" />
      <line x1="18" x2="18" y1="10" y2="18" />
    </svg>
  ),
  Star: ({ size = 12, fill = "#D4AF37" }: { size?: number; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ArrowLeft: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" x2="5" y1="12" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  ArrowRight: ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Navigation: ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
  PenTool: ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
};

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

  // 2. ค้นหาวัดด้วยข้อความ
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
            <button type="button" className={styles.backButton} onClick={() => setSelectedTemple(null)}>
              <Icons.ArrowLeft size={16} />
              <span>ย้อนกลับ</span>
            </button>
            {selectedTemple.imageUrl ? (
              <img
                src={getFullImageUrl(selectedTemple.imageUrl)}
                alt={selectedTemple.name}
                className={styles.heroImage}
              />
            ) : (
              <div className={styles.heroPlaceholder}>
                <Icons.Landmark size={46} color="var(--sms-sub)" />
                <span style={{ marginTop: 8 }}>ไม่มีรูปภาพตัวอย่าง</span>
              </div>
            )}
          </div>

          <div className={styles.detailBody}>
            <h1 className={styles.detailTitle}>{selectedTemple.name}</h1>
            <p className={styles.detailAddress}>
              <Icons.MapPin size={14} color="var(--sms-gold)" />
              <span>{selectedTemple.address}</span>
            </p>

            <div className={styles.navRow}>
              <div className={styles.ratingRow}>
                <Icons.Star size={16} fill="var(--sms-gold)" />
                <span className={styles.starScore}>{selectedTemple.rating || "-"}</span>
                <span className={styles.reviewCount}>({selectedTemple.userRatingCount} รีวิว)</span>
              </div>
              <a
                href={selectedTemple.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.navigateButton}
              >
                <Icons.Navigation size={15} />
                <span>นำทางด้วย Google Maps</span>
              </a>
            </div>

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                รีวิวทั้งหมด ({selectedTemple.reviews?.length || 0})
              </h2>
              <button
                type="button"
                className={styles.addReviewBtn}
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                <Icons.PenTool size={13} />
                <span>{showReviewForm ? "ปิดแบบฟอร์ม" : "เขียนรีวิว"}</span>
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
                    <option value={5}>5 ดาว (ยอดเยี่ยม)</option>
                    <option value={4}>4 ดาว (ดีมาก)</option>
                    <option value={3}>3 ดาว (ปานกลาง)</option>
                    <option value={2}>2 ดาว (พอใช้)</option>
                    <option value={1}>1 ดาว (ควรปรับปรุง)</option>
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
                      <div className={styles.starRow}>
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Icons.Star key={i} size={11} fill="var(--sms-gold)" />
                        ))}
                      </div>
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
  <img src={iconTemple} alt="วัด" className="templeThumb"/>
          <header className={styles.header}>
  <h2 className={styles.title}>ค้นหาวัด</h2>
  <p className={styles.subtitle}>ค้นหาวัดรอบตัวคุณ หรือพิมพ์ค้นหาวัดทั่วประเทศ</p>
</header>

          {/* Form ค้นหาด้วยคีย์เวิร์ด */}
          <form onSubmit={handleSearchSubmit} className={styles.searchWrapper}>
            <div className={styles.searchBarBox}>
              <span className={styles.searchIcon}>
                <Icons.Search size={17} color="var(--sms-sub)" />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="พิมพ์ชื่อวัด หรือสถานที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>
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
              <Icons.MapPin size={14} />
              <span>ค้นหาวัดใกล้ฉัน</span>
            </button>
          </div>

          {loading && <div className={styles.statusMessage}>กำลังค้นหาข้อมูลวัด...</div>}
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

          {!loading && temples.length === 0 && !errorMsg && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Icons.Landmark size={36} color="var(--sms-sub)" />
              </div>
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
                    <div className={styles.templeThumbPlaceholder}>
                      <Icons.Landmark size={28} color="var(--sms-gold)" />
                    </div>
                  )}

                  <div className={styles.templeCardInfo}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.templeName}>{temple.name}</h3>
                      {temple.distanceKm !== null && (
                        <span className={styles.distanceBadge}>{temple.distanceKm} กม.</span>
                      )}
                    </div>

                    <p className={styles.addressText}>
                      <Icons.MapPin size={12} color="var(--sms-sub)" />
                      <span>{temple.address || "ไม่มีข้อมูลที่อยู่"}</span>
                    </p>

                    <div className={styles.cardFooter}>
                      <div className={styles.ratingRow}>
                        <Icons.Star size={13} fill="var(--sms-gold)" />
                        <span className={styles.starScore}>{temple.rating || "-"}</span>
                        <span className={styles.reviewCount}>({temple.userRatingCount} รีวิว)</span>
                      </div>
                      <span className={styles.viewDetailText}>
                        <span>ดูรายละเอียด</span>
                        <Icons.ArrowRight size={13} />
                      </span>
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