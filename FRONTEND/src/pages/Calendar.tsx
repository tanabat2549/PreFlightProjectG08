import React, { useEffect, useState, useMemo } from 'react';
import { getActivityGuide } from '../constants/activityGuides';
import styles from './Calendar.module.css';

// Clean SVG Icons
const Icons = {
  Calendar: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Lotus: ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-2 4-5 7-5 11a5 5 0 0 0 10 0c0-4-3-7-5-11z" />
      <path d="M7 14c-3-1-5-3-5-6 3 0 6 2 7 6" />
      <path d="M17 14c3-1 5-3 5-6-3 0-6 2-7 6" />
    </svg>
  ),
  Note: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  ),
  Sparkle: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  ChevronDown: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronLeft: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Info: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Close: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

interface ActivityItem {
  id: string;
  title: string;
  category: 'alms' | 'precept' | 'chant' | 'offering' | 'general';
  icon: string;
}

interface AuspiciousDay {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  isBuddhaDay: boolean;
  isAuspiciousDay: boolean;
  recommendedActivities: ActivityItem[];
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const activityColorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  alms: { bg: '#FFFBF5', border: '#FED7AA', text: '#9A3412', iconBg: '#FFEDD5' },
  precept: { bg: '#F6FDF9', border: '#BBF7D0', text: '#166534', iconBg: '#DCFCE7' },
  chant: { bg: '#FEFDF0', border: '#FEF08A', text: '#854D0E', iconBg: '#FEF9C3' },
  offering: { bg: '#FAF7FD', border: '#E9D5FF', text: '#6B21A8', iconBg: '#F3E8FF' },
  general: { bg: '#F9FAFB', border: '#E5E7EB', text: '#374151', iconBg: '#F3F4F6' },
};

function formatThaiDate(dateString?: string) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  return `${thaiDays[dateObj.getDay()]}ที่ ${day} ${THAI_MONTHS[dateObj.getMonth()]} ${year + 543}`;
}

