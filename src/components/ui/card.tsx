import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  TouchableOpacityProps,
} from 'react-native';
import { Text } from './text';
import { Colors, Rounded, Shadows } from '@/constants/theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  elevated = true,
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.cardBase,
        elevated && Shadows.layer1,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// --- Health Metric Card Component ---
export interface HealthMetricCardProps extends TouchableOpacityProps {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'alert';
  statusText: string;
  icon?: React.ReactNode;
  loggedBy?: string;
  timeAgo?: string;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit,
  status,
  statusText,
  icon,
  loggedBy,
  timeAgo,
  style,
  ...props
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return Colors.tertiaryContainer;
      case 'alert':
        return Colors.error;
      case 'normal':
      default:
        return Colors.primaryContainer;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.cardBase, Shadows.layer1, styles.healthCard, style]}
      {...props}
    >
      <View style={styles.healthHeader}>
        <View style={styles.titleRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text variant="labelMd" color={Colors.onSurfaceVariant}>
            {title}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text variant="labelSm" bold color={getStatusColor()}>
            {statusText}
          </Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text variant="headlineLg" bold color={Colors.onSurface}>
          {value}{' '}
        </Text>
        <Text variant="bodyMd" color={Colors.outline} style={styles.unitText}>
          {unit}
        </Text>
      </View>

      {(loggedBy || timeAgo) && (
        <View style={styles.footerRow}>
          {loggedBy && (
            <Text variant="bodySm" color={Colors.outline}>
              Cập nhật bởi: <Text variant="bodySm" bold color={Colors.onSurface}>{loggedBy}</Text>
            </Text>
          )}
          {timeAgo && (
            <Text variant="bodySm" color={Colors.outline}>
              {timeAgo}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- Medication Schedule Item Component ---
export interface MedicationScheduleItemProps {
  time: string; // e.g. "08:00 Sáng"
  medicationName: string;
  dosage: string;
  isTaken?: boolean;
  onToggleTaken: () => void;
  instruction?: string;
}

export const MedicationScheduleItem: React.FC<MedicationScheduleItemProps> = ({
  time,
  medicationName,
  dosage,
  isTaken = false,
  onToggleTaken,
  instruction,
}) => {
  return (
    <View style={[styles.cardBase, Shadows.layer1, styles.medicationCard]}>
      <View style={styles.timeBadge}>
        <Text variant="labelSm" bold color={Colors.primaryContainer}>
          {time}
        </Text>
      </View>

      <View style={styles.medContent}>
        <Text
          variant="labelLg"
          bold
          color={isTaken ? Colors.outline : Colors.onSurface}
          style={isTaken && styles.strikethrough}
        >
          {medicationName}
        </Text>
        <Text variant="bodyMd" color={Colors.onSurfaceVariant}>
          Liều lượng: {dosage}
        </Text>
        {instruction && (
          <Text variant="bodySm" color={Colors.outline}>
            {instruction}
          </Text>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggleTaken}
        style={[
          styles.takenButton,
          isTaken ? styles.takenButtonActive : styles.takenButtonInactive,
        ]}
      >
        <Text
          variant="labelSm"
          bold
          color={isTaken ? Colors.onPrimary : Colors.primaryContainer}
        >
          {isTaken ? '✓ Đã uống' : 'Uống thuốc'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: Rounded.md, // 24px
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.08)',
    padding: 20,
    marginVertical: 8,
  },
  healthCard: {
    paddingVertical: 18,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  unitText: {
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Rounded.sm,
    marginRight: 14,
  },
  medContent: {
    flex: 1,
    marginRight: 12,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  takenButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takenButtonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  takenButtonInactive: {
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
});
