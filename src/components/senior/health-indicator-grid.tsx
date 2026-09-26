import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { StatusBadge, BadgeStatus } from '@/components/ui/status-badge';
import { SeniorIcon } from '@/components/ui/senior-icons';
import { Colors, Rounded, Shadows } from '@/constants/theme';

export interface HealthMetric {
  /** E.g. "Huyết áp" */
  title: string;
  /** E.g. "125/82" */
  value: string;
  /** E.g. "mmHg" */
  unit: string;
  /** Semantic status */
  status: BadgeStatus;
  /** E.g. "Rất Đẹp" or "Bình thường" */
  statusLabel: string;
}

export interface HealthIndicatorGridProps {
  metrics: HealthMetric[];
  /** E.g. "Đo lúc 07:15" */
  measuredAt?: string;
}

export const HealthIndicatorGrid: React.FC<HealthIndicatorGridProps> = ({
  metrics,
  measuredAt,
}) => {
  return (
    <View style={[styles.container, Shadows.layer1]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <SeniorIcon name="heart" size={18} color={Colors.primaryContainer} />
          </View>
          <Text variant="labelMd" bold color={Colors.onSurface}>
            Chỉ số sáng nay
          </Text>
        </View>
        {measuredAt && (
          <Text variant="bodySm" color={Colors.onSurfaceVariant} style={{ fontSize: 12 }}>
            {measuredAt}
          </Text>
        )}
      </View>

      {/* Metrics Grid */}
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <Text variant="bodySm" semiBold color={Colors.onSurfaceVariant}>
              {metric.title}
            </Text>
            <View style={styles.valueRow}>
              <Text variant="headlineMd" bold color={Colors.onSurface} style={styles.value}>
                {metric.value}
              </Text>
              <Text variant="bodySm" color={Colors.onSurfaceVariant} style={styles.unit}>
                {metric.unit}
              </Text>
            </View>
            <StatusBadge label={metric.statusLabel} status={metric.status} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.md,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.default,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
    gap: 4,
  },
  value: {
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 11,
  },
});
