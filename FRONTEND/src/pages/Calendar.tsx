import { useEffect, useState, useMemo } from 'react';
import { getActivityGuide } from '../constants/activityGuides';

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
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
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

// Component สำหรับบล็อกกิจกรรมที่คลิกเพื่อกางดู How-to และ Benefits ได้
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        backgroundColor: theme.bg,
        border: `1.5px solid ${isExpanded ? theme.text : theme.border}`,
        boxShadow: isExpanded ? '0 6px 16px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          color: theme.text,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: theme.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            {act.icon}
          </div>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, display: 'block' }}>{act.title}</span>
            <span style={{ fontSize: '11px', opacity: 0.75, fontWeight: 500 }}>
              {isExpanded ? 'คลิกเพื่อย่อ' : 'คลิกเพื่อดูแนวทาง & อานิสงส์'}
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: '12px',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.7,
          }}
        >
          ▼
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            padding: '0 18px 16px 18px',
            borderTop: `1px dashed ${theme.border}`,
            marginTop: '-2px',
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '13.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '15px', flexShrink: 0 }}>📝</span>
            <div>
              <strong style={{ color: theme.text, display: 'block', marginBottom: '2px' }}>
                แนวทางการปฏิบัติ:
              </strong>
              <span style={{ lineHeight: '1.5', color: '#4B5563' }}>{guide.howTo}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '15px', flexShrink: 0 }}>✨</span>
            <div>
              <strong style={{ color: theme.text, display: 'block', marginBottom: '2px' }}>
                อานิสงส์ / ผลบุญที่ได้รับ:
              </strong>
              <span style={{ lineHeight: '1.5', color: '#4B5563' }}>{guide.benefits}</span>
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

  // 1. ดึงวันพระถัดไป
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

  // 2. ดึงวันพระรายเดือน
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

  // 3. ดึงรายปี
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
    <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto', padding: '24px 16px 120px', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ color: '#991B1B', margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📅</span> ปฏิทินวันพระ & วันมงคล
          </h2>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '13px' }}>
            พุทธศักราช {selectedYear + 543}
          </p>
        </div>

        <div style={{ display: 'inline-flex', backgroundColor: '#F3F4F6', borderRadius: '14px', padding: '4px', border: '1px solid #E5E7EB' }}>
          {[
            { id: 'next', label: 'วันพระถัดไป' },
            { id: 'month', label: 'ปฏิทินเดือน' },
            { id: 'year', label: 'ภาพรวมทั้งปี' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              style={{
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: viewMode === tab.id ? 700 : 500,
                cursor: 'pointer',
                backgroundColor: viewMode === tab.id ? '#FFFFFF' : 'transparent',
                color: viewMode === tab.id ? '#B91C1C' : '#4B5563',
                boxShadow: viewMode === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: '15px' }}>
          กำลังเตรียมข้อมูลมงคลประจำปี...
        </div>
      ) : (
        <>
          {/* ================= VIEW 1: วันพระถัดไป ================= */}
          {viewMode === 'next' && (
            <div style={{ border: '1px solid #F1F3F5', borderRadius: '24px', padding: '28px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ border: '1.5px solid #FDE68A', borderRadius: '18px', padding: '22px', background: 'linear-gradient(135deg, #FFFDF7 0%, #FEF9C3 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span>🪷</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#D97706' }}>วันพระถัดไป</span>
                </div>
                <div style={{ color: '#991B1B', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em' }}>
                  {formatThaiDate(nextDayData?.date) || 'ไม่มีข้อมูลวันพระ'}
                </div>
                {nextDayData?.title && <div style={{ fontSize: '15px', color: '#B45309', fontWeight: 600, marginTop: '4px' }}>{nextDayData.title}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#374151' }}>กิจกรรมแนะนำประจำวัน</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>💡 คลิกที่แถบเพื่อดูกิจกรรม & อานิสงส์</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {nextDayData?.recommendedActivities?.map((act) => {
                  const theme = activityColorMap[act.category] || activityColorMap.general;
                  return <ExpandableActivityCard key={act.id} act={act} theme={theme} />;
                })}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: ตารางปฏิทินรายเดือน ================= */}
          {viewMode === 'month' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '14px 20px', borderRadius: '18px', border: '1px solid #E5E7EB' }}>
                <button onClick={prevMonth} style={{ border: 'none', background: '#F3F4F6', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold' }}>‹</button>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#1F2937' }}>
                  {THAI_MONTHS[selectedMonth - 1]} {selectedYear + 543}
                </div>
                <button onClick={nextMonth} style={{ border: 'none', background: '#F3F4F6', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold' }}>›</button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '18px', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '12px' }}>
                  {WEEKDAYS.map((w, idx) => (
                    <div key={w} style={{ fontSize: '13px', fontWeight: 700, color: idx === 0 ? '#DC2626' : '#6B7280' }}>
                      {w}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ minHeight: '52px' }} />
                  ))}

                  {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const buddhaDay = monthDaysMap[day];
                    const isSelected = selectedDayDetail && Number(selectedDayDetail.date.split('-')[2]) === day;

                    return (
                      <div
                        key={day}
                        onClick={() => buddhaDay && setSelectedDayDetail(buddhaDay)}
                        style={{
                          minHeight: '58px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '14px',
                          cursor: buddhaDay ? 'pointer' : 'default',
                          backgroundColor: isSelected ? '#FEF2F2' : buddhaDay ? '#FFFDF5' : 'transparent',
                          border: isSelected ? '2px solid #DC2626' : buddhaDay ? '1.5px solid #FDE68A' : '1px solid transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: buddhaDay ? 700 : 500, color: buddhaDay ? '#B91C1C' : '#374151' }}>
                          {day}
                        </span>
                        {buddhaDay && <span style={{ fontSize: '12px', marginTop: '2px' }}>🪷</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDayDetail && (
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '20px', padding: '20px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#D97706' }}>🪷 รายละเอียดวันพระ</span>
                    {selectedDayDetail.isAuspiciousDay && (
                      <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '12px', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        วันมงคล
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#B91C1C' }}>
                    {formatThaiDate(selectedDayDetail.date)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px', marginBottom: '16px' }}>
                    {selectedDayDetail.title}
                  </div>

                  {selectedDayDetail.recommendedActivities?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>
                        กิจกรรมแนะนำประจำวัน (คลิกเพื่อดูกิจกรรม & อานิสงส์):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

          {/* ================= VIEW 3: รายปี ================= */}
          {viewMode === 'year' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B45309 100%)',
                  padding: '24px 28px',
                  color: '#FFFFFF',
                  boxShadow: '0 12px 28px -6px rgba(153, 27, 27, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '30px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      วันพระและวันมงคลตลอดปี
                    </h3>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '30px', fontSize: '18px', fontWeight: 600 }}>
                    ร่มเย็นเป็นสุขตลอดปี
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', opacity: 0.85 }}>วันพระทั้งหมด</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
                      {yearlyStats.totalBuddha} <span style={{ fontSize: '14px', fontWeight: 500 }}>วัน</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', opacity: 0.85 }}>วันพระใหญ่</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
                      {yearlyStats.majorHolidays} <span style={{ fontSize: '14px', fontWeight: 500 }}>วัน</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', opacity: 0.85 }}>วันมงคลฤกษ์ดี</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
                      {yearlyStats.totalAuspicious} <span style={{ fontSize: '14px', fontWeight: 500 }}>วัน</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'ทั้งหมด (12 เดือน)' },
                    { id: 1, label: 'ไตรมาส 1 (ม.ค. - มี.ค.)' },
                    { id: 2, label: 'ไตรมาส 2 (เม.ย. - มิ.ย.)' },
                    { id: 3, label: 'ไตรมาส 3 (ก.ค. - ก.ย.)' },
                    { id: 4, label: 'ไตรมาส 4 (ต.ค. - ธ.ค.)' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveQuarter(filter.id as any)}
                      style={{
                        border: activeQuarter === filter.id ? '1.5px solid #991B1B' : '1px solid #E5E7EB',
                        backgroundColor: activeQuarter === filter.id ? '#FEF2F2' : '#FFFFFF',
                        color: activeQuarter === filter.id ? '#991B1B' : '#4B5563',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: activeQuarter === filter.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  💡 คลิกที่การ์ดเพื่อดูกิจกรรมแนะนำ
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
                {displayedMonths.map((monthNum) => {
                  const monthName = THAI_MONTHS[monthNum - 1];
                  const daysInMonth = yearGroupedData[monthNum] || [];

                  return (
                    <div
                      key={monthNum}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '22px',
                        border: '1px solid #EAEAEA',
                        padding: '18px 20px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                              color: '#92400E',
                              fontWeight: 800,
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {monthNum}
                          </div>
                          <span style={{ fontSize: '17px', fontWeight: 800, color: '#1F2937' }}>
                            {monthName}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: daysInMonth.length > 0 ? '#047857' : '#9CA3AF',
                            backgroundColor: daysInMonth.length > 0 ? '#ECFDF5' : '#F3F4F6',
                            padding: '4px 10px',
                            borderRadius: '12px',
                          }}
                        >
                          {daysInMonth.length} วันพระ
                        </span>
                      </div>

                      {daysInMonth.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#D1D5DB', fontSize: '13px' }}>
                          ไม่มีวันพระในเดือนนี้
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                          {daysInMonth.map((dayItem) => {
                            const dayNum = Number(dayItem.date.split('-')[2]);
                            const isMajor = dayItem.title.includes('บูชา') || dayItem.title.includes('พรรษา') || dayItem.isAuspiciousDay;

                            return (
                              <div
                                key={dayItem.id}
                                onClick={() => setYearModalDay(dayItem)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderRadius: '14px',
                                  backgroundColor: isMajor ? '#FFFBEB' : '#F9FAFB',
                                  border: isMajor ? '1.5px solid #FCD34D' : '1px solid #F3F4F6',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      backgroundColor: isMajor ? '#FEE2E2' : '#FFFFFF',
                                      border: isMajor ? '1px solid #FECACA' : '1px solid #E5E7EB',
                                      color: isMajor ? '#991B1B' : '#374151',
                                      fontWeight: 800,
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {dayNum}
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: isMajor ? '#9A3412' : '#1F2937' }}>
                                      {dayItem.title}
                                    </span>
                                    {dayItem.recommendedActivities?.length > 0 && (
                                      <span style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '1px' }}>
                                        {dayItem.recommendedActivities.length} กิจกรรมแนะนำ
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {isMajor && (
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                                      วันมงคล
                                    </span>
                                  )}
                                  <span style={{ fontSize: '15px' }}>🪷</span>
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

          {/* ================= MODAL SLIDE-UP: รายละเอียดวันพระที่คลิกจากหน้ารายปี ================= */}
          {yearModalDay && (
            <div
              onClick={() => setYearModalDay(null)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 9999,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', color: '#D97706', fontWeight: 700 }}>🪷 รายละเอียดวันพระ</span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#991B1B' }}>
                      {formatThaiDate(yearModalDay.date)}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#4B5563', fontWeight: 500 }}>
                      {yearModalDay.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setYearModalDay(null)}
                    style={{
                      border: 'none',
                      backgroundColor: '#F3F4F6',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#6B7280',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>
                    กิจกรรมแนะนำประจำวัน (คลิกเพื่อดูกิจกรรม & อานิสงส์):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {yearModalDay.recommendedActivities?.length > 0 ? (
                      yearModalDay.recommendedActivities.map((act) => {
                        const theme = activityColorMap[act.category] || activityColorMap.general;
                        return <ExpandableActivityCard key={act.id} act={act} theme={theme} />;
                      })
                    ) : (
                      <div style={{ fontSize: '13px', color: '#9CA3AF' }}>ไม่มีกิจกรรมแนะนำพิเศษ</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setYearModalDay(null)}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#991B1B',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
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