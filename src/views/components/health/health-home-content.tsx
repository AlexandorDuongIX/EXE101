import { Activity, ArrowDown, ArrowUpRight, CalendarDays, ChevronRight, Clock3, Droplets, Heart, HeartPulse, NotebookPen, PenLine, Pill, Scale, Sparkles, Stethoscope, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HealthHomeController, HealthTimelineItem } from '@/controllers/health/use-health-home-controller';
import { formatHealthReading, getHealthMetricUnit, HEALTH_METRIC_LABELS, SYMPTOM_SEVERITY_LABELS } from '@/models/health/health-model';
import type { HealthMetricKind, HealthReading } from '@/models/health/types';
import { useBottomNavigationScroll } from '@/views/components/navigation/bottom-navigation-visibility';
import { Avatar, Button, Card, Text } from '@/views/components/ui';
import { AppColors, HealthColors, PrimaryColors } from '@/views/styles/theme';
import { HealthTrendChart } from './health-trend-chart';

const METRICS = [
  { kind: 'blood-pressure', icon: HeartPulse, color: AppColors.action, surface: PrimaryColors.surface },
  { kind: 'heart-rate', icon: Activity, color: HealthColors.heartRate.accent, surface: HealthColors.heartRate.surface },
  { kind: 'blood-glucose', icon: Droplets, color: HealthColors.bloodGlucose.accent, surface: HealthColors.bloodGlucose.surface },
  { kind: 'weight', icon: Scale, color: HealthColors.weight.accent, surface: HealthColors.weight.surface },
] as const;
const pad = (value: number) => String(value).padStart(2, '0');
function timestamp(value: string) {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())} · ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
function calendarDate(value: string) { const [y, m, d] = value.split('-'); return `${d}/${m}/${y}`; }
function readingNumber(reading: HealthReading) { return reading.kind === 'blood-pressure' ? `${reading.systolic}/${reading.diastolic}` : String(reading.value).replace('.', ','); }

