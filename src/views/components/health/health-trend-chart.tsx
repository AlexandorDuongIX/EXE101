import { ChartNoAxesCombined } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import type { HealthChartPoint } from '@/models/health/types';
import { Text } from '@/views/components/ui';
import { AppColors, PrimaryColors } from '@/views/styles/theme';

type HealthTrendChartProps = {
  points: readonly HealthChartPoint[];
  unit: string;
  label: string;
  days: number;
  bloodPressure?: boolean;
  seniorMode?: boolean;
};

function axisDate(timestamp: number, includeTime: boolean) {
  const date = new Date(timestamp);
  const pad = (part: number) => String(part).padStart(2, '0');
  return includeTime ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export function HealthTrendChart({ points, unit, label, days, bloodPressure = false, seniorMode = false }: HealthTrendChartProps) {
  const [width, setWidth] = useState(300);
  const fontSize = seniorMode ? 14 : 12;
  const height = 205;
  const left = 42;
  const right = 14;
  const top = 18;
  const bottom = 36;
  const data = [...points].sort((a, b) => a.timestamp - b.timestamp);

  if (data.length < 2) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}><ChartNoAxesCombined size={28} color={AppColors.action} strokeWidth={1.6} /></View>
        <Text variant={seniorMode ? 'bodyLg' : 'bodyMd'} semiBold align="center">
          {data.length === 0 ? `Chưa có lần đo trong ${days} ngày` : 'Đã có lần đo đầu tiên'}
        </Text>
        <Text variant={seniorMode ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary} align="center" style={styles.emptyCopy}>
          {data.length === 0 ? 'Biểu đồ sẽ xuất hiện khi có ít nhất 2 lần đo của chỉ số này.' : 'Cần thêm ít nhất 1 lần đo để xem thay đổi theo thời gian.'}
        </Text>
      </View>
    );
  }

  const values = data.flatMap((point) => bloodPressure && point.secondaryValue !== undefined ? [point.value, point.secondaryValue] : [point.value]);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const padding = Math.max((highest - lowest) * 0.18, Math.abs(highest) * 0.03, 0.5);
  const minY = Math.max(0, lowest - padding);
  const maxY = highest + padding;
  const firstTime = data[0].timestamp;
  const lastTime = data[data.length - 1].timestamp;
  const availableWidth = Math.max(width - left - right, 1);
  const availableHeight = height - top - bottom;
  const x = (timestamp: number) => firstTime === lastTime ? left + availableWidth / 2 : left + ((timestamp - firstTime) / (lastTime - firstTime)) * availableWidth;
  const y = (value: number) => top + ((maxY - value) / (maxY - minY)) * availableHeight;
  const linePath = (secondary: boolean) => data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.timestamp)} ${y(secondary ? point.secondaryValue ?? point.value : point.value)}`).join(' ');
  const sameDay = new Date(firstTime).toDateString() === new Date(lastTime).toDateString();
  const axisValues = [maxY, (maxY + minY) / 2, minY];
  const lastPoint = data[data.length - 1];
  const formatValue = (value: number) => Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);

  return (
    <View style={styles.chartSection} onLayout={(event) => setWidth(Math.max(event.nativeEvent.layout.width, 160))}>
      {bloodPressure && (
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: AppColors.action }]} /><Text variant={seniorMode ? 'bodyLg' : 'bodySm'}>Tâm thu</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: AppColors.secondary }]} /><Text variant={seniorMode ? 'bodyLg' : 'bodySm'}>Tâm trương</Text></View>
        </View>
      )}
      <View accessible accessibilityRole="image" accessibilityLabel={`Biểu đồ ${label}, ${data.length} lần đo trong ${days} ngày. Đơn vị ${unit}.`}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessible={false}>
          {axisValues.map((value, index) => (
            <ViewlessGrid key={index} value={value} y={y(value)} x1={left} x2={width - right} fontSize={fontSize} />
          ))}
          <Path d={linePath(false)} fill="none" stroke={AppColors.action} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {bloodPressure && <Path d={linePath(true)} fill="none" stroke={AppColors.secondary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
          {data.map((point) => (
            <Circle key={point.id} cx={x(point.timestamp)} cy={y(point.value)} r={3.5} fill={AppColors.surface} stroke={AppColors.action} strokeWidth={2} />
          ))}
          {bloodPressure && data.map((point) => point.secondaryValue !== undefined && (
            <Circle key={point.id} cx={x(point.timestamp)} cy={y(point.secondaryValue)} r={3.5} fill={AppColors.surface} stroke={AppColors.secondary} strokeWidth={2} />
          ))}
          <SvgText x={left} y={height - 10} fontSize={fontSize} fill={AppColors.textSecondary} textAnchor="start">{axisDate(firstTime, sameDay)}</SvgText>
          <SvgText x={width - right} y={height - 10} fontSize={fontSize} fill={AppColors.textSecondary} textAnchor="end">{axisDate(lastTime, sameDay)}</SvgText>
        </Svg>
      </View>
      <View style={styles.caption}>
        <Text variant={seniorMode ? 'bodyLg' : 'bodySm'} color={AppColors.textSecondary}>Gần nhất trong kỳ</Text>
        <Text variant={seniorMode ? 'bodyLg' : 'labelMd'} semiBold color={AppColors.primary}>
          {formatValue(lastPoint.value)}{bloodPressure && lastPoint.secondaryValue !== undefined ? `/${formatValue(lastPoint.secondaryValue)}` : ''} {unit}
        </Text>
      </View>
    </View>
  );
}

function ViewlessGrid({ value, y, x1, x2, fontSize }: { value: number; y: number; x1: number; x2: number; fontSize: number }) {
  return (
    <>
      <Line x1={x1} x2={x2} y1={y} y2={y} stroke={PrimaryColors.borderSubtle} strokeWidth={1} strokeDasharray="4 4" />
      <SvgText x={x1 - 9} y={y + 4} fontSize={fontSize} fill={AppColors.textSecondary} textAnchor="end">{Math.round(value * 10) / 10}</SvgText>
    </>
  );
}

const styles = StyleSheet.create({
  chartSection: { gap: 14 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  caption: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: PrimaryColors.borderSubtle },
  empty: { minHeight: 190, justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 20 },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: PrimaryColors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyCopy: { maxWidth: 280 },
});
