import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { authTheme } from '../../theme/authTheme';
import { BottomSheetScrollView, NativeBottomSheet } from './NativeBottomSheet';

const monthNames = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
];

const maxYear = new Date().getFullYear() - 18;
const minYear = 1950;

export type BirthDateValue = {
  day: number;
  month: number;
  year: number;
};

type AuthDateSheetProps = {
  onClose: () => void;
  onConfirm: (value: BirthDateValue) => void;
  value: BirthDateValue | null;
  visible: boolean;
};

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export function formatBirthDate(value: BirthDateValue) {
  return `${String(value.day).padStart(2, '0')}.${String(value.month).padStart(2, '0')}.${value.year}`;
}

export function AuthDateSheet({
  onClose,
  onConfirm,
  value,
  visible,
}: AuthDateSheetProps) {
  const [selectedDay, setSelectedDay] = useState(value?.day ?? 1);
  const [selectedMonth, setSelectedMonth] = useState(value?.month ?? 1);
  const [selectedYear, setSelectedYear] = useState(value?.year ?? maxYear);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedDay(value?.day ?? 1);
    setSelectedMonth(value?.month ?? 1);
    setSelectedYear(value?.year ?? maxYear);
  }, [value, visible]);

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index);

  return (
    <NativeBottomSheet
      footer={
        <View style={styles.actions}>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
            <Text style={styles.cancelButtonText}>{authTheme.strings.cancel}</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              onConfirm({
                day: selectedDay,
                month: selectedMonth,
                year: selectedYear,
              })
            }
            style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons
              color={authTheme.colors.primaryForeground}
              name="check"
              size={18}
            />
            <Text style={styles.confirmButtonText}>{authTheme.strings.apply}</Text>
          </Pressable>
        </View>
      }
      initialSnapIndex={1}
      onClose={onClose}
      snapPoints={[0.52, 0.68]}
      title={authTheme.strings.dateOfBirth}
      visible={visible}
    >
      <View style={styles.columns}>
        <DateColumn
          items={days.map((day) => ({
            id: String(day),
            label: String(day).padStart(2, '0'),
          }))}
          label={authTheme.strings.day}
          onSelect={(id) => setSelectedDay(Number(id))}
          selectedId={String(selectedDay)}
        />

        <DateColumn
          items={monthNames.map((month, index) => ({
            id: String(index + 1),
            label: month,
          }))}
          label={authTheme.strings.month}
          onSelect={(id) => setSelectedMonth(Number(id))}
          selectedId={String(selectedMonth)}
        />

        <DateColumn
          items={years.map((year) => ({
            id: String(year),
            label: String(year),
          }))}
          label={authTheme.strings.year}
          onSelect={(id) => setSelectedYear(Number(id))}
          selectedId={String(selectedYear)}
        />
      </View>
    </NativeBottomSheet>
  );
}

type DateColumnProps = {
  items: Array<{ id: string; label: string }>;
  label: string;
  onSelect: (id: string) => void;
  selectedId: string;
};

function DateColumn({ items, label, onSelect, selectedId }: DateColumnProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>

      <BottomSheetScrollView
        bounces={false}
        contentContainerStyle={styles.columnContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => {
          const selected = item.id === selectedId;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => [
                styles.columnItem,
                selected && styles.columnItemSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.columnItemText, selected && styles.columnItemTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: authTheme.spacing.sm,
    paddingHorizontal: authTheme.spacing.md,
    paddingBottom: authTheme.spacing.md,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    color: authTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: authTheme.spacing.sm,
    textAlign: 'center',
  },
  columnContent: {
    gap: authTheme.spacing.xs,
    paddingBottom: authTheme.spacing.sm,
  },
  columnItem: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.background,
    borderColor: 'transparent',
    borderRadius: authTheme.radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: authTheme.spacing.sm,
  },
  columnItemSelected: {
    backgroundColor: authTheme.colors.primary20,
    borderColor: authTheme.colors.primary,
  },
  columnItemText: {
    color: authTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  columnItemTextSelected: {
    color: authTheme.colors.primaryForeground,
  },
  actions: {
    flexDirection: 'row',
    gap: authTheme.spacing.sm,
    paddingBottom: authTheme.spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.secondaryButtonBackground,
    borderRadius: authTheme.radii.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: authTheme.sizes.button,
  },
  cancelButtonText: {
    color: authTheme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.primary,
    borderRadius: authTheme.radii.md,
    flex: 1,
    flexDirection: 'row',
    gap: authTheme.spacing.xs,
    justifyContent: 'center',
    minHeight: authTheme.sizes.button,
  },
  confirmButtonText: {
    color: authTheme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.86,
  },
});