function LatestMetricCard({ kind, reading, senior }: { kind: HealthMetricKind; reading?: HealthReading; senior: boolean }) {
  const config = METRICS.find((metric) => metric.kind === kind)!;
  const Icon = config.icon;
  return (
    <View style={s.metricColumn}><Card elevated={false} style={s.metricCard} testID={`health-latest-${kind}`} accessible accessibilityLabel={reading ? `${HEALTH_METRIC_LABELS[kind]}, gần nhất ${formatHealthReading(reading)}` : `${HEALTH_METRIC_LABELS[kind]}, chưa có lần đo`}>
      <View style={[s.metricIcon, { backgroundColor: config.surface }]}><Icon size={21} color={config.color} strokeWidth={1.8} /></View>
      <Text variant={senior ? 'bodyLg' : 'labelMd'} semiBold color={AppColors.textSecondary}>{HEALTH_METRIC_LABELS[kind]}</Text>
      {reading ? <>
        <Text variant="headlineLg" bold style={[s.metricValue, kind === 'blood-pressure' && { fontSize: 26 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{readingNumber(reading)}</Text>
        <Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>{getHealthMetricUnit(kind, reading.kind === 'blood-glucose' ? reading.unit : undefined)}</Text>
        <View style={s.metricTimestamp}><Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>{timestamp(reading.recordedAt)}</Text>
          {new Date(reading.recordedAt).toDateString() !== new Date().toDateString() && <Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>Chưa đo hôm nay</Text>}
        </View>
      </> : <View style={s.noReading}><Text variant="headlineLg" color={AppColors.border}>—</Text><Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>Chưa có lần đo</Text></View>}
    </Card></View>
  );
}

function TimelineRecord({ item, senior, last }: { item: HealthTimelineItem; senior: boolean; last: boolean }) {
  const reading = item.type === 'reading' ? item.record : undefined;
  const symptoms = item.type === 'symptoms' ? item.record : undefined;
  const metric = reading ? METRICS.find((option) => option.kind === reading.kind) : undefined;
  const Icon = metric?.icon ?? NotebookPen;
  return <View style={s.timelineItem}>
    <View style={s.timelineRail}><View style={[s.timelineIcon, { backgroundColor: metric?.surface ?? PrimaryColors.surface }]}><Icon size={19} color={metric?.color ?? AppColors.action} /></View>{!last && <View style={s.timelineLine} />}</View>
    <View style={s.timelineBody}>
      <Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>{timestamp(item.record.recordedAt)}</Text>
      <Text variant={senior ? 'headlineSm' : 'labelMd'} semiBold>{reading ? HEALTH_METRIC_LABELS[reading.kind] : 'Ghi nhận triệu chứng'}</Text>
      {reading && <Text variant={senior ? 'headlineSm' : 'labelLg'} semiBold color={AppColors.primary}>{formatHealthReading(reading)}</Text>}
      {reading?.kind === 'blood-glucose' && reading.mealContext !== 'unspecified' && <Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>{reading.mealContext === 'fasting' ? 'Lúc đói' : 'Sau ăn'}</Text>}
      {!!reading?.note && <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{reading.note}</Text>}
      {symptoms && <><View style={s.tags}>{symptoms.symptoms.map((symptom, index) => <View key={`${symptom}-${index}`} style={s.tag}><Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.primary}>{symptom}</Text></View>)}</View><Text variant={senior ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>{symptoms.severity === 'none' ? SYMPTOM_SEVERITY_LABELS.none : `Mức độ đã ghi: ${SYMPTOM_SEVERITY_LABELS[symptoms.severity]}`}</Text>{!!symptoms.notes && <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{symptoms.notes}</Text>}</>}
    </View>
  </View>;
}

function NextCareStrip({ controller: c }: { controller: HealthHomeController }) {
  const medication = c.carePlan.nextMedication;
  const appointment = c.carePlan.nextAppointment;
  const next = [
    ...(medication ? [{ kind: 'medication' as const, title: medication.name, detail: `Liều dùng: ${medication.dosage}`, date: medication.date, time: medication.time }] : []),
    ...(appointment ? [{ kind: 'appointment' as const, title: appointment.title, detail: appointment.facility, date: appointment.date, time: appointment.time }] : []),
  ].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
  if (c.role !== 'senior' || !next) return null;
  const Icon = next.kind === 'medication' ? Pill : CalendarDays;
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={next.kind === 'medication' ? 'Mở lịch thuốc tiếp theo' : 'Mở lịch khám tiếp theo'} onPress={() => c.openSchedules(next.kind)} activeOpacity={0.85} style={s.nextCare}>
      <View style={s.careIcon}><Icon size={24} color={AppColors.action} /></View>
      <View style={s.flex}>
        <Text variant="bodyLg" semiBold color={AppColors.primary}>Tiếp theo · {next.time}</Text>
        <Text variant="headlineSm" semiBold>{next.title}</Text>
        <Text variant="bodyLg" color={AppColors.textSecondary}>{next.detail}</Text>
        <Text variant="bodyLg" color={AppColors.textSecondary}>{calendarDate(next.date)}</Text>
      </View>
      <ChevronRight size={22} color={AppColors.action} />
    </TouchableOpacity>
  );
}

export function HealthHomeContent({ controller: c }: { controller: HealthHomeController }) {
  const insets = useSafeAreaInsets();
  const navigationScroll = useBottomNavigationScroll();
  const [expanded, setExpanded] = useState(false);
  const senior = c.role === 'senior';
  const detail = senior ? 'bodyLg' : 'bodySm';
  const timeline = [...c.timeline].sort((a, b) => Date.parse(b.record.recordedAt) - Date.parse(a.record.recordedAt));
  const visibleHistory = expanded ? timeline : timeline.slice(0, 4);
  const today = c.todaySymptoms;
  return (
    <ScrollView {...navigationScroll} testID={senior ? 'senior-home-scroll' : 'family-home-scroll'} style={s.screen} contentContainerStyle={[s.scroll, { paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        <View style={s.hero}>
          <View style={s.heroDecoration} accessible={false}><Heart size={110} color={HealthColors.heroHeartStroke} fill={HealthColors.heroHeartFill} strokeWidth={1.2} /></View>
          <View style={s.heroEyebrow}><View style={s.heroDot} /><Text variant={senior ? 'bodyLg' : 'labelSm'} color={PrimaryColors.border}>{c.dateLabel}</Text></View>
          <Text variant="headlineMd" bold color={AppColors.onPrimary} accessibilityRole="header">{senior ? `Chào ${c.selectedSenior?.fullName ?? 'bạn'}!` : 'Chăm sóc hôm nay'}</Text>
          <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={HealthColors.heroTextSecondary} style={s.heroDescription}>{senior ? 'Các ghi nhận sức khỏe của bạn.' : 'Đồng hành cùng người thân.'}</Text>
          {!!c.selectedSenior && !senior && <View style={s.heroStats}><View style={s.heroStat}><Text variant="headlineSm" bold color={AppColors.onPrimary}>{c.readingsTodayCount}</Text><Text variant={detail} color={HealthColors.heroTextSecondary}>lần đo hôm nay</Text></View><View style={s.heroDivider} /><View style={s.heroStat}><Text variant="headlineSm" bold color={AppColors.onPrimary}>{c.recordedDays}/7</Text><Text variant={detail} color={HealthColors.heroTextSecondary}>ngày có ghi nhận</Text></View></View>}
        </View>
        <NextCareStrip controller={c} />
        {!senior && c.profiles.length > 0 && <View style={s.section}><View style={s.titleRow}><Text variant="labelMd" semiBold color={AppColors.textSecondary}>Đang chăm sóc</Text><Users size={18} color={AppColors.textSecondary} /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recipients}>
          {c.profiles.map((profile) => { const selected = profile.id === c.selectedSenior?.id; return <TouchableOpacity key={profile.id} accessibilityRole="radio" accessibilityLabel={`Chọn người thân ${profile.fullName}`} accessibilityState={{ checked: selected }} aria-checked={selected} onPress={() => { c.selectSenior(profile.id); setExpanded(false); }} activeOpacity={0.8} style={[s.recipient, selected && s.recipientSelected]}><Avatar source={profile.avatarUri} size={36} ringColor={PrimaryColors.border} fallbackBg={PrimaryColors.surface} fallbackIconColor={AppColors.action} /><Text variant="labelMd" semiBold color={selected ? AppColors.primary : AppColors.textSecondary} style={s.recipientName}>{profile.fullName}</Text>{selected && <View style={s.recipientDot} />}</TouchableOpacity>; })}
        </ScrollView></View>}
        {!c.selectedSenior ? <Card elevated={false} style={s.noProfiles}>
          <View style={s.emptyIcon}><Users size={34} color={AppColors.action} strokeWidth={1.7} /></View><Text variant="headlineSm" semiBold align="center">{senior ? 'Chưa có hồ sơ liên kết' : 'Bắt đầu từ một người thân'}</Text><Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary} align="center">{senior ? 'Hồ sơ sức khỏe sẽ xuất hiện sau khi liên kết với gia đình.' : 'Thêm hồ sơ để ghi lại sức khỏe và đồng hành cùng người bạn yêu thương.'}</Text>{!senior && <Button title="Thêm người thân" onPress={c.openFamily} style={s.fullButton} leftIcon={<Users size={20} color={AppColors.onPrimary} />} />}
        </Card> : <>
          {!senior && <View style={s.actions}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ghi chỉ số" onPress={c.openReading} activeOpacity={0.85} style={[s.action, s.readingAction]}><View style={s.actionTop}><PenLine size={25} color={AppColors.action} /><ArrowUpRight size={19} color={AppColors.action} /></View><Text variant="labelLg" semiBold color={AppColors.primary}>Ghi chỉ số</Text><Text variant="bodySm" color={AppColors.textSecondary}>Lưu một lần đo mới</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ghi triệu chứng" onPress={c.openSymptoms} activeOpacity={0.85} style={[s.action, s.symptomAction]}><View style={s.actionTop}><NotebookPen size={25} color={AppColors.secondary} /><ArrowUpRight size={19} color={AppColors.secondary} /></View><Text variant="labelLg" semiBold color={AppColors.secondary}>Ghi triệu chứng</Text><Text variant="bodySm" color={AppColors.textSecondary}>Ghi lại cảm nhận</Text></TouchableOpacity>
          </View>}
          <View style={s.section}><View style={s.titleRow}><View style={s.flex}><Text variant="headlineSm" semiBold accessibilityRole="header">Sức khỏe gần nhất</Text><Text variant={detail} color={AppColors.textSecondary}>Mỗi chỉ số đi kèm thời điểm ghi nhận.</Text></View><HeartPulse size={23} color={AppColors.action} /></View><View style={s.metricGrid}>{METRICS.map(({ kind }) => <LatestMetricCard key={kind} kind={kind} reading={c.latestReadings[kind]} senior={senior} />)}</View></View>

          <Card elevated={false} style={s.card}><View style={s.inlineTitle}><View style={s.diaryIcon}><Sparkles size={20} color={AppColors.action} /></View><Text variant="headlineSm" semiBold accessibilityRole="header">Nhật ký hôm nay</Text></View>
            {today ? <><Text variant={detail} color={AppColors.textSecondary}>Ghi nhận lúc {timestamp(today.recordedAt)}</Text><View style={s.tags}>{today.symptoms.map((symptom, index) => <View key={`${symptom}-${index}`} style={s.tag}><Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.primary}>{symptom}</Text></View>)}</View><Text variant={senior ? 'bodyLg' : 'bodyMd'} semiBold>{today.severity === 'none' ? SYMPTOM_SEVERITY_LABELS.none : `Mức độ đã ghi: ${SYMPTOM_SEVERITY_LABELS[today.severity]}`}</Text>{!!today.notes && <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{today.notes}</Text>}</> : <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>Chưa có ghi nhận triệu chứng hôm nay.</Text>}
          </Card>
          <Card elevated={false} style={s.card}><View style={s.titleRow}><View style={s.flex}><Text variant="headlineSm" semiBold accessibilityRole="header">Nhìn lại theo thời gian</Text><Text variant={detail} color={AppColors.textSecondary}>Các lần đo đã được gia đình ghi lại.</Text></View><Activity size={23} color={AppColors.action} /></View>
            <View style={s.filters}>{METRICS.map(({ kind, icon: Icon }) => { const selected = c.selectedMetric === kind; return <TouchableOpacity key={kind} accessibilityRole="button" accessibilityLabel={`Xem biểu đồ ${HEALTH_METRIC_LABELS[kind]}`} accessibilityState={{ selected }} aria-pressed={selected} onPress={() => c.setSelectedMetric(kind)} style={[s.filter, selected && s.filterSelected]}><Icon size={17} color={selected ? AppColors.onPrimary : AppColors.textSecondary} /><Text variant={senior ? 'bodyLg' : 'bodySm'} semiBold color={selected ? AppColors.onPrimary : AppColors.textSecondary}>{HEALTH_METRIC_LABELS[kind]}</Text></TouchableOpacity>; })}</View>
            <View style={s.range}>{([7, 30, 90] as const).map((days) => <TouchableOpacity key={days} accessibilityRole="button" accessibilityLabel={`${days} ngày`} accessibilityState={{ selected: c.range === days }} aria-pressed={c.range === days} onPress={() => c.setRange(days)} style={[s.rangeButton, c.range === days && s.rangeSelected]}><Text variant={senior ? 'bodyLg' : 'labelSm'} semiBold color={c.range === days ? AppColors.action : AppColors.textSecondary}>{days} ngày</Text></TouchableOpacity>)}</View>
            <View style={s.titleRow}><Text variant={detail} color={AppColors.textSecondary}>{c.chartPoints.length} lần đo</Text><Text variant={detail} color={AppColors.textSecondary}>{c.chartUnit}</Text></View>
            {c.selectedMetric === 'blood-glucose' && <Text variant={detail} color={AppColors.textSecondary}>Các đơn vị đường huyết được theo dõi riêng. Biểu đồ này dùng {c.chartUnit}.</Text>}
            <HealthTrendChart points={c.chartPoints} unit={c.chartUnit} label={HEALTH_METRIC_LABELS[c.selectedMetric]} days={c.range} bloodPressure={c.selectedMetric === 'blood-pressure'} seniorMode={senior} />
          </Card>
          <Card elevated={false} style={s.card}><View style={s.titleRow}><View style={s.flex}><Text variant="headlineSm" semiBold accessibilityRole="header">Lịch sử sức khỏe</Text><Text variant={detail} color={AppColors.textSecondary}>Số đo và triệu chứng theo từng thời điểm.</Text></View><Clock3 size={22} color={AppColors.action} /></View>
            {visibleHistory.length === 0 ? <View style={s.historyEmpty}><NotebookPen size={26} color={AppColors.border} /><Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary} align="center">Chưa có ghi nhận sức khỏe.</Text></View> : <View>{visibleHistory.map((item, index) => <TimelineRecord key={`${item.type}-${item.record.id}`} item={item} senior={senior} last={index === visibleHistory.length - 1} />)}</View>}
            {timeline.length > 4 && <TouchableOpacity accessibilityRole="button" accessibilityLabel={expanded ? 'Thu gọn lịch sử sức khỏe' : `Xem toàn bộ ${timeline.length} ghi nhận`} onPress={() => setExpanded(!expanded)} style={s.more}><Text variant={senior ? 'bodyLg' : 'labelMd'} semiBold color={AppColors.action}>{expanded ? 'Thu gọn' : `Xem toàn bộ ${timeline.length} ghi nhận`}</Text><ArrowDown size={18} color={AppColors.action} style={expanded ? s.rotated : undefined} /></TouchableOpacity>}
          </Card>
          <View style={s.section}><View style={s.titleRow}><View style={s.flex}><Text variant="headlineSm" semiBold accessibilityRole="header">Lịch chăm sóc gần nhất</Text><Text variant={detail} color={AppColors.textSecondary}>{c.carePlan.todayDoseCount} lượt uống thuốc được xếp lịch hôm nay.</Text></View><CalendarDays size={22} color={AppColors.action} /></View>
            {(['medication', 'appointment'] as const).map((kind) => { const medication = kind === 'medication'; const med = medication ? c.carePlan.nextMedication : undefined; const appointment = !medication ? c.carePlan.nextAppointment : undefined; const plan = med ?? appointment; const Icon = medication ? Pill : Stethoscope; return <Card key={kind} elevated={false} style={s.card}>
              <View style={s.titleRow}><View style={s.inlineTitle}><View style={[s.careIcon, !medication && s.appointmentIcon]}><Icon size={22} color={medication ? AppColors.action : AppColors.secondary} /></View><Text variant={senior ? 'headlineSm' : 'labelLg'} semiBold>{medication ? 'Lịch thuốc' : 'Lịch khám'}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={medication ? 'Xem lịch thuốc' : 'Xem lịch khám'} onPress={() => c.openSchedules(kind)} style={s.careLink}><ChevronRight size={23} color={AppColors.action} /></TouchableOpacity></View>
              {plan ? <View style={s.careDetails}><Text variant={senior ? 'headlineSm' : 'labelLg'} semiBold>{med ? med.name : appointment?.title}</Text><Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{med ? `Liều dùng: ${med.dosage}` : appointment?.facility}</Text><View style={s.careTime}><Clock3 size={18} color={AppColors.action} /><Text variant={senior ? 'bodyLg' : 'labelMd'} semiBold color={AppColors.primary}>{plan.time} · {calendarDate(plan.date)}</Text></View>{!!med?.instructions && <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{med.instructions}</Text>}{!!appointment?.doctor && <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{appointment.doctor}</Text>}</View> : <Text variant={senior ? 'bodyLg' : 'bodyMd'} color={AppColors.textSecondary}>{medication ? 'Chưa có lịch uống thuốc sắp tới.' : 'Chưa có buổi khám sắp tới.'}</Text>}
            </Card>; })}
          </View>
        </>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  nextCare: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: PrimaryColors.surface, borderWidth: 1, borderColor: PrimaryColors.border, borderRadius: 24, padding: 18, minHeight: 100 },
  screen: { flex: 1 }, scroll: { paddingHorizontal: 16, paddingTop: 18 }, content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: 24 }, flex: { flex: 1, minWidth: 0, gap: 4 },
  hero: { overflow: 'hidden', backgroundColor: HealthColors.hero, borderRadius: 28, padding: 24, gap: 12 }, heroDecoration: { position: 'absolute', top: 26, right: -22, transform: [{ rotate: '-15deg' }] }, heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: HealthColors.heroAccent }, heroDescription: { maxWidth: 420 }, heroStats: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 8, borderTopWidth: 1, borderTopColor: HealthColors.heroRule, paddingTop: 18 }, heroStat: { flex: 1, minWidth: 0, gap: 2 }, heroDivider: { height: 35, width: 1, backgroundColor: HealthColors.heroDivider },
  section: { gap: 14 }, titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, recipients: { gap: 10, paddingRight: 8 }, recipient: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: PrimaryColors.borderSubtle, borderRadius: 18, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: AppColors.surface, minHeight: 56, maxWidth: 270 }, recipientSelected: { borderColor: PrimaryColors.borderStrong, backgroundColor: PrimaryColors.surface }, recipientName: { flexShrink: 1 }, recipientDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: AppColors.action }, noProfiles: { marginVertical: 0, alignItems: 'center', gap: 16, padding: 24 }, emptyIcon: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: PrimaryColors.surface }, fullButton: { width: '100%', marginTop: 4 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', marginHorizontal: -6, rowGap: 12 }, metricColumn: { width: '50%', paddingHorizontal: 6 }, metricCard: { marginVertical: 0, padding: 16, gap: 7, flexGrow: 1 }, metricIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }, metricValue: { fontSize: 30, lineHeight: 42, letterSpacing: -1 }, metricTimestamp: { gap: 3, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle, paddingTop: 10, marginTop: 5 }, noReading: { minHeight: 93, justifyContent: 'center', gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'stretch', gap: 12 }, action: { flex: 1, minWidth: 0, padding: 16, borderRadius: 22, gap: 7, borderWidth: 1 }, readingAction: { backgroundColor: HealthColors.readingAction.surface, borderColor: HealthColors.readingAction.border }, symptomAction: { backgroundColor: HealthColors.symptomAction.surface, borderColor: HealthColors.symptomAction.border }, actionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }, card: { marginVertical: 0, padding: 20, gap: 16 }, inlineTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }, diaryIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: PrimaryColors.surface }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, tag: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10, backgroundColor: PrimaryColors.surface },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, filter: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: AppColors.surfaceMuted }, filterSelected: { backgroundColor: AppColors.action }, range: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: AppColors.background }, rangeButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 }, rangeSelected: { backgroundColor: AppColors.surface, borderWidth: 1, borderColor: PrimaryColors.border }, historyEmpty: { alignItems: 'center', gap: 12, paddingVertical: 22 }, timelineItem: { flexDirection: 'row', gap: 12 }, timelineRail: { width: 36, alignItems: 'center' }, timelineIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, timelineLine: { width: 1, flex: 1, minHeight: 18, backgroundColor: PrimaryColors.border, marginVertical: 6 }, timelineBody: { flex: 1, minWidth: 0, gap: 5, paddingBottom: 24 }, more: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PrimaryColors.surface, borderRadius: 13, paddingHorizontal: 12 }, rotated: { transform: [{ rotate: '180deg' }] },
  careIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: PrimaryColors.surface }, appointmentIcon: { backgroundColor: AppColors.secondarySoft }, careLink: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: PrimaryColors.surface }, careDetails: { gap: 8 }, careTime: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 3 },
});