function ExpandableActivityCard({
  act,
  theme,
}: {
  act: ActivityItem;
  theme: { bg: string; border: string; text: string; iconBg: string };
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const guide = getActivityGuide(act.title);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`${styles.activityCard} ${isExpanded ? styles.activityExpanded : ''}`}
      style={{
        backgroundColor: theme.bg,
        borderColor: isExpanded ? theme.text : theme.border,
      }}
    >
      <div className={styles.activityHeader} style={{ color: theme.text }}>
        <div className={styles.activityMain}>
          <div className={styles.activityIconBox} style={{ backgroundColor: theme.iconBg }}>
            <span className={styles.activityIconCustom}>{act.icon}</span>
          </div>
          <div>
            <span className={styles.activityTitle}>{act.title}</span>
            <span className={styles.activityHint}>
              {isExpanded ? 'คลิกเพื่อย่อ' : 'คลิกเพื่อดูแนวทาง & อานิสงส์'}
            </span>
          </div>
        </div>

        <div className={`${styles.chevronWrapper} ${isExpanded ? styles.rotated : ''}`}>
          <Icons.ChevronDown size={14} color={theme.text} />
        </div>
      </div>

      {isExpanded && (
        <div className={styles.activityDetails} style={{ borderTopColor: theme.border }}>
          <div className={styles.detailRow}>
            <span className={styles.detailIconWrapper}>
              <Icons.Note size={15} color={theme.text} />
            </span>
            <div>
              <strong className={styles.detailLabel} style={{ color: theme.text }}>
                แนวทางการปฏิบัติ:
              </strong>
              <span className={styles.detailContent}>{guide.howTo}</span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailIconWrapper}>
              <Icons.Sparkle size={15} color={theme.text} />
            </span>
            <div>
              <strong className={styles.detailLabel} style={{ color: theme.text }}>
                อานิสงส์ / ผลบุญที่ได้รับ:
              </strong>
              <span className={styles.detailContent}>{guide.benefits}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Calendar() {
  const [viewMode, setViewMode] = useState<'next' | 'month' | 'year'>('next');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const [nextDayData, setNextDayData] = useState<AuspiciousDay | null>(null);
  const [monthDaysMap, setMonthDaysMap] = useState<Record<number, AuspiciousDay>>({});
  const [selectedDayDetail, setSelectedDayDetail] = useState<AuspiciousDay | null>(null);
  const [yearGroupedData, setYearGroupedData] = useState<Record<number, AuspiciousDay[]>>({});
  const [loading, setLoading] = useState(true);

  const [activeQuarter, setActiveQuarter] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [yearModalDay, setYearModalDay] = useState<AuspiciousDay | null>(null);

  // 1. วันพระถัดไป
  useEffect(() => {
    if (viewMode === 'next') {
      setLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const localToday = `${year}-${month}-${day}`;

      fetch(`/api/calendar/next?today=${localToday}`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((res) => {
          if (res.success && res.data) {
            setNextDayData(res.data);
          } else {
            setNextDayData(null);
          }
        })
        .catch(() => setNextDayData(null))
        .finally(() => setLoading(false));
    }
  }, [viewMode]);

  // 2. วันพระรายเดือน
  useEffect(() => {
    if (viewMode === 'month') {
      setLoading(true);
      fetch(`/api/calendar/auspicious-days?month=${selectedMonth}&year=${selectedYear}`)
        .then((res) => res.json())
        .then((res) => {
          const mapping: Record<number, AuspiciousDay> = {};
          (res.data || []).forEach((item: AuspiciousDay) => {
            const dayNum = Number(item.date.split('-')[2]);
            mapping[dayNum] = item;
          });
          setMonthDaysMap(mapping);
          const firstBuddhaDay = Object.values(mapping)[0] || null;
          setSelectedDayDetail(firstBuddhaDay);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [viewMode, selectedMonth, selectedYear]);

  // 3. วันพระรายปี
  useEffect(() => {
    if (viewMode === 'year') {
      setLoading(true);
      fetch(`/api/calendar/year-grouped?year=${selectedYear}`)
        .then((res) => res.json())
        .then((res) => res.success && setYearGroupedData(res.data || {}))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [viewMode, selectedYear]);

  const yearlyStats = useMemo(() => {
    let totalBuddha = 0;
    let totalAuspicious = 0;
    let majorHolidays = 0;

    Object.values(yearGroupedData).forEach((days) => {
      days.forEach((d) => {
        if (d.isBuddhaDay) totalBuddha++;
        if (d.isAuspiciousDay) totalAuspicious++;
        if (d.title.includes('บูชา') || d.title.includes('พรรษา') || d.title.includes('สงกรานต์')) {
          majorHolidays++;
        }
      });
    });

    return { totalBuddha, totalAuspicious, majorHolidays };
  }, [yearGroupedData]);

  const displayedMonths = useMemo(() => {
    if (activeQuarter === 'all') return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (activeQuarter === 1) return [1, 2, 3];
    if (activeQuarter === 2) return [4, 5, 6];
    if (activeQuarter === 3) return [7, 8, 9];
    return [10, 11, 12];
  }, [activeQuarter]);

  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header & Tabs */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.mainTitle}>
            <span className={styles.titleIconBadge}>
              <Icons.Calendar size={22} color="var(--sms-gold)" />
            </span>
            <span>ปฏิทินวันพระ & วันมงคล</span>
          </h2>
          <p className={styles.yearSubtitle}>พุทธศักราช {selectedYear + 543}</p>
        </div>

        <div className={styles.tabContainer}>
          {[
            { id: 'next', label: 'วันพระถัดไป' },
            { id: 'month', label: 'ปฏิทินเดือน' },
            { id: 'year', label: 'ภาพรวมทั้งปี' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id as any)}
              className={`${styles.tabButton} ${viewMode === tab.id ? styles.activeTab : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>กำลังเตรียมข้อมูลมงคลประจำปี...</div>
      ) : (
        <>
          {/* ================= VIEW 1: วันพระถัดไป ================= */}
          {viewMode === 'next' && (
            <div className={styles.nextViewWrapper}>
              <div className={styles.nextHeroBanner}>
                <div className={styles.bannerTagRow}>
                  <Icons.Lotus size={16} color="#D97706" />
                  <span className={styles.bannerTagText}>วันพระถัดไป</span>
                </div>
                <div className={styles.bannerDateText}>
                  {formatThaiDate(nextDayData?.date) || 'ไม่มีข้อมูลวันพระ'}
                </div>
                {nextDayData?.title && (
                  <div className={styles.bannerTitleText}>{nextDayData.title}</div>
                )}
              </div>

              <div className={styles.activitiesHeaderRow}>
                <span className={styles.sectionSubtitle}>กิจกรรมแนะนำประจำวัน</span>
                <span className={styles.tipNotice}>
                  <Icons.Info size={13} />
                  <span>คลิกที่แถบเพื่อดูกิจกรรม & อานิสงส์</span>
                </span>
              </div>

              <div className={styles.activityList}>
                {nextDayData?.recommendedActivities?.map((act) => {
                  const theme = activityColorMap[act.category] || activityColorMap.general;
                  return <ExpandableActivityCard key={act.id} act={act} theme={theme} />;
                })}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: ตารางปฏิทินรายเดือน ================= */}
          {viewMode === 'month' && (
            <div className={styles.monthViewWrapper}>
              <div className={styles.monthNavRow}>
                <button type="button" onClick={prevMonth} className={styles.arrowButton}>
                  <Icons.ChevronLeft size={16} />
                </button>
                <div className={styles.monthTitleText}>
                  {THAI_MONTHS[selectedMonth - 1]} {selectedYear + 543}
                </div>
                <button type="button" onClick={nextMonth} className={styles.arrowButton}>
                  <Icons.ChevronRight size={16} />
                </button>
              </div>

              <div className={styles.calendarCard}>
                <div className={styles.weekdaysHeader}>
                  {WEEKDAYS.map((w, idx) => (
                    <div key={w} className={`${styles.weekdayCell} ${idx === 0 ? styles.sunday : ''}`}>
                      {w}
                    </div>
                  ))}
                </div>

                <div className={styles.daysGrid}>
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDayCell} />
                  ))}

                  {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const buddhaDay = monthDaysMap[day];
                    const isSelected =
                      selectedDayDetail && Number(selectedDayDetail.date.split('-')[2]) === day;

                    return (
                      <div
                        key={day}
                        onClick={() => buddhaDay && setSelectedDayDetail(buddhaDay)}
                        className={`
                          ${styles.dayCell}
                          ${buddhaDay ? styles.isBuddhaDayCell : ''}
                          ${isSelected ? styles.selectedDayCell : ''}
                        `}
                      >
                        <span className={styles.dayNumber}>{day}</span>
                        {buddhaDay && (
                          <span className={styles.lotusIconMarker}>
                            <Icons.Lotus size={12} color="var(--sms-maroon)" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDayDetail && (
                <div className={styles.dayDetailCard}>
                  <div className={styles.dayDetailHeader}>
                    <span className={styles.dayDetailLabel}>
                      <Icons.Lotus size={14} color="#D97706" />
                      <span>รายละเอียดวันพระ</span>
                    </span>
                    {selectedDayDetail.isAuspiciousDay && (
                      <span className={styles.auspiciousBadge}>วันมงคล</span>
                    )}
                  </div>
                  <div className={styles.dayDetailDate}>
                    {formatThaiDate(selectedDayDetail.date)}
                  </div>
                  <div className={styles.dayDetailTitle}>{selectedDayDetail.title}</div>

                  {selectedDayDetail.recommendedActivities?.length > 0 && (
                    <div>
                      <div className={styles.recommendLabel}>
                        กิจกรรมแนะนำประจำวัน (คลิกเพื่อดูกิจกรรม & อานิสงส์):
                      </div>
                      <div className={styles.activityList}>
                        {selectedDayDetail.recommendedActivities.map((act) => {
                          const theme = activityColorMap[act.category] || activityColorMap.general;
                          return <ExpandableActivityCard key={act.id} act={act} theme={theme} />;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW 3: ภาพรวมรายปี ================= */}
          {viewMode === 'year' && (
            <div className={styles.yearViewWrapper}>
              {/* Year Summary Hero */}
              <div className={styles.yearHeroCard}>
                <div className={styles.yearHeroTop}>
                  <h3 className={styles.yearHeroTitle}>วันพระและวันมงคลตลอดปี</h3>
                  <div className={styles.peaceBadge}>ร่มเย็นเป็นสุขตลอดปี</div>
                </div>

                <div className={styles.yearStatsGrid}>
                  <div className={styles.statCol}>
                    <div className={styles.statLabel}>วันพระทั้งหมด</div>
                    <div className={styles.statNumber}>
                      {yearlyStats.totalBuddha} <span className={styles.statUnit}>วัน</span>
                    </div>
                  </div>
                  <div className={styles.statCol}>
                    <div className={styles.statLabel}>วันพระใหญ่</div>
                    <div className={styles.statNumber}>
                      {yearlyStats.majorHolidays} <span className={styles.statUnit}>วัน</span>
                    </div>
                  </div>
                  <div className={styles.statCol}>
                    <div className={styles.statLabel}>วันมงคลฤกษ์ดี</div>
                    <div className={styles.statNumber}>
                      {yearlyStats.totalAuspicious} <span className={styles.statUnit}>วัน</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className={styles.yearFilterRow}>
                <div className={styles.quarterFilters}>
                  {[
                    { id: 'all', label: 'ทั้งหมด (12 เดือน)' },
                    { id: 1, label: 'ไตรมาส 1 (ม.ค. - มี.ค.)' },
                    { id: 2, label: 'ไตรมาส 2 (เม.ย. - มิ.ย.)' },
                    { id: 3, label: 'ไตรมาส 3 (ก.ค. - ก.ย.)' },
                    { id: 4, label: 'ไตรมาส 4 (ต.ค. - ธ.ค.)' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveQuarter(filter.id as any)}
                      className={`
                        ${styles.quarterBtn}
                        ${activeQuarter === filter.id ? styles.activeQuarterBtn : ''}
                      `}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className={styles.yearTipNotice}>
                  <Icons.Info size={13} />
                  <span>คลิกที่การ์ดเพื่อดูกิจกรรมแนะนำ</span>
                </div>
              </div>

              {/* Months Grid */}
              <div className={styles.monthsGrid}>
                {displayedMonths.map((monthNum) => {
                  const monthName = THAI_MONTHS[monthNum - 1];
                  const daysInMonth = yearGroupedData[monthNum] || [];

                  return (
                    <div key={monthNum} className={styles.monthMiniCard}>
                      <div className={styles.monthMiniHeader}>
                        <div className={styles.monthBadgeGroup}>
                          <div className={styles.monthNumberBadge}>{monthNum}</div>
                          <span className={styles.monthCardTitle}>{monthName}</span>
                        </div>
                        <span
                          className={`
                            ${styles.buddhaDayCounter}
                            ${daysInMonth.length > 0 ? styles.counterActive : styles.counterEmpty}
                          `}
                        >
                          {daysInMonth.length} วันพระ
                        </span>
                      </div>

                      {daysInMonth.length === 0 ? (
                        <div className={styles.emptyMonthNotice}>ไม่มีวันพระในเดือนนี้</div>
                      ) : (
                        <div className={styles.monthDaysList}>
                          {daysInMonth.map((dayItem) => {
                            const dayNum = Number(dayItem.date.split('-')[2]);
                            const isMajor =
                              dayItem.title.includes('บูชา') ||
                              dayItem.title.includes('พรรษา') ||
                              dayItem.isAuspiciousDay;

                            return (
                              <div
                                key={dayItem.id}
                                onClick={() => setYearModalDay(dayItem)}
                                className={`
                                  ${styles.yearDayItem}
                                  ${isMajor ? styles.majorDayItem : ''}
                                `}
                              >
                                <div className={styles.yearDayItemLeft}>
                                  <div
                                    className={`
                                      ${styles.yearDayNumBox}
                                      ${isMajor ? styles.majorNumBox : ''}
                                    `}
                                  >
                                    {dayNum}
                                  </div>
                                  <div className={styles.yearDayTextWrap}>
                                    <span
                                      className={`
                                        ${styles.yearDayTitle}
                                        ${isMajor ? styles.majorDayTitle : ''}
                                      `}
                                    >
                                      {dayItem.title}
                                    </span>
                                    {dayItem.recommendedActivities?.length > 0 && (
                                      <span className={styles.yearDayActivitiesCount}>
                                        {dayItem.recommendedActivities.length} กิจกรรมแนะนำ
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.yearDayItemRight}>
                                  {isMajor && <span className={styles.miniAuspiciousBadge}>วันมงคล</span>}
                                  <Icons.Lotus size={14} color={isMajor ? '#B45309' : '#D4AF37'} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= MODAL SLIDE-UP ================= */}
          {yearModalDay && (
            <div className={styles.modalOverlay} onClick={() => setYearModalDay(null)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <div>
                    <span className={styles.modalTopLabel}>
                      <Icons.Lotus size={14} color="#D97706" />
                      <span>รายละเอียดวันพระ</span>
                    </span>
                    <h3 className={styles.modalTitle}>{formatThaiDate(yearModalDay.date)}</h3>
                    <p className={styles.modalSubtitle}>{yearModalDay.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setYearModalDay(null)}
                    className={styles.modalCloseBtn}
                  >
                    <Icons.Close size={16} />
                  </button>
                </div>

                <div className={styles.modalDivider} />

                <div>
                  <div className={styles.recommendLabel}>
                    กิจกรรมแนะนำประจำวัน (คลิกเพื่อดูกิจกรรม & อานิสงส์):
                  </div>
                  <div className={styles.activityList}>
                    {yearModalDay.recommendedActivities?.length > 0 ? (
                      yearModalDay.recommendedActivities.map((act) => {
                        const theme = activityColorMap[act.category] || activityColorMap.general;
                        return <ExpandableActivityCard key={act.id} act={act} theme={theme} />;
                      })
                    ) : (
                      <div className={styles.emptyActivityNotice}>ไม่มีกิจกรรมแนะนำพิเศษ</div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setYearModalDay(null)}
                  className={styles.modalBottomBtn}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}